import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "dompurify";
import styles from "./EditablePage.module.css";

import { ROLES } from "../../constants/roles";
import EditableToolbar from "../../components/EditableToolbar/EditableToolbar";
import ConfirmModal from "../../components/modals/ConfirmModal/ConfirmModal";
import Loader from "../../components/Loader/Loader";

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
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const draft = useSelector(selectDraftContentBySlug(slug));
  const published = useSelector(selectPublishedContentBySlug(slug));
  const isDraftSaving = useSelector(selectPageDraftSaving);
  const isUpdating = useSelector(selectPageUpdating);
  const isFetching = useSelector(selectPageFetching);

  const [localContent, setLocalContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPageVersions(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    setLocalContent(draft || published || "");
  }, [draft, published]);

  useEffect(() => {
    const hasUnsavedChanges = isEditing && localContent !== (draft || "");

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, localContent, draft]);

  const handleSaveDraft = useCallback(async () => {
    const cleanContent = DOMPurify.sanitize(localContent);
    try {
      await dispatch(saveDraftContent({ slug, content: cleanContent, token })).unwrap();
    } catch (err) {
      console.error("Draft save failed:", err);
    }
  }, [dispatch, localContent, slug, token]);

  useEffect(() => {
    if (!isEditing || isPreviewing) return;
    const interval = setInterval(() => {
      if (localContent !== draft) {
        handleSaveDraft();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [localContent, draft, isEditing, isPreviewing, handleSaveDraft]);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setLocalContent(editorRef.current.innerHTML);
    }
  };

  const handleSave = async () => {
    const cleanContent = DOMPurify.sanitize(localContent);
    try {
      await dispatch(updatePageContent({ slug, content: cleanContent, token })).unwrap();
      setIsEditing(false);
      setIsPreviewing(false);
    } catch (err) {
      console.error("Publish failed:", err);
    }
  };

  const handleCancel = () => {
    if (localContent !== draft) {
      setShowConfirm(true);
      return;
    }
    setIsEditing(false);
    setIsPreviewing(false);
    setLocalContent(draft);
  };

  const confirmDiscardChanges = () => {
    setShowConfirm(false);
    setIsEditing(false);
    setIsPreviewing(false);
    setLocalContent(draft);
  };

  if (isFetching || isDraftSaving || isUpdating) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {(user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN) && (
          <div className={styles.editControls}>
            <button
              className="btn btn-outline"
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            >
              {isEditing ? "Cancel" : "Edit Page"}
            </button>
            {isEditing && (
              <button
                className="btn btn-outline"
                onClick={() => setIsPreviewing((prev) => !prev)}
              >
                {isPreviewing ? "Back to Edit" : "Preview"}
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing && !isPreviewing && (
        <EditableToolbar execCmd={execCmd} editorRef={editorRef} />
      )}

      <div
        ref={editorRef}
        className={`${styles.editable} ${
          isEditing
            ? isPreviewing
              ? styles.staticView
              : styles.editingArea
            : styles.staticView
        }`}
        contentEditable={isEditing && !isPreviewing}
        suppressContentEditableWarning
        onInput={() => {
          if (editorRef.current) {
            setLocalContent(editorRef.current.innerHTML);
          }
        }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(localContent) }}
      />

      {isEditing && !isPreviewing && (
        <div className={styles.bottomSave}>
          <button
            className="btn btn-outline"
            onClick={handleSaveDraft}
            disabled={isDraftSaving}
          >
            Save Draft
          </button>
          <button
            className="btn btn-outline"
            onClick={handleSave}
            disabled={isUpdating}
          >
            Publish
          </button>
        </div>
      )}

      {showConfirm && (
        <ConfirmModal
          message="You have unsaved changes. Discard them?"
          onConfirm={confirmDiscardChanges}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default EditablePage;
