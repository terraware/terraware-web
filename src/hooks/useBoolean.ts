import { Dispatch, SetStateAction, useCallback, useState } from 'react';

const useBoolean = (initialValue: boolean): [boolean, Dispatch<SetStateAction<boolean>>, () => void, () => void] => {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, setValue, setTrue, setFalse];
};

export default useBoolean;
