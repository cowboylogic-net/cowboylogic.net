import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";

import {
  createBook,
  updateBook,
  fetchBookById,
} from "../../store/thunks/bookThunks";
import {
  selectSelectedBook,
  selectLoadingFlags,
} from "../../store/selectors/bookSelectors";

import { bookFormSchema } from "../../validation/formSchemas";

import styles from "./BookForm.module.css";
import ImageInsertModal from "../modals/ImageInsertModal/ImageInsertModal";
import Loader from "../Loader/Loader";
import BaseButton from "../BaseButton/BaseButton";
import BaseInput from "../BaseInput/BaseInput";
import BaseTextarea from "../BaseTextarea/BaseTextarea";
import BaseForm from "../BaseForm/BaseForm";
import FormGroup from "../FormGroup/FormGroup";
import BaseCheckbox from "../BaseCheckbox/BaseCheckbox";
import BaseSelect from "../BaseSelect/BaseSelect";

const BOOK_IMAGE_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const BOOK_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const BOOK_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const BOOK_IMAGE_MAX_SIZE_MB = BOOK_IMAGE_MAX_SIZE_BYTES / (1024 * 1024);
const normalizeImageUrlForSubmit = (raw) => {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (/^https?:/i.test(v)) return v;

  if (v.startsWith("uploads/")) return `/${v}`;

  return v;
};

