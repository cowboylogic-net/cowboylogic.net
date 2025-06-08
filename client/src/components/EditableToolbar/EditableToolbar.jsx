import { useState } from "react";
import styles from "./EditableToolbar.module.css";
import DOMPurify from "dompurify";
import ImageInsertModal from "../modals/ImageInsertModal/ImageInsertModal.jsx";
import TableInsertModal from "../modals/TableInsertModal/TableInsertModal.jsx";
import ClearConfirmModal from "../modals/ClearConfirmModal/ClearConfirmModal.jsx";
import LinkInsertModal from "../modals/LinkInsertModal/LinkInsertModal.jsx";

import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link, Image, Minus, Eraser,
  Undo, Redo, Superscript, Subscript, Table, Paintbrush, Highlighter
} from "lucide-react";

const COLORS = ["#000", "#f00", "#0f0", "#00f", "#ff0", "#ffa500", "#fff", "#999"];

const EditableToolbar = ({ execCmd, editorRef }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTextColors, setShowTextColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

const handleImageInsert = async ({ file, url, width, height }) => {
  try {
    let imageUrl = url;

    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/images/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
      const data = await res.json();
      imageUrl = data.imageUrl;
    }

    if (imageUrl && editorRef?.current) {
      editorRef.current.focus();
      const imgTag = `<img src="${imageUrl}" style="max-width:100%;${width ? ` width:${width}px;` : ""}${height ? ` height:${height}px;` : ""}" />`;
      execCmd("insertHTML", imgTag);
      return true;
    }
  } catch (err) {
    console.error("Upload failed", err);
  }

  return false;
};


  const handleClearFormatting = () => {
    execCmd("removeFormat");
    execCmd("formatBlock", "P");
  };

  const handleClearAll = () => {
    if (!editorRef?.current) return;
    const plainText = editorRef.current.textContent || "";
    const sanitized = DOMPurify.sanitize(`<p>${plainText}</p>`);
    editorRef.current.innerHTML = sanitized;
    setShowConfirmModal(false);
  };

  const handleInsertCustomTable = (tableHTML) => {
    execCmd("insertHTML", tableHTML);
    setShowTableModal(false);
  };

  const handleInsertLink = (url) => {
    execCmd("createLink", url);
    setShowLinkModal(false);
  };

  const ButtonWithTooltip = ({ title, onClick, children }) => (
    <div className={styles.tooltipWrapper}>
      <button onClick={onClick}>{children}</button>
      <span className={styles.tooltip}>{title}</span>
    </div>
  );

  return (
    <>
      <div className={styles.toolbarContainer}>
        {/* Text styles */}
        <div className={styles.group}>
          <ButtonWithTooltip title="Bold" onClick={() => execCmd("bold")}><Bold className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Italic" onClick={() => execCmd("italic")}><Italic className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Underline" onClick={() => execCmd("underline")}><Underline className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Strikethrough" onClick={() => execCmd("strikeThrough")}><Strikethrough className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Superscript" onClick={() => execCmd("superscript")}><Superscript className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Subscript" onClick={() => execCmd("subscript")}><Subscript className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Alignment */}
        <div className={styles.group}>
          <ButtonWithTooltip title="Align Left" onClick={() => execCmd("justifyLeft")}><AlignLeft className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Align Center" onClick={() => execCmd("justifyCenter")}><AlignCenter className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Align Right" onClick={() => execCmd("justifyRight")}><AlignRight className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Headings */}
        <div className={styles.group}>
          <select onChange={(e) => execCmd("formatBlock", e.target.value)} defaultValue="" title="Headings">
            <option value="" disabled>⬇ Heading</option>
            <option value="P">Paragraph</option>
            <option value="H1">Heading 1</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
            <option value="BLOCKQUOTE">Quote</option>
            <option value="PRE">Code Block</option>
          </select>
        </div>

        {/* Lists & Table */}
        <div className={styles.group}>
          <ButtonWithTooltip title="Bullet List" onClick={() => execCmd("insertUnorderedList")}><List className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Numbered List" onClick={() => execCmd("insertOrderedList")}><ListOrdered className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Insert Table" onClick={() => setShowTableModal(true)}><Table className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Media & Link */}
        <div className={styles.group}>
          <ButtonWithTooltip title="Insert Link" onClick={() => setShowLinkModal(true)}><Link className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Insert Image" onClick={() => setShowImageModal(true)}><Image className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Insert Line" onClick={() => execCmd("insertHorizontalRule")}><Minus className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Colors */}
        <div className={styles.group}>
          <div className={styles.tooltipWrapper}>
            <button onClick={() => setShowTextColors((prev) => !prev)}><Paintbrush className={styles.toolbarIcon} /></button>
            <span className={styles.tooltip}>Text Color</span>
            {showTextColors && (
              <div className={styles.colorPicker}>
                {COLORS.map((color) => (
                  <button key={color} style={{ backgroundColor: color }} onClick={() => {
                    execCmd("foreColor", color);
                    setShowTextColors(false);
                  }} />
                ))}
              </div>
            )}
          </div>

          <div className={styles.tooltipWrapper}>
            <button onClick={() => setShowBgColors((prev) => !prev)}><Highlighter className={styles.toolbarIcon} /></button>
            <span className={styles.tooltip}>Highlight</span>
            {showBgColors && (
              <div className={styles.colorPicker}>
                {COLORS.map((color) => (
                  <button key={color} style={{ backgroundColor: color }} onClick={() => {
                    execCmd("hiliteColor", color);
                    setShowBgColors(false);
                  }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Undo/Redo */}
        <div className={styles.group}>
          <ButtonWithTooltip title="Undo" onClick={() => execCmd("undo")}><Undo className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Redo" onClick={() => execCmd("redo")}><Redo className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Clear */}
        <div className={styles.group}>
          <ButtonWithTooltip title="Clear Formatting" onClick={handleClearFormatting}><Eraser className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="Clear All" onClick={() => setShowConfirmModal(true)}>🧹</ButtonWithTooltip>
        </div>
      </div>

      {/* Modals */}
      {showImageModal && (
        <ImageInsertModal
          onInsert={handleImageInsert}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {showTableModal && (
        <TableInsertModal
          onInsert={handleInsertCustomTable}
          onClose={() => setShowTableModal(false)}
        />
      )}

      {showConfirmModal && (
        <ClearConfirmModal
          onConfirm={handleClearAll}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      {showLinkModal && (
        <LinkInsertModal
          onInsert={handleInsertLink}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </>
  );
};

export default EditableToolbar;
