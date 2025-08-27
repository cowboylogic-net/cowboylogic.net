import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next"; // 🆕
import styles from "./EditableToolbar.module.css";
import ImageInsertModal from "../modals/ImageInsertModal/ImageInsertModal.jsx";
import TableInsertModal from "../modals/TableInsertModal/TableInsertModal.jsx";
import ClearConfirmModal from "../modals/ClearConfirmModal/ClearConfirmModal.jsx";
import LinkInsertModal from "../modals/LinkInsertModal/LinkInsertModal.jsx";
import BaseButton from "../BaseButton/BaseButton";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Minus,
  Eraser,
  Undo,
  Redo,
  Superscript,
  Subscript,
  Table,
  Paintbrush,
  Highlighter,
} from "lucide-react";
import { selectPageUpdating } from "../../store/selectors/pageSelectors";

const COLORS = [
  "#000",
  "#f00",
  "#0f0",
  "#00f",
  "#ff0",
  "#ffa500",
  "#fff",
  "#999",
];
// десь зверху в EditableToolbar.jsx
const FONT_SIZE_MAP = {
  1: "12px",
  2: "14px",
  3: "16px", // “звичайний”
  4: "18px",
  5: "24px",
  6: "32px",
  7: "48px",
};

const normalizeFontTags = (rootEl) => {
  if (!rootEl) return;
  rootEl.querySelectorAll("font[size]").forEach((fontEl) => {
    const n = fontEl.getAttribute("size");
    const span = document.createElement("span");
    const px = FONT_SIZE_MAP[n] || FONT_SIZE_MAP[3];
    span.setAttribute("style", `font-size:${px}`);
    while (fontEl.firstChild) span.appendChild(fontEl.firstChild);
    fontEl.replaceWith(span);
  });
};