const BookForm = ({ onSuccess, onError }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCreating, isUpdating, isFetchingById } =
    useSelector(selectLoadingFlags);
  const error = useSelector((state) => state.books.error);
  const selectedBook = useSelector(selectSelectedBook);

  const schema = bookFormSchema(t);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      price: "",
      partnerPrice: "",
      imageUrl: "",
      inStock: true,
      stock: 0,
    },
  });

  const [image, setImage] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [previewHasError, setPreviewHasError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const previewObjectUrlRef = useRef(null);

  const formatValue = watch("format");
  const previewSrc =
    image?.kind === "newFile" ? filePreviewUrl : image?.value || "";

  const revokePreviewObjectUrl = () => {
    if (!previewObjectUrlRef.current) return;
    URL.revokeObjectURL(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;
  };

  const validateImageFile = (file) => {
    if (!BOOK_IMAGE_ALLOWED_TYPES.has(file.type)) {
      onError?.(
        t("bookForm.imageInvalidType", {
          defaultValue: "Unsupported image type. Use JPEG, PNG, or WEBP.",
        }),
      );
      return false;
    }

    if (file.size > BOOK_IMAGE_MAX_SIZE_BYTES) {
      onError?.(
        t("bookForm.imageTooLarge", {
          maxSizeMb: BOOK_IMAGE_MAX_SIZE_MB,
          defaultValue: `Image is too large. Maximum size is ${BOOK_IMAGE_MAX_SIZE_MB}MB.`,
        }),
      );
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchBookById(id));
    }
  }, [dispatch, isEditMode, id]);

  useEffect(() => {
    return () => {
      if (!previewObjectUrlRef.current) return;
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isEditMode && selectedBook) {
      revokePreviewObjectUrl();
      reset({
        title: selectedBook.title,
        author: selectedBook.author,
        description: selectedBook.description || "",
        price: selectedBook.price,
        partnerPrice: selectedBook.partnerPrice || "",
        imageUrl: selectedBook.imageUrl || "",
        inStock: selectedBook.inStock,
        stock: selectedBook.stock ?? 0,
        format: selectedBook.format || "PAPERBACK",
        displayOrder: selectedBook.displayOrder ?? 0,
        amazonUrl: selectedBook.amazonUrl || "",
        downloadUrl: selectedBook.downloadUrl || "",
      });
      setImage(
        selectedBook.imageUrl
          ? { kind: "existingUrl", value: selectedBook.imageUrl }
          : null,
      );
      setFilePreviewUrl("");
      setPreviewHasError(false);
    }
  }, [selectedBook, reset, isEditMode]);

  useEffect(() => {
    if (formatValue === "KINDLE_AMAZON") {
      setValue("downloadUrl", "");
    }
  }, [formatValue, setValue]);

  const handleImageInsert = ({ file, url }) => {
    if (file) {
      if (!validateImageFile(file)) return false;

      revokePreviewObjectUrl();
      const nextPreviewUrl = URL.createObjectURL(file);
      previewObjectUrlRef.current = nextPreviewUrl;

      setImage({ kind: "newFile", value: file });
      setFilePreviewUrl(nextPreviewUrl);
      setValue("imageUrl", "");
      setPreviewHasError(false);
      return true;
    }

    if (url) {
      const trimmedUrl = url.trim();
      revokePreviewObjectUrl();
      setImage({ kind: "existingUrl", value: trimmedUrl });
      setFilePreviewUrl("");
      setValue("imageUrl", trimmedUrl);
      setPreviewHasError(false);
      return true;
    }

    return false;
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    const parsedPrice = parseFloat(data.price);
    const parsedStock = parseInt(data.stock, 10);

    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedStock)) {
      onError?.(t("bookForm.invalidPriceOrStock"));
      return;
    }

    if (data.partnerPrice) {
      formData.append("partnerPrice", parseFloat(data.partnerPrice));
    }

    formData.append("title", data.title);
    formData.append("author", data.author);
    formData.append("description", data.description);
    formData.append("price", parsedPrice.toFixed(2));
    formData.append("stock", parsedStock);
    formData.append("inStock", !!data.inStock);
    formData.append("isWholesaleAvailable", true);
    formData.append("format", data.format);
    formData.append("displayOrder", Number(data.displayOrder) || 0);

    if (data.amazonUrl) {
      formData.append("amazonUrl", data.amazonUrl.trim());
    }

    if (data.downloadUrl && data.format !== "KINDLE_AMAZON") {
      formData.append("downloadUrl", data.downloadUrl.trim());
    }

    const originalImageUrl = normalizeImageUrlForSubmit(selectedBook?.imageUrl);

    if (image?.kind === "newFile" && image.value) {
      formData.append("image", image.value);
    } else if (image?.kind === "existingUrl") {
      const nextImageUrl = normalizeImageUrlForSubmit(image.value);

      const shouldSendImageUrl =
        !isEditMode || nextImageUrl !== originalImageUrl;

      if (nextImageUrl && shouldSendImageUrl) {
        formData.append("imageUrl", nextImageUrl);
      }
    }

    try {
      if (isEditMode && id) {
        await dispatch(updateBook({ id, formData })).unwrap();
        onSuccess?.(t("bookForm.successUpdate"));
      } else {
        await dispatch(createBook(formData)).unwrap();
        onSuccess?.(t("bookForm.successCreate"));
      }
      navigate("/bookstore");
    } catch (err) {
      onError?.(err || t("bookForm.failSave"));
    }
  };

  if (isEditMode && isFetchingById) {
    return (
      <div className={styles.loadingState}>
        <Loader />
      </div>
    );
  }
  if (isEditMode && !selectedBook && !isFetchingById)
    return <p className={styles.error}>{t("bookForm.notFound")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.bookForm}>
      <h2>{isEditMode ? t("bookForm.edit") : t("bookForm.add")}</h2>

      <BaseForm onSubmit={handleSubmit(onSubmit)}>
        <FormGroup
          className={styles.group}
          label={t("bookForm.title")}
          error={errors.title?.message}
          required
          forId="book-title"
        >
          <BaseInput
            id="book-title"
            type="text"
            placeholder={t("bookForm.title")}
            {...register("title")}
            touched={touchedFields.title}
          />
        </FormGroup>
        <FormGroup
          className={styles.group}
          label={t("bookForm.format")}
          error={errors.format?.message}
          required
          forId="book-format"
        >
          <Controller
            control={control}
            name="format"
            render={({ field }) => (
              <BaseSelect
                id="book-format"
                {...field}
                touched={touchedFields.format}
                options={[
                  { value: "PAPERBACK", label: t("book.format.PAPERBACK") },
                  { value: "HARDCOVER", label: t("book.format.HARDCOVER") },
                  { value: "EBOOK_EPUB", label: t("book.format.EBOOK_EPUB") },
                  {
                    value: "KINDLE_AMAZON",
                    label: t("book.format.KINDLE_AMAZON"),
                  },
                  { value: "AUDIOBOOK", label: t("book.format.AUDIOBOOK") },
                ]}
                error={errors.format?.message}
              />
            )}
          />
        </FormGroup>

        <FormGroup
          className={styles.group}
          label={t("bookForm.displayOrder")}
          error={errors.displayOrder?.message}
          required
          forId="book-display-order"
        >
          <BaseInput
            id="book-display-order"
            type="number"
            min="0"
            placeholder={t("bookForm.displayOrderPlaceholder")}
            {...register("displayOrder")}
            touched={touchedFields.displayOrder}
          />
        </FormGroup>

        <FormGroup
          className={styles.group}
          label={t("bookForm.amazonUrl")}
          error={errors.amazonUrl?.message}
          forId="book-amazon-url"
        >
          <BaseInput
            id="book-amazon-url"
            type="url"
            placeholder={t("bookForm.amazonUrlPlaceholder")}
            {...register("amazonUrl")}
            touched={touchedFields.amazonUrl}
          />
        </FormGroup>

        <FormGroup
          className={styles.group}
          label={t("bookForm.downloadUrl")}
          error={errors.downloadUrl?.message}
          forId="book-download-url"
        >
          <BaseInput
            id="book-download-url"
            type="url"
            placeholder={t("bookForm.downloadUrlPlaceholder")}
            {...register("downloadUrl")}
            touched={touchedFields.downloadUrl}
            disabled={formatValue === "KINDLE_AMAZON"}
          />
        </FormGroup>

        <FormGroup
          className={styles.group}
          label={t("bookForm.author")}
          error={errors.author?.message}
          required
          forId="book-author"
        >
          <BaseInput
            id="book-author"
            type="text"
            placeholder={t("bookForm.author")}
            {...register("author")}
            touched={touchedFields.author}
          />
        </FormGroup>

        <FormGroup
          className={styles.group}
          label={t("bookForm.description")}
          error={errors.description?.message}
          forId="book-desc"
        >
          <BaseTextarea
            id="book-desc"
            placeholder={t("bookForm.description")}
            {...register("description")}
            touched={touchedFields.description}
          />
        </FormGroup>

        <FormGroup
          className={styles.group}
          label={t("bookForm.price")}
          error={errors.price?.message}
          required
          forId="book-price"
        >
          <BaseInput
            id="book-price"
            type="number"
            step="0.01"
            placeholder={t("bookForm.price")}
            {...register("price")}
            touched={touchedFields.price}
          />
        </FormGroup>

        <FormGroup
          className={styles.group}
          label={t("bookForm.partnerPrice")}
          error={errors.partnerPrice?.message}
          forId="book-partnerPrice"
        >
          <BaseInput
            id="book-partnerPrice"
            type="number"
            step="0.01"
            placeholder={t("bookForm.partnerPrice")}
            {...register("partnerPrice")}
            touched={touchedFields.partnerPrice}
          />
        </FormGroup>

        <FormGroup
          className={styles.group}
          label={t("bookForm.stock")}
          error={errors.stock?.message}
          required
          forId="book-stock"
        >
          <BaseInput
            id="book-stock"
            type="number"
            min="0"
            placeholder={t("bookForm.stock")}
            {...register("stock")}
            touched={touchedFields.stock}
          />
        </FormGroup>

        <div className={styles.actionsTop}>
          <BaseButton
            type="button"
            variant="outline"
            className={styles.centerButton}
            onClick={() => setShowImageModal(true)}
          >
            {t("bookForm.chooseImage")}
          </BaseButton>
        </div>

        <div className={styles.preview}>
          <div className={styles.previewTitle}>
            {t("bookForm.imagePreview")}
          </div>
          {previewSrc && !previewHasError ? (
            <img
              src={previewSrc}
              alt="Preview"
              className={styles.previewImage}
              onError={() => setPreviewHasError(true)}
            />
          ) : (
            <div className={styles.previewPlaceholder}>
              {t("bookForm.imagePreviewPlaceholder", {
                defaultValue: "No image preview available.",
              })}
            </div>
          )}
        </div>

        <BaseCheckbox
          className={styles.checkboxCenter}
          label={t("bookForm.inStock")}
          {...register("inStock")}
        />

        <div className={styles.actions}>
          <BaseButton
            type="submit"
            variant="outline"
            disabled={isCreating || isUpdating}
            className={styles.centerButton}
          >
            {isEditMode
              ? isUpdating
                ? t("bookForm.updating")
                : t("bookForm.update")
              : isCreating
                ? t("bookForm.creating")
                : t("bookForm.create")}
          </BaseButton>
        </div>
      </BaseForm>

      {showImageModal && (
        <ImageInsertModal
          onInsert={handleImageInsert}
          fileAccept={BOOK_IMAGE_ACCEPT}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default BookForm;
