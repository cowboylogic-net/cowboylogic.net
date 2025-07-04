import styles from "./EditablePage.module.css";
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "dompurify";
import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";


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

const EditablePage = ({ slug, title }) => {
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
  const [initialDraft, setInitialDraft] = useState("");
  const [lastPublished, setLastPublished] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const editorRef = useRef(null);
  const debouncedSaveRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPageVersions(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    setLocalContent(draft || published || "");
  }, [draft, published]);

  useEffect(() => {
    if (!isEditing) {
      setInitialDraft(draft || "");
    }
  }, [draft, isEditing]);

  const handleSaveDraft = useCallback(async () => {
    const cleanContent = DOMPurify.sanitize(localContent);
    try {
      await dispatch(
        saveDraftContent({ slug, content: cleanContent, token })
      ).unwrap();
      if (editorRef.current) {
        editorRef.current.innerHTML = cleanContent;
      }
    } catch (err) {
      console.error("Draft save failed:", err);
    }
  }, [dispatch, localContent, slug, token]);

  useEffect(() => {
    debouncedSaveRef.current = debounce((content, draftValue) => {
      if (content !== draftValue) {
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
      editorRef.current.innerHTML = DOMPurify.sanitize(localContent);
    }
    prevPreviewRef.current = isPreviewing;
  }, [isEditing, isPreviewing, localContent]);

  useEffect(() => {
    const hasUnsavedChanges = isEditing && localContent !== initialDraft;
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, localContent, initialDraft]);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setLocalContent(editorRef.current.innerHTML);
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
    const cleanContent = DOMPurify.sanitize(localContent);
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
        updatePageContent({ slug, content: cleanContent, token })
      ).unwrap();
      setIsEditing(false);
      setIsPreviewing(false);
    } catch (err) {
      console.error("Publish failed:", err);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setInitialDraft(draft || "");
    setLastPublished(published || "");
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = DOMPurify.sanitize(
          draft || published || ""
        );
      }
    }, 0);
  };

  const handleCancel = () => {
    if (localContent !== initialDraft) {
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
      editorRef.current.innerHTML = DOMPurify.sanitize(lastPublished || "");
    }
    dispatch(saveDraftContent({ slug, content: published || "", token }));
  };

  if (isFetching || isDraftSaving || isUpdating) {
    return <Loader />;
  }

  const isDraftDifferent = draft && draft !== published;

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
          <EditableToolbar execCmd={execCmd} editorRef={editorRef} />
        )}

        {isEditing && !isPreviewing ? (
          <div
            ref={editorRef}
            className={`${styles.editable} ${styles.editingArea}`}
            contentEditable
            suppressContentEditableWarning
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
                debouncedSaveRef.current(updatedContent, initialDraft);
              }
            }}
          />
        ) : (
          <div
            className={`editableContent ${styles.preview}`}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(localContent),
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
