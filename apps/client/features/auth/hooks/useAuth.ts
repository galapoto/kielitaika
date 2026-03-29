import { useEffect, useState } from "react";

import { getAuthStatus } from "../services/authService";

export default function useAuth() {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      const res = await getAuthStatus();

      if (res.ok) {
        setState({ data: res.data, loading: false, error: null });
      } else {
        setState({ data: null, loading: false, error: res.error });
      }
    }

    load();
  }, []);

  return state;
}
