import { useState } from "react";
import styles from "./ImageInsertModal.module.css";

const ImageInsertModal = ({ onInsert, onClose }) => {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await onInsert({
      file,
      url: url.trim(),
      width: width.trim(),
      height: height.trim(),
    });

    if (result !== false) {
      setUrl("");
      setPreview("");
      setFile(null);
      setWidth("");
      setHeight("");
      onClose(); // закриваємо лише якщо успішно
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setUrl("");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Choose Image</h3>
        <form onSubmit={handleSubmit}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <p>or</p>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter image URL..."
            disabled={!!file}
          />
          <div className={styles.dimensions}>
            <input
              type="number"
              placeholder="Width (px)"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              disabled={!file && !url}
            />
            <input
              type="number"
              placeholder="Height (px)"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              disabled={!file && !url}
            />
          </div>
          {preview && (
            <img src={preview} alt="Preview" className={styles.preview} />
          )}
          <div className={styles.actions}>
            <button type="submit" className="btn btn-outline">Confirm</button>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageInsertModal;
