import { useRef, useState } from 'react';

export const useEditorSave = <T>(save: (value: T) => Promise<void>, cancel: () => void) => {
  const pending = useRef(false);
  const finished = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);
  const commit = async (value: T) => {
    if (pending.current || finished.current) {
      return;
    }
    pending.current = true;
    setIsSaving(true);
    setError(false);
    try {
      await save(value);
      finished.current = true;
      cancel();
    } catch {
      setError(true);
    } finally {
      pending.current = false;
      setIsSaving(false);
    }
  };
  const cancelEdit = () => {
    if (!pending.current) {
      finished.current = true;
      cancel();
    }
  };
  return { commit, cancelEdit, isSaving, error };
};
