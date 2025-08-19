import React, { Dispatch, SetStateAction, useCallback } from 'react';

type CurriedChangeHandler = (id: string) => (value: unknown) => void;
type DirectChangeHandler = (id: string, value: unknown) => void;

const useForm = <T>(originalRecord: T): [T, Dispatch<SetStateAction<T>>, DirectChangeHandler, CurriedChangeHandler] => {
  const [record, setRecord] = React.useState(originalRecord);

  const onChange = useCallback((id: string, value: unknown) => {
    setRecord((previousRecord: T): T => {
      return { ...previousRecord, [id]: value };
    });
  }, []);

  const onChangeCallback = useCallback(
    (id: string) => {
      return (value: unknown) => {
        onChange(id, value);
      };
    },
    [onChange]
  );

  return [record, setRecord, onChange, onChangeCallback];
};

export default useForm;
