import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "dompurify";
import styles from "./EditablePage.module.css";

import { ROLES } from "../../constants/roles";
import EditableToolbar from "../../components/EditableToolbar/EditableToolbar";

import {
  fetchPageContent,
  updatePageContent,
} from "../../store/thunks/pageThunks";
import { selectPageContentBySlug } from "../../store/selectors/pageSelectors";

const EditablePage = ({ slug, title }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const content = useSelector(selectPageContentBySlug(slug));
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPageContent(slug));
  }, [dispatch, slug]);

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleSave = async () => {
    const cleanContent = DOMPurify.sanitize(editorRef.current.innerHTML);
    try {
      await dispatch(updatePageContent({ slug, content: cleanContent, token })).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>
        {(user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN) && (
          <div className={styles.editControls}>
            <button
              className="btn btn-outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "❌ Cancel" : "✏️ Edit Page"}
            </button>
          </div>
        )}
      </div>

      {isEditing && <EditableToolbar execCmd={execCmd} editorRef={editorRef} />}

      <div
        ref={editorRef}
        className={`${styles.editable} ${isEditing ? styles.editingArea : styles.staticView}`}
        contentEditable={isEditing}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
      />

      {isEditing && (
        <div className={styles.bottomSave}>
          <button className="btn btn-outline" onClick={handleSave}>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default EditablePage;
