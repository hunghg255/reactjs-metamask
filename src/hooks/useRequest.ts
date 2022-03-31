import { useCallback, useEffect, useState } from 'react';

const useAsync = (callback: any, dependencies = []) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [value, setValue] = useState();

  const callbackMemoized = useCallback(() => {
    setLoading(true);
    setError(undefined);
    setValue(undefined);
    callback()
      .then(setValue)
      .catch(setError)
      .finally(() => setLoading(false));
  }, dependencies);

  useEffect(() => {
    callbackMemoized();
  }, [callbackMemoized]);

  return { loading, error, value };
};

const DEFAULT_OPTIONS = {
  headers: { 'Content-Type': 'application/json' },
};

const useRequest = (url: string, options = {}, dependencies = []) => {
  return useAsync(() => {
    return fetch(url, { ...DEFAULT_OPTIONS, ...options }).then((res) => {
      if (res.ok) return res.json();
      return res.json().then((json) => Promise.reject(json));
    });
  }, dependencies);
};

export { useRequest };
