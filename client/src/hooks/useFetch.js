import { useEffect, useState } from "react";
import { apiService } from "../services/axiosService";

/**
 * Custom hook for fetching data from the API.
 *
 * @param {string} url - The API endpoint to fetch.
 * @param {boolean} secured - Whether to include Authorization header.
 */
const useFetch = (url, secured = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await apiService.get(url, secured);
        if (isMounted) {
          setData(res.data.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, secured]);

  return { data, loading, error };
};

export default useFetch;
