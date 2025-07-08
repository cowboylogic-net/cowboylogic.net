import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
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

  const schema = bookFormSchema(t); // ✅ ОНОВЛЕНО

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      price: "",
      imageUrl: "",
      inStock: true,
      stock: 0,
    },
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchBookById(id));
    }
  }, [dispatch, isEditMode, id]);

  useEffect(() => {
    if (isEditMode && selectedBook) {
      reset({
        title: selectedBook.title,
        author: selectedBook.author,
        description: selectedBook.description || "",
        price: selectedBook.price,
        imageUrl: selectedBook.imageUrl || "",
        inStock: selectedBook.inStock,
        stock: selectedBook.stock ?? 0,
        partnerPrice: selectedBook.partnerPrice || "",
      });
      setPreview(selectedBook.imageUrl || null);
    }
  }, [selectedBook, reset, isEditMode]);

  const handleImageInsert = ({ file, url }) => {
    if (file) {
      setImageFile(file);
      setValue("imageUrl", "");
      setPreview(URL.createObjectURL(file));
    } else if (url) {
      setImageFile(null);
      setValue("imageUrl", url);
      setPreview(url);
    }
    setShowImageModal(false);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    const parsedPrice = parseFloat(data.price);
    const parsedStock = parseInt(data.stock);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
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

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (data.imageUrl?.trim()) {
      const fullUrl = data.imageUrl.startsWith("/")
        ? `${baseUrl}${data.imageUrl}`
        : data.imageUrl;
      formData.append("imageUrl", fullUrl);
    }

    // 🔍 Debug (можна видалити після перевірки)
    console.log("📦 Sending form data:", {
      title: data.title,
      price: parsedPrice,
      stock: parsedStock,
      inStock: data.inStock,
      image: imageFile || data.imageUrl,
    });

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

  if (isEditMode && isFetchingById) return <Loader />;
  if (isEditMode && !selectedBook && !isFetchingById)
    return <p className={styles.error}>{t("bookForm.notFound")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.bookForm}>
      <h2>{isEditMode ? t("bookForm.edit") : t("bookForm.add")}</h2>

      <BaseForm onSubmit={handleSubmit(onSubmit)}>
        <FormGroup
          label={t("bookForm.title")}
          error={errors.title?.message}
          required
        >
          <BaseInput
            type="text"
            placeholder={t("bookForm.title")}
            {...register("title")}
            touched={touchedFields.title}
          />
        </FormGroup>

        <FormGroup
          label={t("bookForm.author")}
          error={errors.author?.message}
          required
        >
          <BaseInput
            type="text"
            placeholder={t("bookForm.author")}
            {...register("author")}
            touched={touchedFields.author}
          />
        </FormGroup>

        <FormGroup
          label={t("bookForm.description")}
          error={errors.description?.message}
        >
          <BaseTextarea
            placeholder={t("bookForm.description")}
            {...register("description")}
            touched={touchedFields.description}
          />
        </FormGroup>

        <FormGroup
          label={t("bookForm.price")}
          error={errors.price?.message}
          required
        >
          <BaseInput
            type="number"
            step="0.01"
            placeholder={t("bookForm.price")}
            {...register("price")}
            touched={touchedFields.price}
          />
        </FormGroup>
        <FormGroup
          label={t("bookForm.partnerPrice")}
          error={errors.partnerPrice?.message}
        >
          <BaseInput
            type="number"
            step="0.01"
            placeholder={t("bookForm.partnerPrice")}
            {...register("partnerPrice")}
            touched={touchedFields.partnerPrice}
          />
        </FormGroup>

        <FormGroup
          label={t("bookForm.stock")}
          error={errors.stock?.message}
          required
        >
          <BaseInput
            type="number"
            min="0"
            placeholder={t("bookForm.stock")}
            {...register("stock")}
            touched={touchedFields.stock}
          />
        </FormGroup>

        <BaseButton
          type="button"
          variant="outline"
          onClick={() => setShowImageModal(true)}
        >
          {t("bookForm.chooseImage")}
        </BaseButton>

        {preview && (
          <div className={styles.preview}>
            <p>{t("bookForm.imagePreview")}</p>
            <img src={preview} alt="Preview" className={styles.previewImage} />
          </div>
        )}

        <BaseCheckbox label={t("bookForm.inStock")} {...register("inStock")} />

        <div className={styles.buttonWrapper}>
          <BaseButton
            type="submit"
            variant="outline"
            disabled={isCreating || isUpdating}
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
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default BookForm;
