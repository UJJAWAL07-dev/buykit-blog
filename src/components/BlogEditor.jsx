import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link as LinkExtension } from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { supabase } from "../lib/supabase";
import "./BlogEditor.css";
import "./BlogEditor.preview.css";
import { FaTrashAlt } from "react-icons/fa";

const DRAFT_KEY = "buykit_blog_draft";

const initialFields = {
  title: "",
  subtitle: "",
  author: "",
  category: "",
  coverImage: "",
  tags: "",
};

const categories = [
  "AI & Future Tech",
  "Gadgets & Software",
  "Tech Tools",
  "Internet & Web",
  "Cybersecurity",
  "How-To & Guides",
  "Reviews & Insights",
  "Other",
];

const BlogEditor = () => {
  const [fields, setFields] = useState(initialFields);
  const [tagInput, setTagInput] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class: "blog-editor-content",
        spellcheck: "true",
      },
    },
  });

  useEffect(() => {
    if (!coverImageFile) {
      setCoverImagePreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(coverImageFile);
    setCoverImagePreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [coverImageFile]);

  useEffect(() => {
    if (!editor) return;

    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;

      const draft = JSON.parse(saved);

      if (draft.fields) {
        setFields({ ...initialFields, ...draft.fields });
      }

      if (draft.content) {
        editor.commands.setContent(draft.content);
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [editor]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setFields((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addTags = (rawValue) => {
    const incoming = rawValue
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!incoming.length) return;

    const existing = fields.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const combined = [...existing];

    incoming.forEach((tag) => {
      if (!combined.some((existingTag) => existingTag.toLowerCase() === tag.toLowerCase())) {
        combined.push(tag);
      }
    });

    setFields((previous) => ({ ...previous, tags: combined.join(", ") }));
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    const remaining = fields.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag && tag.toLowerCase() !== tagToRemove.toLowerCase());

    setFields((previous) => ({ ...previous, tags: remaining.join(", ") }));
  };

  const saveDraft = () => {
    if (!editor) return;

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        fields,
        content: editor.getJSON(),
        savedAt: new Date().toISOString(),
      })
    );

    setMessage("Draft saved in this browser.");
  };

  const addLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter the link URL:", previousUrl);

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    try {
      const parsed = new URL(url);

      if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
        setMessage("Please enter a valid HTTP, HTTPS, or email link.");
        return;
      }

      editor.chain().focus().extendMarkRange("link").setLink({
        href: url,
      }).run();
    } catch {
      setMessage("Please enter a valid link URL.");
    }
  };

  const insertTable = () => {
    editor?.chain().focus().insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    }).run();
  };

  const publishArticle = async () => {
    if (!editor || publishing) return;

    setMessage("");

    const title = fields.title.trim();
    const author = fields.author.trim();
    const category = fields.category.trim();
    const content = editor.getJSON();
    const plainText = editor.getText().trim();

    if (!title || !author || !category || !plainText) {
      setMessage(
        "Please enter a title, author, category, and article content."
      );
      return;
    }

    if (title.length > 180 || author.length > 100) {
      setMessage("The title or author name is too long.");
      return;
    }

    const tags = fields.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 15)
      .map((name, index) => ({
        name,
        color: [
          "blue-text-gradient",
          "green-text-gradient",
          "pink-text-gradient",
        ][index % 3],
      }));

    setPublishing(true);

    try {
      let coverImageUrl = "";

      if (coverImageFile) {
        if (!coverImageFile.type.startsWith("image/")) {
          throw new Error("Please choose a valid image file.");
        }

        if (coverImageFile.size > 5 * 1024 * 1024) {
          throw new Error("Cover image must be 5 MB or smaller.");
        }

        const safeFileName = coverImageFile.name
          .normalize("NFKD")
          .replace(/[^a-zA-Z0-9._-]/g, "-");
        const storagePath = `${crypto.randomUUID()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(storagePath, coverImageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: coverImageFile.type,
          });

        if (uploadError) {
          throw new Error(
            "Cover image upload failed. Check the blog-images bucket permissions and try again."
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("blog-images")
          .getPublicUrl(storagePath);

        coverImageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase.functions.invoke(
        "publish-article",
        {
          body: {
            title,
            subtitle: fields.subtitle.trim(),
            author,
            category,
            description: fields.subtitle.trim(),
            cover_image: coverImageUrl,
            content,
            tags,
          },
        }
      );

      if (error) {
        throw new Error(
          "Publishing failed. Please check your connection and try again."
        );
      }

      if (!data?.article?.slug) {
        throw new Error(
          data?.error || "The server did not return the published article."
        );
      }

      localStorage.removeItem(DRAFT_KEY);

      window.location.assign(`/blog/${data.article.slug}`);
    } catch (error) {
      setMessage(
        error.message || "Unable to publish the article. Please try again."
      );
    } finally {
      setPublishing(false);
    }
  };

  if (!editor) {
    return <div className="blog-editor-loading">Loading editor...</div>;
  }

  return (
    <main className="blog-editor-page">
      <header className="blog-editor-header">
        <Link to="/" className="blog-editor-brand">
          <img src="/buykit.jpg" alt="BuyKit" />
          <span>BUYKIT</span>
        </Link>

        <Link to="/" className="blog-editor-back">
          Back to BuyKit
        </Link>
      </header>

      {preview && (
        <div
          className="blog-preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-preview-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreview(false);
          }}
        >
          <div className="blog-preview-window">
            <div className="blog-preview-toolbar">
              <div>
                <span className="blog-preview-label">ARTICLE PREVIEW</span>
                <p>This is a preview. Your article has not been published.</p>
              </div>
              <button
                type="button"
                className="blog-preview-close"
                onClick={() => setPreview(false)}
              >
                Back to Editor ✕
              </button>
            </div>

            <article className="blog-preview-article">
              <div className="blog-preview-category">
                {fields.category || "Technology"}
              </div>
              <h1 id="blog-preview-title">
                {fields.title.trim() || "Your Article Title"}
              </h1>
              {fields.subtitle.trim() && (
                <p className="blog-preview-subtitle">{fields.subtitle.trim()}</p>
              )}
              <div className="blog-preview-meta">
                <span>By {fields.author.trim() || "Your Name"}</span>
                <span>Preview · Not published</span>
              </div>

              {coverImagePreview && (
                <div className="blog-preview-cover">
                  <img src={coverImagePreview} alt="Article cover" />
                </div>
              )}

              <div
                className="blog-preview-body"
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />

              {fields.tags.trim() && (
                <div className="blog-preview-tags">
                  {fields.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag, index) => (
                    <span key={`${tag}-${index}`}>#{tag}</span>
                  ))}
                </div>
              )}
            </article>

            <div className="blog-preview-footer">
              <button
                type="button"
                className="blog-preview-back-button"
                onClick={() => setPreview(false)}
              >
                ← Continue Writing
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="blog-editor-container">
        <div className="blog-editor-heading">
          <p>BUYKIT INSIGHTS</p>
          <h1>Write a Blog</h1>
          <span>
            Share your ideas, discoveries, and perspectives with the world.
          </span>
        </div>

        <section className="blog-editor-details">
          <div className="blog-editor-field">
            <label htmlFor="article-title">Article Title *</label>
            <input
              id="article-title"
              name="title"
              value={fields.title}
              onChange={updateField}
              maxLength={180}
              placeholder="Enter your article title"
              required
            />
          </div>

          <div className="blog-editor-field">
            <label htmlFor="article-subtitle">
              Subtitle / Short Description
            </label>
            <textarea
              id="article-subtitle"
              name="subtitle"
              value={fields.subtitle}
              onChange={updateField}
              maxLength={300}
              rows={2}
              placeholder="What is your article about?"
            />
          </div>

          <div className="blog-editor-fields-grid">
            <div className="blog-editor-field">
              <label htmlFor="article-author">Author Name *</label>
              <input
                id="article-author"
                name="author"
                value={fields.author}
                onChange={updateField}
                maxLength={100}
                placeholder="Your name"
                required
              />
            </div>

            <div className="blog-editor-field">
              <label htmlFor="article-category">Category *</label>
              <select
                id="article-category"
                name="category"
                value={fields.category}
                onChange={updateField}
                required
              >
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="blog-editor-field">
            <label htmlFor="article-cover">Upload Cover Image</label>
            <input
              id="article-cover"
              name="coverImageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) =>
                setCoverImageFile(event.target.files?.[0] || null)
              }
            />
            <small>
              Choose a JPG, PNG, WEBP, or GIF image (maximum 5 MB).
              {coverImageFile ? ` Selected: ${coverImageFile.name}` : ""}
            </small>

            {coverImageFile && (
              <div className="blog-cover-image-selection">
                <img
                  src={coverImagePreview}
                  alt="Selected cover preview"
                  className="blog-cover-image-preview"
                />
                <button
                  type="button"
                  className="blog-cover-image-remove"
                  onClick={() => {
                    setCoverImageFile(null);
                    const input = document.getElementById("article-cover");
                    if (input) input.value = "";
                  }}
                  aria-label="Remove cover image"
                  title="Remove image"
                >
                  <FaTrashAlt />
                </button>
              </div>
            )}
          </div>

          <div className="blog-editor-field">
            <label htmlFor="article-tags">Tags</label>
            <div className="blog-tag-input-wrap">
              {fields.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span className="blog-tag-chip" key={tag.toLowerCase()}>
                    {tag}
                    <button
                      type="button"
                      aria-label={`Remove ${tag} tag`}
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              <input
                id="article-tags"
                value={tagInput}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value.includes(",")) {
                    addTags(value);
                  } else {
                    setTagInput(value);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addTags(tagInput);
                  } else if (
                    event.key === "Backspace" &&
                    !tagInput &&
                    fields.tags.trim()
                  ) {
                    const tags = fields.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
                    if (tags.length) removeTag(tags[tags.length - 1]);
                  }
                }}
                onBlur={() => {
                  if (tagInput.trim()) addTags(tagInput);
                }}
                placeholder={
                  fields.tags
                    ? "Add another tag"
                    : "Type a tag and press comma"
                }
                aria-label="Add article tags"
              />
            </div>
            <small>Press comma or Enter after each tag. Click × to remove a tag.</small>
            <style>{`
              .blog-tag-input-wrap {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 8px;
                min-height: 58px;
                padding: 8px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 10px;
                background: #fff;
              }
              .blog-tag-input-wrap:focus-within {
                border-color: #915eff;
                box-shadow: 0 0 0 1px #915eff;
              }
              .blog-tag-input-wrap input {
                flex: 1 1 180px;
                min-width: 150px;
                width: auto;
                border: 0;
                outline: 0;
                box-shadow: none;
                background: transparent;
                padding: 6px 2px;
              }
              .blog-tag-input-wrap input:focus {
                outline: 0;
                box-shadow: none;
              }
              .blog-tag-chip {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 5px 9px;
                border: 1px solid #d8ccff;
                border-radius: 6px;
                background: #f3efff;
                color: #4c347e;
                font-size: 13px;
                line-height: 1.4;
                overflow-wrap: anywhere;
              }
              .blog-tag-chip button {
                border: 0;
                background: transparent;
                color: #6d4acb;
                cursor: pointer;
                padding: 0;
                font-size: 17px;
                line-height: 1;
              }
            `}</style>
          </div>
        </section>

        <section className="blog-editor-writing">
          <div className="blog-editor-toolbar">
            <select
              aria-label="Text style"
              defaultValue="paragraph"
              onChange={(event) => {
                const value = event.target.value;

                if (value === "paragraph") {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor.chain().focus().toggleHeading({
                    level: Number(value),
                  }).run();
                }
              }}
            >
              <option value="paragraph">Paragraph</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>

            <button
              type="button"
              className={editor.isActive("bold") ? "active" : ""}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold"
            >
              <strong>B</strong>
            </button>

            <button
              type="button"
              className={editor.isActive("italic") ? "active" : ""}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic"
            >
              <em>I</em>
            </button>

            <button
              type="button"
              className={editor.isActive("underline") ? "active" : ""}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
            >
              <u>U</u>
            </button>

            <span className="blog-toolbar-divider" />

            <label className="blog-text-colour" title="Text colour">
              <span>A</span>
              <input
                type="color"
                aria-label="Choose text colour"
                defaultValue="#000000"
                onInput={(event) =>
                  editor.chain().focus().setColor(event.currentTarget.value).run()
                }
              />
            </label>

            <button
              type="button"
              onClick={() =>
                editor.chain().focus().unsetColor().run()
              }
              title="Reset text colour"
            >
              Default colour
            </button>

            <span className="blog-toolbar-divider" />

            <button
              type="button"
              onClick={() =>
                editor.chain().focus().setTextAlign("left").run()
              }
              title="Align left"
            >
              Left
            </button>

            <button
              type="button"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              title="Align centre"
            >
              Centre
            </button>

            <button
              type="button"
              onClick={() =>
                editor.chain().focus().setTextAlign("right").run()
              }
              title="Align right"
            >
              Right
            </button>

            <button
              type="button"
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              title="Justify"
            >
              Justify
            </button>

            <span className="blog-toolbar-divider" />

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bulleted list"
            >
              • List
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              1. List
            </button>

            <button type="button" onClick={addLink} title="Insert link">
              Link
            </button>

            <button type="button" onClick={insertTable} title="Insert table">
              Table
            </button>

            <span className="blog-toolbar-divider" />

            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              ↶
            </button>

            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              ↷
            </button>
          </div>

          <div className="blog-editor-paper">
            <EditorContent editor={editor} />
          </div>
        </section>

        {message && (
          <div className="blog-editor-message" role="status">
            {message}
          </div>
        )}

        <div className="blog-editor-actions">
          <button
            type="button"
            className="blog-editor-secondary"
            onClick={saveDraft}
          >
            Save Draft
          </button>

          <button
            type="button"
            className="blog-editor-secondary"
            onClick={() => setPreview(true)}
          >
            Preview
          </button>

          <button
            type="button"
            className="blog-editor-publish"
            onClick={publishArticle}
            disabled={publishing}
          >
            {publishing ? "Publishing..." : "Publish Article"}
          </button>
        </div>

        <p className="blog-editor-note">
          Drafts are saved in this browser. Publishing makes an article
          available through BuyKit.
        </p>
      </div>
    </main>
  );
};

export default BlogEditor;