import React, { Dispatch, SetStateAction, useCallback } from 'react';

export interface FormChangeHandler {
  (id: string): (value: unknown) => void; // Curried form
  (id: string, value: unknown): void; // Direct form
}

const useForm = <T>(originalRecord: T): [T, Dispatch<SetStateAction<T>>, FormChangeHandler] => {
  const [record, setRecord] = React.useState(originalRecord);

  const onChange = useCallback(
    function onChangeInternal(id: string, value?: unknown) {
      // If value is provided, execute immediately (direct form)
      if (arguments.length === 2) {
        setRecord((previousRecord: T): T => {
          return { ...previousRecord, [id]: value };
        });
        return;
      }

      // If only id is provided, return a function (curried form)
      return (newValue: unknown) => {
        setRecord((previousRecord: T): T => {
          return { ...previousRecord, [id]: newValue };
        });
      };
    } as FormChangeHandler,
    []
  );

  return [record, setRecord, onChange];
};

export default useForm;
