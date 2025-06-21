import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ImageInsertModal.module.css";
import BaseButton from "../../BaseButton/BaseButton";

const ImageInsertModal = ({ onInsert, onClose }) => {
  const { t } = useTranslation();

  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [originalSize, setOriginalSize] = useState({ w: null, h: null });
  const [aspectRatio, setAspectRatio] = useState(null);
  const [lockRatio, setLockRatio] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onInsert({
      file,
      url: url.trim(),
      width,
      height,
    });

    if (result !== false) {
      setUrl("");
      setPreview("");
      setFile(null);
      setWidth("");
      setHeight("");
      setOriginalSize({ w: null, h: null });
      setAspectRatio(null);
      onClose();
    }
  };

  const loadImageAndSetMeta = (src) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setOriginalSize({ w, h });
      setAspectRatio(w / h);
      setWidth(w);
      setHeight(h);
    };
    img.src = src;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const previewUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreview(previewUrl);
    setUrl("");
    loadImageAndSetMeta(previewUrl);
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setFile(null);
    setPreview(newUrl);
    loadImageAndSetMeta(newUrl);
  };

  const handleWidthChange = (e) => {
    const newWidth = Number(e.target.value);
    setWidth(newWidth);
    if (lockRatio && aspectRatio && newWidth) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (e) => {
    const newHeight = Number(e.target.value);
    setHeight(newHeight);
    if (lockRatio && aspectRatio && newHeight) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const resetToOriginal = () => {
    setWidth(originalSize.w);
    setHeight(originalSize.h);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{t("modals.chooseImage")}</h3>
        <form onSubmit={handleSubmit}>
          <input type="file" accept="image/*" onChange={handleFileChange} />

          <p className={styles.orText}>{t("modals.or")}</p>

          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder={t("modals.enterUrl")}
            disabled={!!file}
          />

          <div className={styles.dimensions}>
            <input
              type="number"
              placeholder={t("modals.widthPlaceholder")}
              value={width}
              onChange={handleWidthChange}
              disabled={!file && !url}
            />
            <input
              type="number"
              placeholder={t("modals.heightPlaceholder")}
              value={height}
              onChange={handleHeightChange}
              disabled={!file && !url}
            />
          </div>

          {originalSize.w && originalSize.h && (
            <div className={styles.originalSize}>
              {t("modals.originalSize", {
                w: originalSize.w,
                h: originalSize.h,
              })}
              <BaseButton
                type="button"
                variant="small"
                onClick={resetToOriginal}
              >
                {t("modals.reset")}
              </BaseButton>
            </div>
          )}

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={lockRatio}
              onChange={() => setLockRatio(!lockRatio)}
            />
            {t("modals.keepRatio")}
          </label>

          {preview && (
            <img src={preview} alt="Preview" className={styles.preview} />
          )}

          <div className={styles.actions}>
            <BaseButton type="submit" variant="outline">
              {t("modals.confirm")}
            </BaseButton>
            <BaseButton
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t("modals.cancel")}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageInsertModal;
