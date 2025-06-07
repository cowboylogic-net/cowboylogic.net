import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  createBook,
  updateBook,
  fetchBookById,
} from "../../store/thunks/bookThunks";
import { selectBookById } from "../../store/selectors/bookSelectors";
import styles from "./BookForm.module.css";
import ImageInsertModal from "../modals/ImageInsertModal/ImageInsertModal";

// ✅ Yup schema
const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  author: yup.string().required("Author is required"),
  description: yup.string(),
  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Price is required"),
  inStock: yup.boolean(),
});

const BookForm = ({ onSuccess, onError }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const existingBook = useSelector(selectBookById(Number(id)));

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
    if (id) {
      dispatch(fetchBookById(id));
    }
  }, [dispatch, id]);

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
        await dispatch(updateBook({ id, formData })).unwrap();
        onSuccess?.("✅ Book updated successfully");
      } else {
        await dispatch(createBook(formData)).unwrap();
        onSuccess?.("✅ Book created successfully");
      }
      navigate("/bookstore");
    } catch (err) {
      onError?.(err || "❌ Failed to save book");
    }
  };

  return (
    <div className={styles.bookForm}>
      <h2>{id ? "Edit Book" : "Add New Book"}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Title" {...register("title")} />
        {errors.title && <p className={styles.error}>{errors.title.message}</p>}

        <input type="text" placeholder="Author" {...register("author")} />
        {errors.author && <p className={styles.error}>{errors.author.message}</p>}

        <textarea placeholder="Description" {...register("description")} />
        {errors.description && (
          <p className={styles.error}>{errors.description.message}</p>
        )}

        <input type="number" placeholder="Price" step="0.01" {...register("price")} />
        {errors.price && <p className={styles.error}>{errors.price.message}</p>}

        <button type="button" className="btn btn-outline" onClick={() => setShowImageModal(true)}>
          Choose Image
        </button>

        {preview && (
          <div className={styles.preview}>
            <p>Image Preview:</p>
            <img src={preview} alt="Preview" className={styles.previewImage} />
          </div>
        )}

        <label>
          <input type="checkbox" {...register("inStock")} />
          In Stock
        </label>

        <button type="submit">{id ? "Update Book" : "Create Book"}</button>
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
