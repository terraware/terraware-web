import React, { Dispatch, SetStateAction } from 'react';

type Handler = (id: string, value: unknown) => void;

const useForm = <T>(originalRecord: T): [T, Dispatch<SetStateAction<T>>, Handler] => {
  const [record, setRecord] = React.useState(originalRecord);

  const onChange = (id: string, value: unknown) => {
    setRecord({ ...record, [id]: value });
  };

  return [record, setRecord, onChange];
};

export default useForm;
