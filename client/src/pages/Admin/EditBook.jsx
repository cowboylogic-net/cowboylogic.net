import BookForm from "../../components/BookForm/BookForm";
import { useDispatch } from "react-redux";
import { showNotification } from "../../store/slices/notificationSlice";

const EditBook = () => {
  const dispatch = useDispatch();

  const handleSuccess = () => {
    dispatch(showNotification({ message: "✅ Book updated successfully", type: "success" }));
  };

  const handleError = (msg) => {
    dispatch(showNotification({ message: msg, type: "error" }));
  };

  return <BookForm onSuccess={handleSuccess} onError={handleError} />;
};

export default EditBook;
