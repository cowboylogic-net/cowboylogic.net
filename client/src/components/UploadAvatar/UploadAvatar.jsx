import { useRef, useState } from "react";
import styles from "./UploadAvatar.module.css";
import BaseButton from "../BaseButton/BaseButton";

const UploadAvatar = ({ currentAvatar, onUpload }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentAvatar);
  const [file, setFile] = useState(null);

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
            const resizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          "image/jpeg",
          0.8 // quality
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
    if (file) {
      await onUpload(file); // ✅ чекаємо
      setFile(null); // ✅ скидаємо стан
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarPreview}>
        {preview ? (
          <img src={preview} alt="Preview" />
        ) : currentAvatar ? (
          <img src={currentAvatar} alt="Current Avatar" />
        ) : (
          <img src="/assets/images/default-avatar.png" alt="Default Avatar" />
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
          onClick={() => fileInputRef.current.click()}
        >
          Change Avatar
        </BaseButton>
        {file && (
          <BaseButton variant="outline" onClick={handleUploadClick}>
            Save Avatar
          </BaseButton>
        )}
      </div>
    </div>
  );
};

export default UploadAvatar;
