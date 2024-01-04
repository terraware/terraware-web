import { useCallback, useState } from 'react';

export default function useErrorMessage(): [string, (val: string) => void] {
  const [errorPageMessage, setErrorPageMessage] = useState<string>('');

  const setErrorMessage = useCallback(
    (errorMessage: string) => setErrorPageMessage(errorMessage),
    [setErrorPageMessage]
  );

  return [errorPageMessage, setErrorMessage];
}
