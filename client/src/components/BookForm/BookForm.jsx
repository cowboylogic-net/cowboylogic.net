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
  selectBookById,
  selectLoadingFlags,
} from "../../store/selectors/bookSelectors";

import styles from "./BookForm.module.css";
import ImageInsertModal from "../modals/ImageInsertModal/ImageInsertModal";
import Loader from "../Loader/Loader";

const BookForm = ({ onSuccess, onError }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const numericId = Number(id);

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

  const existingBook = useSelector(selectBookById(numericId));
  const { isCreating, isUpdating, isFetchingById } = useSelector(selectLoadingFlags);
  const error = useSelector((state) => state.books.error);

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
    if (id && !existingBook) {
      dispatch(fetchBookById(numericId));
    }
  }, [dispatch, id, existingBook, numericId]);

  useEffect(() => {
    if (existingBook) {
      reset({
        title: existingBook.title,
        author: existingBook.author,
        description: existingBook.description || "",
        price: existingBook.price,
        imageUrl: existingBook.imageUrl || "",
        inStock: existingBook.inStock,
      });
      setPreview(existingBook.imageUrl || null);
    }
  }, [existingBook, reset]);

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

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (data.imageUrl) {
      formData.append("imageUrl", data.imageUrl);
    }

    try {
      if (id) {
        await dispatch(updateBook({ id: numericId, formData })).unwrap();
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

  if (isFetchingById) return <Loader />;
  if (id && !existingBook) return <p className={styles.error}>{t("bookForm.notFound")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.bookForm}>
      <h2>{id ? t("bookForm.edit") : t("bookForm.add")}</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder={t("bookForm.title")} {...register("title")} />
        {errors.title && <p className={styles.error}>{errors.title.message}</p>}

        <input type="text" placeholder={t("bookForm.author")} {...register("author")} />
        {errors.author && <p className={styles.error}>{errors.author.message}</p>}

        <textarea placeholder={t("bookForm.description")} {...register("description")} />
        {errors.description && <p className={styles.error}>{errors.description.message}</p>}

        <input
          type="number"
          placeholder={t("bookForm.price")}
          step="0.01"
          {...register("price")}
        />
        {errors.price && <p className={styles.error}>{errors.price.message}</p>}

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowImageModal(true)}
        >
          {t("bookForm.chooseImage")}
        </button>

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

        <button type="submit" disabled={isCreating || isUpdating}>
          {id
            ? isUpdating
              ? t("bookForm.updating")
              : t("bookForm.update")
            : isCreating
            ? t("bookForm.creating")
            : t("bookForm.create")}
        </button>
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
