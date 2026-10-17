import React, { useCallback, useRef } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";

const ResizableImageView = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
  getPos,
  editor,
}) => {
  const width = Number.parseInt(node.attrs.width, 10) || 600;
  const rotation = Number(node.attrs.rotation) || 0;
  const dragState = useRef(null);

  const resizeImage = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startWidth = width;

      const onMove = (moveEvent) => {
        const nextWidth = Math.max(
          100,
          Math.min(1200, startWidth + moveEvent.clientX - startX)
        );
        updateAttributes({ width: nextWidth });
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [width, updateAttributes]
  );

  const startDrag = useCallback(
    (event) => {
      // Use the image frame as a drag handle, but don't start dragging
      // when the user presses a rotate/delete/resize control.
      if (event.target.closest("button")) return;
      if (event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();

      const pos = typeof getPos === "function" ? getPos() : undefined;
      if (typeof pos !== "number") return;

      dragState.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        pos,
        moved: false,
      };

      const onMove = (moveEvent) => {
        const state = dragState.current;
        if (!state || moveEvent.pointerId !== state.pointerId) return;

        if (
          Math.abs(moveEvent.clientX - state.startX) > 5 ||
          Math.abs(moveEvent.clientY - state.startY) > 5
        ) {
          state.moved = true;
        }

        if (!state.moved) return;

        const target = document.elementFromPoint(
          moveEvent.clientX,
          moveEvent.clientY
        );
        const targetImage = target?.closest(".blog-inline-image-wrapper");
        const targetPos = targetImage
          ? Number(targetImage.getAttribute("data-image-pos"))
          : NaN;

        const coordinates = editor.view.posAtCoords({
          left: moveEvent.clientX,
          top: moveEvent.clientY,
        });

        if (!coordinates) return;

        // Save the source position in the drag state. The destination is
        // resolved on pointer-up so the document is changed only once.
        state.lastCoords = {
          left: moveEvent.clientX,
          top: moveEvent.clientY,
        };
        state.targetPos = Number.isFinite(targetPos) ? targetPos : null;
      };

      const onUp = (upEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);

        const state = dragState.current;
        dragState.current = null;

        if (!state || !state.moved || !state.lastCoords) return;

        const destination = editor.view.posAtCoords(state.lastCoords);
        if (!destination) return;

        const { state: currentState, dispatch } = editor.view;
        const sourcePos = state.pos;
        const sourceNode = currentState.doc.nodeAt(sourcePos);
        if (!sourceNode || sourceNode.type.name !== "image") return;

        let targetPos = destination.pos;
        if (targetPos > sourcePos) targetPos -= sourceNode.nodeSize;

        targetPos = Math.max(0, Math.min(targetPos, currentState.doc.content.size));
        if (targetPos === sourcePos || targetPos === sourcePos + 1) return;

        const transaction = currentState.tr.delete(
          sourcePos,
          sourcePos + sourceNode.nodeSize
        );
        const safeTarget = Math.max(
          0,
          Math.min(targetPos, transaction.doc.content.size)
        );
        transaction.insert(safeTarget, sourceNode);
        dispatch(transaction.scrollIntoView());
      };

      const onCancel = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onCancel);
        dragState.current = null;
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onCancel);
    },
    [editor, getPos]
  );

  const rotateImage = (amount) => {
    updateAttributes({
      rotation: (rotation + amount + 360) % 360,
    });
  };

  return (
    <NodeViewWrapper
      className={`blog-inline-image-wrapper ${
        selected ? "is-selected" : ""
      }`}
      data-image-pos={typeof getPos === "function" ? getPos() : undefined}
    >
      <div
        className="blog-inline-image-frame"
        style={{
          width: `${width}px`,
          maxWidth: "100%",
          cursor: selected ? "grab" : "default",
          touchAction: "pan-y",
        }}
        onPointerDown={startDrag}
        title={selected ? "Drag to move image within the article" : undefined}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || "Article image"}
          draggable={false}
          className="blog-inline-image"
          style={{
            transform: `rotate(${rotation}deg)`,
            pointerEvents: "none",
          }}
        />

        {selected && (
          <>
            <div className="blog-inline-image-controls">
              <button
                type="button"
                title="Rotate left"
                aria-label="Rotate image left"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => rotateImage(-90)}
              >
                ↶
              </button>

              <button
                type="button"
                title="Rotate right"
                aria-label="Rotate image right"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => rotateImage(90)}
              >
                ↷
              </button>

              <button
                type="button"
                title="Remove image"
                aria-label="Remove image"
                className="blog-inline-image-delete"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={deleteNode}
              >
                ×
              </button>
            </div>

            <button
              type="button"
              className="blog-inline-image-resize"
              aria-label="Resize image"
              title="Drag to resize"
              onPointerDown={(event) => {
                event.stopPropagation();
                resizeImage(event);
              }}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

const ResizableImage = Node.create({
  name: "image",
  group: "block",
  draggable: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },

      width: {
        default: 600,
        parseHTML: (element) =>
          Number.parseInt(element.getAttribute("width"), 10) || 600,
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },

      rotation: {
        default: 0,
        parseHTML: (element) =>
          Number(element.getAttribute("data-rotation")) || 0,
        renderHTML: (attributes) => ({
          "data-rotation": attributes.rotation,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attributes = { ...HTMLAttributes };
    const rotation = Number(attributes["data-rotation"]) || 0;

    attributes.style = [
      attributes.style || "",
      `width:${attributes.width || 600}px`,
      "max-width:100%",
      `transform:rotate(${rotation}deg)`,
      "transform-origin:center center",
    ]
      .filter(Boolean)
      .join(";");

    return ["img", mergeAttributes(attributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

export default ResizableImage;
