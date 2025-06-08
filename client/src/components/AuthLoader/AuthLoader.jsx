import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "../../store/slices/authSlice";

const AuthLoader = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser(token)).finally(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, [token, dispatch]);

  if (!loaded) return null;

  return null;
};

export default AuthLoader;
