import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaClock, FaCalendarAlt } from "react-icons/fa";

import { supabase } from "../lib/supabase";
import "./ArticlePage.css";

const SITE_URL = "https://buykit.in";

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) =>
      typeof tag === "string" ? { name: tag } : tag
    )
    .filter((tag) => tag && typeof tag.name === "string");
};

const getPlainText = (node) => {
  if (!node) return "";

  if (node.type === "text") {
    return node.text || "";
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  return node.content.map(getPlainText).join(" ");
};

const calculateReadTime = (content) => {
  const words = getPlainText(content)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return `${Math.max(1, Math.ceil(words / 200))} min read`;
};

const isSafeLink = (href) => {
  if (typeof href !== "string") return false;

  try {
    const url = new URL(href, SITE_URL);

    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const renderMarks = (text, marks = []) => {
  return marks.reduce((result, mark, index) => {
    const key = `mark-${index}`;

    switch (mark.type) {
      case "bold":
        return <strong key={key}>{result}</strong>;

      case "italic":
        return <em key={key}>{result}</em>;

      case "underline":
        return <u key={key}>{result}</u>;

      case "strike":
        return <s key={key}>{result}</s>;

      case "code":
        return <code key={key}>{result}</code>;

      case "textStyle": {
        const color = mark.attrs?.color;

        if (
          typeof color === "string" &&
          /^#[0-9a-f]{3,8}$/i.test(color)
        ) {
          return (
            <span key={key} style={{ color }}>
              {result}
            </span>
          );
        }

        return result;
      }

      case "link": {
        const href = mark.attrs?.href;

        if (!isSafeLink(href)) {
          return result;
        }

        return (
          <a
            key={key}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noopener noreferrer"
          >
            {result}
          </a>
        );
      }

      default:
        return result;
    }
  }, text);
};

const renderNode = (node, key) => {
  if (!node) return null;

  const children = Array.isArray(node.content)
    ? node.content.map((child, index) =>
        renderNode(child, `${key}-${index}`)
      )
    : [];

  const textAlign = ["left", "center", "right", "justify"].includes(
    node.attrs?.textAlign
  )
    ? node.attrs.textAlign
    : undefined;

  const alignmentStyle = textAlign
    ? { textAlign }
    : undefined;

  switch (node.type) {
    case "doc":
      return <React.Fragment key={key}>{children}</React.Fragment>;

    case "text":
      return (
        <React.Fragment key={key}>
          {renderMarks(node.text || "", node.marks)}
        </React.Fragment>
      );

    case "paragraph":
      return (
        <p key={key} style={alignmentStyle}>
          {children}
        </p>
      );

    case "heading": {
      const level = Math.min(
        3,
        Math.max(1, Number(node.attrs?.level) || 2)
      );

      const Heading = `h${level}`;

      return (
        <Heading key={key} style={alignmentStyle}>
          {children}
        </Heading>
      );
    }

    case "bulletList":
      return <ul key={key}>{children}</ul>;

    case "orderedList":
      return (
        <ol
          key={key}
          start={node.attrs?.start || undefined}
        >
          {children}
        </ol>
      );

    case "listItem":
      return <li key={key}>{children}</li>;

    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;

    case "hardBreak":
      return <br key={key} />;

    case "horizontalRule":
      return <hr key={key} />;

    case "table":
      return (
        <div
          key={key}
          style={{
            width: "100%",
            overflowX: "auto",
            margin: "28px 0",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <tbody>{children}</tbody>
          </table>
        </div>
      );

    case "tableRow":
      return <tr key={key}>{children}</tr>;

    case "tableHeader":
      return (
        <th
          key={key}
          style={{
            border: "1px solid rgba(145, 94, 255, 0.35)",
            padding: "12px",
            textAlign: textAlign || "left",
            background: "rgba(145, 94, 255, 0.12)",
          }}
        >
          {children}
        </th>
      );

    case "tableCell":
      return (
        <td
          key={key}
          style={{
            border: "1px solid rgba(255, 255, 255, 0.12)",
            padding: "12px",
            textAlign: textAlign || "left",
          }}
        >
          {children}
        </td>
      );

    default:
      return null;
  }
};

const ArticlePage = () => {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadArticle = async () => {
      setLoading(true);
      setError("");
      setArticle(null);
      setRelatedArticles([]);

      try {
        const { data, error: fetchError } = await supabase
          .from("articles")
          .select(
            "id, slug, title, subtitle, author, category, description, cover_image, content, tags, published, created_at, updated_at"
          )
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (cancelled) return;

        if (!data) {
          setError("not-found");
          setLoading(false);
          return;
        }

        setArticle(data);

        const { data: related, error: relatedError } = await supabase
          .from("articles")
          .select(
            "slug, title, category, cover_image, description, tags, content, created_at"
          )
          .eq("published", true)
          .neq("slug", data.slug)
          .order("created_at", { ascending: false })
          .limit(3);

        if (!cancelled && !relatedError) {
          setRelatedArticles(related || []);
        }
      } catch (fetchError) {
        console.error("Unable to load article:", fetchError);

        if (!cancelled) {
          setError("load-error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadArticle();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!article) return;

    const title = `${article.title} | BuyKit`;
    const description = (
      article.description ||
      article.subtitle ||
      `Read ${article.title} on BuyKit.`
    )
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

    const canonicalUrl = `${SITE_URL}/blog/${encodeURIComponent(article.slug)}`;

    document.title = title;

    const setMeta = (attribute, key, content) => {
      let element = document.head.querySelector(
        `meta[${attribute}="${key}"]`
      );

      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }

      element.setAttribute("content", content);
    };

    setMeta("name", "description", description);
    setMeta("property", "og:type", "article");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:site_name", "BuyKit");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    if (article.cover_image) {
      setMeta("property", "og:image", article.cover_image);
      setMeta("name", "twitter:image", article.cover_image);
    }

    let canonical = document.head.querySelector(
      'link[rel="canonical"]'
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalUrl;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description,
      mainEntityOfPage: canonicalUrl,
      url: canonicalUrl,
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: {
        "@type": "Person",
        name: article.author || "BuyKit Editorial Team",
      },
      publisher: {
        "@type": "Organization",
        name: "BuyKit",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/buykit.jpg`,
        },
      },
      ...(article.cover_image
        ? { image: [article.cover_image] }
        : {}),
      ...(article.category
        ? { articleSection: article.category }
        : {}),
      ...(getTags(article.tags).length
        ? {
            keywords: getTags(article.tags)
              .map((tag) => tag.name)
              .join(", "),
          }
        : {}),
    };

    let jsonLd = document.getElementById("article-json-ld");

    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.id = "article-json-ld";
      jsonLd.type = "application/ld+json";
      document.head.appendChild(jsonLd);
    }

    jsonLd.textContent = JSON.stringify(structuredData);

    return () => {
      document.getElementById("article-json-ld")?.remove();
    };
  }, [article]);

  if (loading) {
    return (
      <div className="article-not-found" role="status">
        <h1>Loading Article...</h1>
        <p>Please wait while we retrieve the article.</p>
      </div>
    );
  }

  if (error === "not-found") {
    return (
      <div className="article-not-found">
        <h1>Article Not Found</h1>
        <p>This article does not exist or is not published.</p>

        <Link to="/">
          <FaArrowLeft />
          Back to BuyKit
        </Link>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="article-not-found">
        <h1>Unable to Load Article</h1>
        <p>
          We couldn't retrieve this article. Please check your connection
          and try again.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{ color: "#915eff" }}
        >
          Try Again
        </button>

        <Link to="/">
          <FaArrowLeft />
          Back to BuyKit
        </Link>
      </div>
    );
  }

  const tags = getTags(article.tags);
  const readTime = calculateReadTime(article.content);
  const publicationDate = formatDate(article.created_at);

  return (
    <div className="article-page">
      <header className="article-navbar">
        <Link to="/" className="article-back">
          <FaArrowLeft />
          Back to BuyKit
        </Link>

        <Link to="/" className="article-brand">
          <img src="/buykit.jpg" alt="BuyKit" />
          <span>BUYKIT</span>
        </Link>
      </header>

      <main className="article-container">
        <div className="article-category">
          {article.category}
        </div>

        <h1 className="article-title">
          {article.title}
        </h1>

        {(article.subtitle || article.description) && (
          <p className="article-description">
            {article.subtitle || article.description}
          </p>
        )}

        <div className="article-meta">
          {article.author && (
            <span>
              By {article.author}
            </span>
          )}

          {publicationDate && (
            <span>
              <FaCalendarAlt aria-hidden="true" />
              {publicationDate}
            </span>
          )}

          <span>
            <FaClock aria-hidden="true" />
            {readTime}
          </span>
        </div>

        {article.cover_image && (
          <div className="article-hero">
            <img
              src={article.cover_image}
              alt={article.title}
              fetchPriority="high"
            />
          </div>
        )}

        <article className="article-body">
          {article.content &&
          Array.isArray(article.content.content) ? (
            article.content.content.map((node, index) =>
              renderNode(node, `article-${index}`)
            )
          ) : (
            <p>This article has no readable content yet.</p>
          )}
        </article>

        {tags.length > 0 && (
          <div className="article-tags">
            {tags.map((tag, index) => (
              <span key={`${tag.name}-${index}`}>
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {relatedArticles.length > 0 && (
          <section className="related-articles">
            <div className="related-heading">
              <p>KEEP EXPLORING</p>

              <h2>More From BuyKit.</h2>
            </div>

            <div className="related-grid">
              {relatedArticles.map((item) => (
                <Link
                  key={item.slug}
                  to={`/blog/${item.slug}`}
                  className="related-card"
                >
                  {item.cover_image && (
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      loading="lazy"
                    />
                  )}

                  <div>
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ArticlePage;