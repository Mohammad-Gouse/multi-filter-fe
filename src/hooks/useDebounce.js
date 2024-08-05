import { useState, useEffect } from 'react';

const useDebounce = (value, delay) => {

  console.log("init deb value:", value)
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  console.log("debounce value:", debouncedValue)

  return debouncedValue;
};

export default useDebounce;
