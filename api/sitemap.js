
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://articles.buykit.in";

const escapeXml = (value = "") =>
  String(value).replace(/[<>&'"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  })[char]);

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are missing.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: articles, error } = await supabase
      .from("articles")
      .select("slug, updated_at, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const urls = [
      {
        loc: `${SITE_URL}/`,
        lastmod: new Date().toISOString(),
      },
      ...(articles || [])
        .filter((article) => article.slug)
        .map((article) => ({
          loc: `${SITE_URL}/blog/${encodeURIComponent(article.slug)}`,
          lastmod: article.updated_at || article.created_at,
        })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ loc, lastmod }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}
  </url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation failed:", error);
    return res.status(500).send("Unable to generate sitemap.");
  }
}
