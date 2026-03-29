import { useEffect, useState } from "react";

import { getHomeData } from "../services/homeService";

export default function useHome() {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      const res = await getHomeData();

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