const EditableToolbar = ({ execCmd, editorRef, authToken }) => {
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

  const runCmd = (cmd, value) => {
    editorRef?.current?.focus();
    restoreSelection();
    execCmd(cmd, value);
  };

  // зберігаємо selection ДО втрати фокуса кнопкою
  const armSelection = (e) => {
    e.preventDefault();
    saveSelection();
  };

  const armSelectionNoPrevent = () => {
    saveSelection(); // без e.preventDefault()
  };

  const setHighlight = (color) => {
    const supported = (cmd) =>
      typeof document.queryCommandSupported === "function" &&
      document.queryCommandSupported(cmd);

    if (supported("hiliteColor")) {
      runCmd("hiliteColor", color);
      return;
    }
    if (supported("backColor")) {
      runCmd("backColor", color);
    }
  };

  const handleImageInsert = async ({ file, url, width, height }) => {
    try {
      let imageUrl = url?.trim();
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        const endpoint = `${import.meta.env.VITE_API_URL?.replace(
          /\/+$/,
          ""
        )}/images/upload`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: authToken
            ? { Authorization: `Bearer ${authToken}` }
            : undefined,
          body: formData,
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Upload failed ${res.status}. ${txt || "No body"}`);
        }
        const json = await res.json();
        imageUrl = json?.data?.imageUrl || json?.imageUrl;
        // якщо бек віддав відносний шлях — префіксуємо базовим API URL
        const apiBase = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
        if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
          imageUrl = imageUrl.startsWith("/")
            ? `${apiBase}${imageUrl}`
            : `${apiBase}/${imageUrl}`;
        }
      }

      if (imageUrl && editorRef?.current) {
        editorRef.current.focus();
        restoreSelection();
        const w = Number(width) ? ` width:${Number(width)}px;` : "";
        const h = Number(height) ? ` height:${Number(height)}px;` : "";
        const imgTag = `<img src="${imageUrl}" style="max-width:100%;${w}${h}" />`;
        runCmd("insertHTML", imgTag);
        return true;
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
    return false;
  };

  const handleInsertLink = (rawUrl) => {
    if (!rawUrl) return;
    let url = rawUrl.trim();
    // дозволяємо https://, http://, // і mailto:
    if (!/^(https?:\/\/|\/\/|mailto:)/i.test(url)) {
      url = `https://${url}`;
    }
    if (/^javascript:/i.test(url)) return;

    editorRef?.current?.focus();
    restoreSelection();

    const sel = window.getSelection();
    const text = !sel || sel.isCollapsed ? url : sel.toString();
    const html = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    execCmd("insertHTML", html);
    setShowLinkModal(false);
  };

  const handleClearFormatting = () => {
    runCmd("removeFormat");
    runCmd("formatBlock", "P");
  };

  const ButtonWithTooltip = ({ title, onClick, children }) => (
    <div className={styles.tooltipWrapper}>
      <BaseButton
        type="button"
        variant="outline"
        size="small"
        disabled={isUpdating}
        onMouseDown={armSelection} // ⬅️ зберегти виділення ДО кліку
        onClick={onClick}
      >
        {children}
      </BaseButton>
      <span className={styles.tooltip}>{t(title)}</span>
    </div>
  );

  return (
    <>
      <div className={`${styles.toolbarWrapper} layoutContainer`}>
        <div className={styles.toolbarContainer}>
          {/* Text Formatting */}
          <div className={styles.group}>
            <ButtonWithTooltip
              title="toolbar.bold"
              onClick={() => runCmd("bold")}
            >
              <Bold className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.italic"
              onClick={() => runCmd("italic")}
            >
              <Italic className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.underline"
              onClick={() => runCmd("underline")}
            >
              <Underline className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.strikethrough"
              onClick={() => runCmd("strikeThrough")}
            >
              <Strikethrough className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.superscript"
              onClick={() => runCmd("superscript")}
            >
              <Superscript className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.subscript"
              onClick={() => runCmd("subscript")}
            >
              <Subscript className={styles.toolbarIcon} />
            </ButtonWithTooltip>
          </div>

          {/* Alignment */}
          <div className={styles.group}>
            <ButtonWithTooltip
              title="toolbar.alignLeft"
              onClick={() => runCmd("justifyLeft")}
            >
              <AlignLeft className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.alignCenter"
              onClick={() => runCmd("justifyCenter")}
            >
              <AlignCenter className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.alignRight"
              onClick={() => runCmd("justifyRight")}
            >
              <AlignRight className={styles.toolbarIcon} />
            </ButtonWithTooltip>
          </div>

          {/* Font size */}
          <div className={styles.group}>
            <select
              onMouseDown={armSelectionNoPrevent}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val) {
                  runCmd("fontSize", val); // вставляє <font size="N">
                  normalizeFontTags(editorRef?.current); // перетворюємо у <span style="font-size:...">
                  editorRef?.current?.dispatchEvent(
                    new Event("input", { bubbles: true })
                  );
                  e.target.value = ""; // повертаємо плейсхолдер
                }
              }}
              defaultValue=""
              title={t("toolbar.fontSize") /* додай ключ у i18n за бажання */}
              disabled={isUpdating}
            >
              <option value="" disabled>
                ⬇ {t("toolbar.fontSize") || "Font size"}
              </option>
              <option value="2">{t("toolbar.sizeSmall") || "Small"}</option>
              <option value="3">{t("toolbar.sizeNormal") || "Normal"}</option>
              <option value="4">{t("toolbar.sizeLarge") || "Large"}</option>
              <option value="5">{t("toolbar.sizeHuge") || "Huge"}</option>
            </select>
          </div>

          {/* Headings */}
          <div className={styles.group}>
            <select
              onMouseDown={armSelectionNoPrevent}
              onChange={(e) => runCmd("formatBlock", e.target.value)}
              defaultValue=""
              title={t("toolbar.heading")}
              disabled={isUpdating}
            >
              <option value="" disabled>
                ⬇ {t("toolbar.heading")}
              </option>
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
            <ButtonWithTooltip
              title="toolbar.bulletList"
              onClick={() => runCmd("insertUnorderedList")}
            >
              <List className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.numberedList"
              onClick={() => runCmd("insertOrderedList")}
            >
              <ListOrdered className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.insertTable"
              onClick={() => setShowTableModal(true)}
            >
              <Table className={styles.toolbarIcon} />
            </ButtonWithTooltip>
          </div>

          {/* Link, Image, Line */}
          <div className={styles.group}>
            <ButtonWithTooltip
              title="toolbar.insertLink"
              onClick={() => setShowLinkModal(true)}
            >
              <Link className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.insertImage"
              onClick={() => setShowImageModal(true)}
            >
              <Image className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.insertLine"
              onClick={() => runCmd("insertHTML", "<hr />")}
            >
              <Minus className={styles.toolbarIcon} />
            </ButtonWithTooltip>
          </div>

          {/* Colors */}
          <div className={styles.group}>
            <div className={styles.tooltipWrapper}>
              <button
                type="button"
                onMouseDown={armSelection}
                onClick={() => setShowTextColors((prev) => !prev)}
                disabled={isUpdating}
              >
                <Paintbrush className={styles.toolbarIcon} />
              </button>
              <span className={styles.tooltip}>{t("toolbar.textColor")}</span>
              {showTextColors && (
                <div className={styles.colorPicker}>
                  <button
                    type="button"
                    className={styles.resetButton}
                    onMouseDown={armSelection}
                    onClick={() => {
                      runCmd("foreColor", "#1b1b1b");
                      setShowTextColors(false);
                    }}
                  >
                    ✖
                  </button>
                  {COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      style={{ backgroundColor: color }}
                      onMouseDown={armSelection}
                      onClick={() => {
                        runCmd("foreColor", color);
                        setShowTextColors(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className={styles.tooltipWrapper}>
              <button
                type="button"
                onMouseDown={armSelection}
                onClick={() => setShowBgColors((prev) => !prev)}
                disabled={isUpdating}
              >
                <Highlighter className={styles.toolbarIcon} />
              </button>
              <span className={styles.tooltip}>{t("toolbar.highlight")}</span>
              {showBgColors && (
                <div className={styles.colorPicker}>
                  <button
                    type="button"
                    className={styles.resetButton}
                    onMouseDown={armSelection}
                    onClick={() => {
                      setHighlight("transparent");
                      setShowBgColors(false);
                    }}
                  >
                    ✖
                  </button>
                  {COLORS.map((color) => (
                    <button
                      type="button"
                      key={color}
                      style={{ backgroundColor: color }}
                      onMouseDown={armSelection}
                      onClick={() => {
                        setHighlight(color);
                        setShowBgColors(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Undo, Redo, Clear */}
          <div className={styles.group}>
            <ButtonWithTooltip
              title="toolbar.undo"
              onClick={() => runCmd("undo")}
            >
              <Undo className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.redo"
              onClick={() => runCmd("redo")}
            >
              <Redo className={styles.toolbarIcon} />
            </ButtonWithTooltip>
          </div>
          <div className={styles.group}>
            <ButtonWithTooltip
              title="toolbar.clearFormatting"
              onClick={handleClearFormatting}
            >
              <Eraser className={styles.toolbarIcon} />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              title="toolbar.clearAll"
              onClick={() => setShowConfirmModal(true)}
            >
              🧹
            </ButtonWithTooltip>
          </div>
        </div>
      </div>

      {showImageModal && (
        <ImageInsertModal
          onInsert={handleImageInsert}
          onClose={() => setShowImageModal(false)}
        />
      )}
      {showTableModal && (
        <TableInsertModal
          onInsert={(html) => {
            runCmd("insertHTML", html);
            setShowTableModal(false);
          }}
          onClose={() => setShowTableModal(false)}
        />
      )}
      {showConfirmModal && (
        <ClearConfirmModal
          onConfirm={() => {
            editorRef.current?.focus();
            execCmd("selectAll");
            execCmd("delete");
            setShowConfirmModal(false);
          }}
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
