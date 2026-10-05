import {useEffect, useState} from "react";

export const useDebounce = <ValueType>(
  value: ValueType,
  milliSeconds: number,
) => {
  const [isValueLoading, setIsValueLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState<ValueType>(value);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsValueLoading(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsValueLoading(false);
    }, milliSeconds);

    return () => {
      clearTimeout(handler);
    };
  }, [value, milliSeconds]);

  return {debouncedValue, isValueLoading};
};