import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next"; // 🆕
import styles from "./EditableToolbar.module.css";
import ImageInsertModal from "../modals/ImageInsertModal/ImageInsertModal.jsx";
import TableInsertModal from "../modals/TableInsertModal/TableInsertModal.jsx";
import ClearConfirmModal from "../modals/ClearConfirmModal/ClearConfirmModal.jsx";
import LinkInsertModal from "../modals/LinkInsertModal/LinkInsertModal.jsx";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link, Image, Minus,
  Eraser, Undo, Redo, Superscript, Subscript,
  Table, Paintbrush, Highlighter,
} from "lucide-react";
import { selectPageUpdating } from "../../store/selectors/pageSelectors";

const COLORS = ["#000", "#f00", "#0f0", "#00f", "#ff0", "#ffa500", "#fff", "#999"];

const EditableToolbar = ({ execCmd, editorRef }) => {
  const { t } = useTranslation(); // 🆕
  const isUpdating = useSelector(selectPageUpdating);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTextColors, setShowTextColors] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const savedSelectionRef = useRef(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

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
        restoreSelection();
        const imgTag = `<img src="${imageUrl}" style="max-width:100%;${width ? ` width:${width}px;` : ""}${height ? ` height:${height}px;` : ""}" />`;
        execCmd("insertHTML", imgTag);
        return true;
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
    return false;
  };

  const handleInsertLink = (url) => {
    restoreSelection();
    const selection = window.getSelection();
    const html = !selection || selection.isCollapsed
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
      : `<a href="${url}" target="_blank" rel="noopener noreferrer">${selection.toString()}</a>`;
    execCmd("insertHTML", html);
    setShowLinkModal(false);
  };

  const handleClearFormatting = () => {
    execCmd("removeFormat");
    execCmd("formatBlock", "P");
  };

  const ButtonWithTooltip = ({ title, onClick, children }) => (
    <div className={styles.tooltipWrapper}>
      <button onClick={onClick} disabled={isUpdating}>
        {children}
      </button>
      <span className={styles.tooltip}>{t(title)}</span>
    </div>
  );

  return (
    <>
      <div className={styles.toolbarContainer}>
        {/* Text Formatting */}
        <div className={styles.group}>
          <ButtonWithTooltip title="toolbar.bold" onClick={() => execCmd("bold")}><Bold className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.italic" onClick={() => execCmd("italic")}><Italic className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.underline" onClick={() => execCmd("underline")}><Underline className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.strikethrough" onClick={() => execCmd("strikeThrough")}><Strikethrough className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.superscript" onClick={() => execCmd("superscript")}><Superscript className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.subscript" onClick={() => execCmd("subscript")}><Subscript className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Alignment */}
        <div className={styles.group}>
          <ButtonWithTooltip title="toolbar.alignLeft" onClick={() => execCmd("justifyLeft")}><AlignLeft className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.alignCenter" onClick={() => execCmd("justifyCenter")}><AlignCenter className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.alignRight" onClick={() => execCmd("justifyRight")}><AlignRight className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Headings */}
        <div className={styles.group}>
          <select
            onChange={(e) => execCmd("formatBlock", e.target.value)}
            defaultValue=""
            title={t("toolbar.heading")}
            disabled={isUpdating}
          >
            <option value="" disabled>⬇ {t("toolbar.heading")}</option>
            <option value="P">{t("toolbar.paragraph")}</option>
            <option value="H1">{t("toolbar.heading1")}</option>
            <option value="H2">{t("toolbar.heading2")}</option>
            <option value="H3">{t("toolbar.heading3")}</option>
            <option value="BLOCKQUOTE">{t("toolbar.blockquote")}</option>
            <option value="PRE">{t("toolbar.pre")}</option>
          </select>
        </div>

        {/* Lists and Table */}
        <div className={styles.group}>
          <ButtonWithTooltip title="toolbar.bulletList" onClick={() => execCmd("insertUnorderedList")}><List className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.numberedList" onClick={() => execCmd("insertOrderedList")}><ListOrdered className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.insertTable" onClick={() => { saveSelection(); setShowTableModal(true); }}><Table className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Link, Image, Line */}
        <div className={styles.group}>
          <ButtonWithTooltip title="toolbar.insertLink" onClick={() => { saveSelection(); setShowLinkModal(true); }}><Link className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.insertImage" onClick={() => { saveSelection(); setShowImageModal(true); }}><Image className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.insertLine" onClick={() => execCmd("insertHTML", "<hr />")}><Minus className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>

        {/* Colors */}
        <div className={styles.group}>
          <div className={styles.tooltipWrapper}>
            <button onClick={() => setShowTextColors((prev) => !prev)} disabled={isUpdating}>
              <Paintbrush className={styles.toolbarIcon} />
            </button>
            <span className={styles.tooltip}>{t("toolbar.textColor")}</span>
            {showTextColors && (
              <div className={styles.colorPicker}>
                {COLORS.map((color) => (
                  <button key={color} style={{ backgroundColor: color }} onClick={() => { execCmd("foreColor", color); setShowTextColors(false); }} />
                ))}
              </div>
            )}
          </div>
          <div className={styles.tooltipWrapper}>
            <button onClick={() => setShowBgColors((prev) => !prev)} disabled={isUpdating}>
              <Highlighter className={styles.toolbarIcon} />
            </button>
            <span className={styles.tooltip}>{t("toolbar.highlight")}</span>
            {showBgColors && (
              <div className={styles.colorPicker}>
                {COLORS.map((color) => (
                  <button key={color} style={{ backgroundColor: color }} onClick={() => { execCmd("hiliteColor", color); setShowBgColors(false); }} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Undo, Redo, Clear */}
        <div className={styles.group}>
          <ButtonWithTooltip title="toolbar.undo" onClick={() => execCmd("undo")}><Undo className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.redo" onClick={() => execCmd("redo")}><Redo className={styles.toolbarIcon} /></ButtonWithTooltip>
        </div>
        <div className={styles.group}>
          <ButtonWithTooltip title="toolbar.clearFormatting" onClick={handleClearFormatting}><Eraser className={styles.toolbarIcon} /></ButtonWithTooltip>
          <ButtonWithTooltip title="toolbar.clearAll" onClick={() => setShowConfirmModal(true)}>🧹</ButtonWithTooltip>
        </div>
      </div>

      {showImageModal && <ImageInsertModal onInsert={handleImageInsert} onClose={() => setShowImageModal(false)} />}
      {showTableModal && <TableInsertModal onInsert={(html) => { restoreSelection(); execCmd("insertHTML", html); setShowTableModal(false); }} onClose={() => setShowTableModal(false)} />}
      {showConfirmModal && <ClearConfirmModal onConfirm={() => { editorRef.current.innerHTML = ""; setShowConfirmModal(false); }} onClose={() => setShowConfirmModal(false)} />}
      {showLinkModal && <LinkInsertModal onInsert={handleInsertLink} onClose={() => setShowLinkModal(false)} />}
    </>
  );
};

export default EditableToolbar;
