import { Dispatch, SetStateAction, useState } from 'react';

type Handler = (id: string, value: unknown) => void;

export default <T>(
  originalRecord: T
): [T, Dispatch<SetStateAction<T>>, Handler] => {
  const [record, setRecord] = useState(originalRecord);

  const onChange = (id: string, value: unknown) => {
    setRecord({ ...record, [id]: value });
  };
  return [record, setRecord, onChange];
};
