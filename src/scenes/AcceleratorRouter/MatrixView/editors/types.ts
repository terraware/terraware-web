export type EditorProps<T> = {
  value: T;
  save: (value: T) => Promise<void>;
  cancel: () => void;
};

export type SelectOption = { label: string; value: string };
