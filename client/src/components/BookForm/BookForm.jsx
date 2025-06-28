import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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

import styles from "./BookForm.module.css";
import ImageInsertModal from "../modals/ImageInsertModal/ImageInsertModal";
import Loader from "../Loader/Loader";
import BaseButton from "../BaseButton/BaseButton"; // ✅ Глобальна кнопка

const BookForm = ({ onSuccess, onError }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isCreating, isUpdating, isFetchingById } = useSelector(selectLoadingFlags);
  const error = useSelector((state) => state.books.error);
  const selectedBook = useSelector(selectSelectedBook);

  const schema = yup.object().shape({
    title: yup.string().required(t("bookForm.titleRequired")),
    author: yup.string().required(t("bookForm.authorRequired")),
    description: yup.string(),
    price: yup
      .number()
      .typeError(t("bookForm.priceType"))
      .positive(t("bookForm.pricePositive"))
      .required(t("bookForm.priceRequired")),
    inStock: yup.boolean(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      author: "",
      description: "",
      price: "",
      imageUrl: "",
      inStock: true,
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
    formData.append("title", data.title);
    formData.append("author", data.author);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("inStock", data.inStock);

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (data.imageUrl?.trim()) {
      const fullUrl = data.imageUrl.startsWith("/")
        ? `${baseUrl}${data.imageUrl}`
        : data.imageUrl;
      formData.append("imageUrl", fullUrl);
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

  if (isEditMode && isFetchingById) return <Loader />;
  if (isEditMode && !selectedBook && !isFetchingById)
    return <p className={styles.error}>{t("bookForm.notFound")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.bookForm}>
      <h2>{isEditMode ? t("bookForm.edit") : t("bookForm.add")}</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder={t("bookForm.title")} {...register("title")} />
        {errors.title && <p className={styles.error}>{errors.title.message}</p>}

        <input type="text" placeholder={t("bookForm.author")} {...register("author")} />
        {errors.author && <p className={styles.error}>{errors.author.message}</p>}

        <textarea placeholder={t("bookForm.description")} {...register("description")} />
        {errors.description && <p className={styles.error}>{errors.description.message}</p>}

        <input type="number" placeholder={t("bookForm.price")} step="0.01" {...register("price")} />
        {errors.price && <p className={styles.error}>{errors.price.message}</p>}

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

        <label>
          <input type="checkbox" {...register("inStock")} />
          {t("bookForm.inStock")}
        </label>

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
      </form>

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
