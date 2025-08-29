import { useEffect, useRef, useState } from "react";
import styles from "./UploadAvatar.module.css";
import BaseButton from "../BaseButton/BaseButton";
import { useTranslation } from "react-i18next";

const UploadAvatar = ({ currentAvatar, onUpload }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const resizeImage = (file, maxSize = 200) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * scale;
        const height = img.height * scale;

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            // safeguard: інколи toBlob може повернути null
            if (!blob) {
              resolve(file); // повертаємо оригінал без ресайзу
              return;
            }
            const resizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          "image/jpeg",
          0.8
        );
      };

      img.onerror = reject;
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      try {
        const resized = await resizeImage(selectedFile);
        setFile(resized);
        setPreview(URL.createObjectURL(resized));
      } catch (err) {
        console.error("Image resize failed:", err);
      }
    }
  };

  const handleUploadClick = async () => {
    if (!file || saving) return;
    try {
      setSaving(true);
      await onUpload(file);
      setFile(null);
      // прев’ю оновиться через проп currentAvatar (див. useEffect нижче)
    } finally {
      setSaving(false);
    }
  };

  // синхронізуємо прев’ю, якщо прийшов новий currentAvatar від батька
  useEffect(() => {
    if (currentAvatar) setPreview(currentAvatar);
  }, [currentAvatar]);

  // прибирання blob: URL щоб не текла пам’ять
  useEffect(() => {
    return () => {
      if (
        preview &&
        typeof preview === "string" &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarPreview}>
        {preview ? (
          <img
            src={preview}
            alt={t("profile.avatarPreview", { defaultValue: "Avatar preview" })}
          />
        ) : currentAvatar ? (
          <img
            src={currentAvatar}
            alt={t("profile.currentAvatar", { defaultValue: "Current avatar" })}
          />
        ) : (
          <img
            src="/assets/images/default-avatar.png"
            alt={t("profile.defaultAvatar", { defaultValue: "Default avatar" })}
          />
        )}
      </div>

      <div className={styles.controls}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <BaseButton
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={saving}
        >
          {t("profile.changeAvatar", { defaultValue: "Change Avatar" })}
        </BaseButton>
        {file && (
          <BaseButton
            variant="outline"
            onClick={handleUploadClick}
            disabled={saving}
          >
            {saving
              ? t("common.saving", { defaultValue: "Saving..." })
              : t("profile.saveAvatar", { defaultValue: "Save Avatar" })}
          </BaseButton>
        )}
      </div>
    </div>
  );
};

export default UploadAvatar;
