import styles from "./EditablePage.module.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";
import { getApiBase } from "../../utils/apiBase";

import { ROLES } from "../../constants/roles";
import EditableToolbar from "../../components/EditableToolbar/EditableToolbar";
import ConfirmModal from "../../components/modals/ConfirmModal/ConfirmModal";
import Loader from "../../components/Loader/Loader";
import { showNotification } from "../../store/slices/notificationSlice";
import BaseButton from "../BaseButton/BaseButton";

import {
  fetchPageVersions,
  updatePageContent,
  saveDraftContent,
} from "../../store/thunks/pageThunks";

import {
  selectDraftContentBySlug,
  selectPublishedContentBySlug,
  selectPageDraftSaving,
  selectPageUpdating,
  selectPageFetching,
} from "../../store/selectors/pageSelectors";

const EditablePage = ({ slug, title, placeholder, whiteBackground = true }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const draft = useSelector(selectDraftContentBySlug(slug));
  const published = useSelector(selectPublishedContentBySlug(slug));
  const isDraftSaving = useSelector(selectPageDraftSaving);
  const isUpdating = useSelector(selectPageUpdating);
  const isFetching = useSelector(selectPageFetching);

  const [localContent, setLocalContent] = useState("");
  // const [initialDraft, setInitialDraft] = useState("");
  const [lastPublished, setLastPublished] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const editorRef = useRef(null);
  const debouncedSaveRef = useRef(null);

  const enforceAnchorTargets = useCallback((html) => {
    if (!html) return html;
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      doc.body.querySelectorAll("a[href]").forEach((a) => {
        const href = (a.getAttribute("href") || "").trim();
        if (!href || /^javascript:/i.test(href)) {
          const txt = a.textContent || "";
          a.replaceWith(doc.createTextNode(txt));
          return;
        }
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      });
      return doc.body.innerHTML;
    } catch {
      return html;
    }
  }, []);

  // Ensure legacy <font> tags and align attributes are converted to inline styles
  // before any sanitization removes them. Without this, execCommand output like
  // <div align="center"> or <font color="#0f0"> would lose formatting.
  const normalizeFormatting = useCallback((html) => {
    if (!html) return html;
    try {
      const doc = new DOMParser().parseFromString(html, "text/html");

      doc.body.querySelectorAll("font").forEach((fontEl) => {
        const span = doc.createElement("span");
        const styleParts = [];

        const color = fontEl.getAttribute("color");
        if (color) styleParts.push(`color:${color}`);

        const size = fontEl.getAttribute("size");
        if (size) {
          const map = {
            1: "12px",
            2: "14px",
            3: "16px",
            4: "18px",
            5: "24px",
            6: "32px",
            7: "48px",
          };
          if (map[size]) styleParts.push(`font-size:${map[size]}`);
        }

        const existingStyle = fontEl.getAttribute("style") || "";
        const style = [existingStyle, ...styleParts]
          .map((s) => s.trim())
          .filter(Boolean)
          .join(";");

        if (style) span.setAttribute("style", style);

        while (fontEl.firstChild) {
          span.appendChild(fontEl.firstChild);
        }
        fontEl.replaceWith(span);
      });

      doc.body.querySelectorAll("[align]").forEach((node) => {
        const align = (node.getAttribute("align") || "").toLowerCase();
        if (/^(left|right|center|justify)$/.test(align)) {
          const existing = node.getAttribute("style") || "";
          const style = [existing, `text-align:${align}`]
            .map((s) => s.trim())
            .filter(Boolean)
            .join(";");
          node.setAttribute("style", style);
        }
        node.removeAttribute("align");
      });

      return doc.body.innerHTML;
    } catch {
      return html;
    }
  }, []);

  const normalizeUploadsInHtml = (html) => {
    if (!html) return html;
    const apiBase = getApiBase(); // напр. https://clpit.duckdns.org у проді; "" локально
    const replaceTo = (p1) => (apiBase ? `${apiBase}${p1}` : p1);
    return html
      .replace(
        /https?:\/\/[a-z0-9-]+\.vercel\.app(\/uploads\/[^\s"'<>]+)/gi,
        (_, p1) => replaceTo(p1)
      )
      .replace(
        /\/\/[a-z0-9-]+\.vercel\.app(\/uploads\/[^\s"'<>]+)/gi,
        (_, p1) => replaceTo(p1)
      );
  };

  useEffect(() => {
    dispatch(fetchPageVersions(slug));
  }, [dispatch, slug]);

  const lastSavedRef = useRef(""); // ⬅️ нове: тримаємо останній збережений драфт

  useEffect(() => {
    if (!isEditing) {
      const base = draft ?? published ?? "";
      setLocalContent(base);
      lastSavedRef.current = base; // синхронізуємо опорне значення
    }
  }, [draft, published, isEditing]);

  const handleSaveDraft = useCallback(async () => {
    const normalized = normalizeFormatting(enforceAnchorTargets(localContent));
    const cleanContent = DOMPurify.sanitize(normalized, {
      ADD_ATTR: ["style", "target", "rel", "align"],
      ADD_TAGS: ["font"],
    });
    try {
      await dispatch(
        saveDraftContent({ slug, content: cleanContent })
      ).unwrap();
      lastSavedRef.current = cleanContent;
    } catch (err) {
      console.error("Draft save failed:", err);
    }
  }, [dispatch, localContent, slug, enforceAnchorTargets, normalizeFormatting]);

  useEffect(() => {
    debouncedSaveRef.current = debounce((content) => {
      if (content !== lastSavedRef.current) {
        handleSaveDraft();
      }
    }, 1000);
    return () => debouncedSaveRef.current?.cancel();
  }, [handleSaveDraft]);

  const prevPreviewRef = useRef(false);

  useEffect(() => {
    if (
      isEditing &&
      !isPreviewing &&
      prevPreviewRef.current === true &&
      editorRef.current
    ) {
      editorRef.current.innerHTML = DOMPurify.sanitize(
        enforceAnchorTargets(normalizeUploadsInHtml(localContent)),
        { ADD_ATTR: ["style", "target", "rel"] }
      );
    }
    prevPreviewRef.current = isPreviewing;
  }, [isEditing, isPreviewing, localContent, enforceAnchorTargets]);

  useEffect(() => {
    const hasUnsavedChanges =
      isEditing && localContent !== lastSavedRef.current;
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, localContent]);

  //  Використовуємо execCommand попри deprecated у типах — працює стабільно для нашого кейсу.
  // Повний перехід на Range/Selection або інший редактор заплануємо окремо.
  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setLocalContent(html);
      debouncedSaveRef.current?.(html);
    }
  };

  const placeCursorAtEnd = (el) => {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const handleSave = async () => {
    const normalized = normalizeFormatting(enforceAnchorTargets(localContent));
    const cleanContent = DOMPurify.sanitize(normalized, {
      ADD_ATTR: ["style", "target", "rel", "align"],
      ADD_TAGS: ["font"],
    });

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleanContent;

    const hasVisibleText = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent
          .replace(/\s/g, "")
          .replace(/\u00a0/g, "")
          .replace(/\u200B/g, "");
        return text.length > 0;
      }
      for (const child of node.childNodes) {
        if (hasVisibleText(child)) return true;
      }
      return false;
    };

    if (!hasVisibleText(tempDiv)) {
      dispatch(
        showNotification({
          message: t("editable.emptyContentError"),
          type: "error",
        })
      );
      return;
    }

    try {
      await dispatch(
        updatePageContent({ slug, content: cleanContent })
      ).unwrap();
      lastSavedRef.current = cleanContent;
      setIsEditing(false);
      setIsPreviewing(false);
    } catch (err) {
      console.error("Publish failed:", err);
    }
  };

  const startEditing = () => {
    const base = draft || published || "";
    setIsEditing(true);
    // setInitialDraft(draft || "");
    setLastPublished(published || "");
    lastSavedRef.current = base; // ⬅️ додай це
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = DOMPurify.sanitize(
          normalizeFormatting(
            enforceAnchorTargets(normalizeUploadsInHtml(base))
          ),
          { ADD_ATTR: ["style", "target", "rel", "align"], ADD_TAGS: ["font"] }
        );
      }
    }, 0);
  };

  const handleCancel = () => {
    if (localContent !== lastSavedRef.current) {
      setShowConfirm(true);
      return;
    }

    setIsEditing(false);
    setIsPreviewing(false);
    setLocalContent(lastPublished);
  };

  const handleBackToEdit = () => {
    setIsPreviewing(false);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        placeCursorAtEnd(editorRef.current);
      }
    }, 0);
  };

  const confirmDiscardChanges = () => {
    setShowConfirm(false);
    setIsEditing(false);
    setIsPreviewing(false);
    setLocalContent(lastPublished);
    if (editorRef.current) {
      editorRef.current.innerHTML = DOMPurify.sanitize(
        normalizeFormatting(enforceAnchorTargets(lastPublished || "")),
        { ADD_ATTR: ["style", "target", "rel", "align"], ADD_TAGS: ["font"] }
      );
    }
    dispatch(saveDraftContent({ slug, content: published || "" }));
    lastSavedRef.current = published || "";
  };

  if (isFetching || isUpdating) {
    return <Loader />;
  }

  const isDraftDifferent = draft && draft !== published;

  const insertHTMLAtCursor = (html) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    // Створюємо фрагмент зі вставлюваним HTML
    const container = document.createElement("div");
    container.innerHTML = html;

    const frag = document.createDocumentFragment();
    let node;
    let lastNode = null;
    while ((node = container.firstChild)) {
      lastNode = frag.appendChild(node);
    }

    range.insertNode(frag);

    // Переміщаємо курсор у кінець вставленого
    if (lastNode) {
      range.setStartAfter(lastNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const cb = e.clipboardData || window.clipboardData;
    const html = cb.getData("text/html");
    const text = cb.getData("text/plain");

    let toInsert = "";

    if (html) {
      const doc = new DOMParser().parseFromString(html, "text/html");

      // 1) Unwrap <font color="">
      doc.body.querySelectorAll("font[color]").forEach((el) => {
        el.removeAttribute("color");
        const parent = el.parentNode;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      });

      // після doc = new DOMParser()...
      doc.body.querySelectorAll("a").forEach((a) => {
        const href = (a.getAttribute("href") || "").trim();
        if (!href || /^javascript:/i.test(href)) {
          const txt = a.textContent || "";
          a.replaceWith(doc.createTextNode(txt));
        } else {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          // прибираємо inline-колір, щоб у редакторі було чорним за CSS
          a.style && a.style.removeProperty("color");
        }
      });

      // 2) Прибрати очевидно небезпечне
      doc.body
        .querySelectorAll("script, style, link, meta")
        .forEach((n) => n.remove());
      doc.body.querySelectorAll("*").forEach((el) => {
        const attrs = el.attributes ? Array.from(el.attributes) : [];
        attrs.forEach(({ name }) => {
          if (/^on/i.test(name)) el.removeAttribute(name); // onclick, onload, ...
        });
      });

      // 3) Вирізаємо лише color/background, mso-класи лишнє
      doc.body
        .querySelectorAll("*[style], *[color], *[class]")
        .forEach((el) => {
          if (el.hasAttribute("color")) el.removeAttribute("color");

          if (el.hasAttribute("style")) {
            const cleaned = el
              .getAttribute("style")
              .replace(/(^|;)\s*color\s*:\s*[^;]+;?/gi, "$1")
              .replace(/(^|;)\s*background(?:-color)?\s*:\s*[^;]+;?/gi, "$1")
              .replace(/;;+/g, ";")
              .replace(/^\s*;\s*|\s*;\s*$/g, "");
            cleaned
              ? el.setAttribute("style", cleaned)
              : el.removeAttribute("style");
          }

          const cls = el.getAttribute && el.getAttribute("class");
          if (cls && /\bmso-/i.test(cls)) el.removeAttribute("class");
        });

      // після створення doc і перед toInsert = doc.body.innerHTML;
      doc.body.querySelectorAll("font[size]").forEach((el) => {
        const n = el.getAttribute("size");
        const span = doc.createElement("span");
        const px =
          {
            1: "12px",
            2: "14px",
            3: "16px",
            4: "18px",
            5: "24px",
            6: "32px",
            7: "48px",
          }[n] || "16px";
        span.setAttribute("style", `font-size:${px}`);
        while (el.firstChild) span.appendChild(el.firstChild);
        el.replaceWith(span);
      });

      toInsert = doc.body.innerHTML;
    } else if (text) {
      toInsert = text.replace(/\n/g, "<br>");
    }

    if (!toInsert) return; // ⬅️ ранній вихід

    if (document.activeElement !== editorRef.current) {
      editorRef.current?.focus();
    }

    // Додаткова санітизація під whitelist (узгоджено з бекендом)
    const safe = DOMPurify.sanitize(toInsert, {
      ALLOWED_TAGS: [
        "b",
        "i",
        "u",
        "s",
        "em",
        "strong",
        "p",
        "ul",
        "ol",
        "li",
        "a",
        "br",
        "blockquote",
        "pre",
        "code",
        "h1",
        "h2",
        "h3",
        "hr",
        "img",
        "table",
        "thead",
        "tbody",
        "tr",
        "td",
        "th",
      ],
      // ❗️ масив, не обʼєкт
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "src",
        "width",
        "height",
        "style",
        "alt",
        "colspan",
        "rowspan",
      ],
    });

    insertHTMLAtCursor(safe);

    if (editorRef.current) {
      const htmlNow = editorRef.current.innerHTML;
      setLocalContent(htmlNow);
      debouncedSaveRef.current?.(htmlNow);
    }
  };

  return (
    <section className="layoutContainer">
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {(user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN) && (
            <div className={styles.editControls}>
              <BaseButton
                variant="outline"
                onClick={() => (isEditing ? handleCancel() : startEditing())}
              >
                {isEditing ? t("editable.cancel") : t("editable.edit")}
              </BaseButton>
              {isEditing && (
                <BaseButton
                  variant="outline"
                  onClick={() => {
                    if (isPreviewing) {
                      handleBackToEdit();
                    } else {
                      setIsPreviewing(true);
                    }
                  }}
                >
                  {isPreviewing
                    ? t("editable.backToEdit")
                    : t("editable.preview")}
                </BaseButton>
              )}
            </div>
          )}
        </div>

        {isDraftSaving && (
          <div className={styles.draftBanner}>
            💾 {t("editable.savingDraft")}...
          </div>
        )}

        {isPreviewing && isDraftDifferent && (
          <div className={styles.draftBanner}>
            ⚠️ {t("editable.banner.previewingDraft")}
          </div>
        )}
        {!isEditing && isDraftDifferent && (
          <div className={styles.draftBanner}>
            📝 {t("editable.banner.draftExists")}
          </div>
        )}
        {isPreviewing && !isDraftDifferent && (
          <div className={styles.draftBanner}>
            👀 {t("editable.banner.previewingPublished")}
          </div>
        )}

        {isEditing && !isPreviewing && (
          <EditableToolbar
            execCmd={execCmd}
            editorRef={editorRef}
            authToken={token}
          />
        )}

        {isEditing && !isPreviewing ? (
          <div
            ref={editorRef}
            className={`${styles.editable} ${styles.editingArea} ${
              whiteBackground ? styles.bgWhite : styles.bgTransparent
            }`}
            contentEditable
            suppressContentEditableWarning
            onPaste={handlePaste}
            data-placeholder={placeholder || ""}
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              overflowX: "hidden",
            }}
            onInput={() => {
              if (editorRef.current) {
                const updatedContent = editorRef.current.innerHTML;
                setLocalContent(updatedContent);
                debouncedSaveRef.current?.(updatedContent);
              }
            }}
          />
        ) : (
          <div
            className={`editableContent ${styles.preview}`}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                normalizeFormatting(
                  enforceAnchorTargets(normalizeUploadsInHtml(localContent))
                ),
                {
                  ADD_ATTR: ["style", "target", "rel", "align"],
                  ADD_TAGS: ["font"],
                }
              ),
            }}
          />
        )}

        {isEditing && !isPreviewing && (
          <div className={styles.bottomSave}>
            <BaseButton
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isDraftSaving}
            >
              {t("editable.saveDraft")}
            </BaseButton>
            <BaseButton
              variant="outline"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {t("editable.publish")}
            </BaseButton>
          </div>
        )}

        {showConfirm && (
          <ConfirmModal
            onConfirm={confirmDiscardChanges}
            onClose={() => setShowConfirm(false)}
            title={t("editable.discardTitle")}
            message={t("editable.discardMessage")}
          />
        )}
      </div>
    </section>
  );
};

export default EditablePage;
