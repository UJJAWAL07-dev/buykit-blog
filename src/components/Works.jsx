import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Works.css";
import { FaBookOpen, FaExternalLinkAlt, FaPenNib } from "react-icons/fa";
import Tilt from "react-parallax-tilt";

import { supabase } from "../lib/supabase";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";

const ARTICLES_PER_LOAD = 3;

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
  const text = getPlainText(content);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
};

const formatDate = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];

  const colors = [
    "blue-text-gradient",
    "green-text-gradient",
    "pink-text-gradient",
  ];

  return tags
    .map((tag, index) => {
      if (typeof tag === "string") {
        return {
          name: tag,
          color: colors[index % colors.length],
        };
      }

      if (!tag || typeof tag.name !== "string") {
        return null;
      }

      return {
        name: tag.name,
        color: tag.color || colors[index % colors.length],
      };
    })
    .filter(Boolean);
};

const ArticleCard = ({
  slug,
  title,
  description,
  category,
  date,
  readTime,
  tags,
  image,
}) => {
  return (
    <Link
      to={`/blog/${slug}`}
      className="project-card-shell cursor-pointer"
      aria-label={`Read article: ${title}`}
      style={{
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <Tilt
        tiltMaxAngleX={12}
        tiltMaxAngleY={12}
        scale={1}
        transitionSpeed={450}
        className="project-card"
      >
        <div className="project-image-wrap">
          <img
            src={image}
            alt={title}
            className="project-image"
            loading="lazy"
          />

          <div className="project-action-row">
            <div className="project-link group">
              <FaBookOpen className="project-link-icon" />

              <FaExternalLinkAlt
                className="project-link-arrow"
                aria-hidden="true"
              />

              <span className="project-tooltip">
                Read article
              </span>
            </div>
          </div>
        </div>

        <div className="project-content">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[#915eff] text-[11px] font-bold uppercase tracking-widest font-['Space_Mono']">
              {category}
            </span>

            <span className="text-secondary text-[11px] font-['Space_Mono']">
              {readTime}
            </span>
          </div>

          <h3 className="project-title">
            <FaBookOpen className="project-title-icon" />
            {title}
          </h3>

          <p className="project-description">
            {description}
          </p>

          <p className="text-secondary text-[11px] mt-3 font-['Space_Mono'] opacity-70">
            {date}
          </p>
        </div>

        <div className="project-tags">
          {tags.map((tag, index) => (
            <span
              key={`${slug}-${tag.name}-${index}`}
              className={`project-tag ${tag.color}`}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </Tilt>
    </Link>
  );
};

const Works = () => {
  const [articles, setArticles] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_LOAD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchArticles = async () => {
      setLoading(true);
      setError(false);

      try {
        const { data, error: fetchError } = await supabase
          .from("articles")
          .select(
            "slug, title, description, subtitle, category, cover_image, tags, content, created_at"
          )
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (cancelled) return;

        const formattedArticles = (data || [])
          .filter((article) => article.slug && article.title)
          .map((article) => ({
            slug: article.slug,
            title: article.title,
            description:
              article.description ||
              article.subtitle ||
              "Discover the latest technology insights from BuyKit.",
            category: article.category || "Technology",
            date: formatDate(article.created_at),
            readTime: calculateReadTime(article.content),
            tags: normalizeTags(article.tags),
            image: article.cover_image || "/buykit.jpg",
          }));

        setArticles(formattedArticles);
        setVisibleCount(ARTICLES_PER_LOAD);
      } catch (fetchError) {
        console.error(
          "Failed to fetch published articles:",
          fetchError
        );

        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      cancelled = true;
    };
  }, []);

  const openBlogEditor = () => {
    window.location.href = "/write-blog";
  };

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMoreArticles = visibleCount < articles.length;

  const exploreMore = () => {
    setVisibleCount((currentCount) =>
      Math.min(currentCount + ARTICLES_PER_LOAD, articles.length)
    );
  };

  return (
    <>
      <div className="projects-heading">
        <p
          className={`${styles.sectionSubText} font-["Playfair_Display"] italic tracking-wider`}
        >
          Latest from BuyKit
        </p>

        <h2
          className={`${styles.sectionHeadText} font-["Oswald"] font-bold uppercase tracking-wide`}
        >
          Explore The World Of Tech.
          <FaBookOpen className="inline-block text-[#915eff] ml-3" />
        </h2>
      </div>

      <div className="projects-intro">
        <p>
          Discover stories, insights, guides and ideas from the world of
          technology. From artificial intelligence and gadgets to software,
          digital trends and everything in between, BuyKit brings you
          technology worth knowing.
        </p>
      </div>

      {loading && (
        <p className="mt-10 text-secondary" role="status">
          Loading the latest articles...
        </p>
      )}

      {!loading && error && (
        <p className="mt-10 text-secondary" role="alert">
          We couldn't load the latest articles. Please refresh the page
          and try again.
        </p>
      )}

      {!loading && !error && articles.length === 0 && (
        <p className="mt-10 text-secondary">
          No published articles yet. Be the first to share something!
        </p>
      )}

      {!loading && !error && articles.length > 0 && (
        <>
          <div className="projects-grid">
            {visibleArticles.map((article) => (
              <ArticleCard
                key={article.slug}
                {...article}
              />
            ))}
          </div>

          {hasMoreArticles && (
            <div
              className="flex w-full justify-center"
              style={{ marginTop: "40px" }}
            >
              <button
                type="button"
                onClick={exploreMore}
                className="inline-flex items-center gap-3 rounded-xl border border-[#915eff] bg-transparent px-8 py-4 font-bold uppercase tracking-wide text-white shadow-lg shadow-[#915eff]/10 transition-all duration-300 hover:-translate-y-1 hover:bg-[#915eff] hover:shadow-[#915eff]/30 focus:outline-none focus:ring-2 focus:ring-[#915eff] focus:ring-offset-2 focus:ring-offset-[#050816]"
                aria-label="Load three more articles"
              >
                <FaBookOpen aria-hidden="true" />
                <span>EXPLORE MORE</span>
              </button>
            </div>
          )}
        </>
      )}

      <div
        className="flex w-full flex-col items-center gap-5"
        style={{ marginTop: "30px" }}
      >
        <button
          type="button"
          className="inline-flex items-center justify-center gap-3 rounded-xl border border-[#915eff] bg-transparent px-8 py-4 font-bold uppercase tracking-wide text-white shadow-lg shadow-[#915eff]/10 transition-all duration-300 hover:-translate-y-1 hover:bg-[#915eff] hover:shadow-[#915eff]/30 focus:outline-none focus:ring-2 focus:ring-[#915eff] focus:ring-offset-2 focus:ring-offset-[#050816]"
          onClick={openBlogEditor}
      >
          <FaPenNib aria-hidden="true" />
          <span>PUBLISH YOUR OWN ARTICLE</span>
        </button>
      </div>
    </>
  );
};

export default SectionWrapper(Works, "projects");