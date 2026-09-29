import { useCallback, useMemo, useState } from 'react';

import { useUploadProjectImageValueMutation } from 'src/queries/generated/documentProducerValues';
import { Statuses } from 'src/redux/features/asyncUtils';
import { UploadImageValueRequestPayloadWithProjectId } from 'src/types/documentProducer/VariableValue';

const useUploadImageValues = () => {
  const [uploadProjectImageValue] = useUploadProjectImageValueMutation();
  const [status, setStatus] = useState<Statuses>();

  const uploadImageValues = useCallback(
    async (images: UploadImageValueRequestPayloadWithProjectId[]): Promise<boolean> => {
      setStatus('pending');
      const results = await Promise.all(
        images.map(({ projectId, variableId, file, caption, citation }) =>
          uploadProjectImageValue({ projectId, body: { variableId, file, caption, citation } })
        )
      );
      const succeeded = results.every((result) => !('error' in result));
      setStatus(succeeded ? 'success' : 'error');
      return succeeded;
    },
    [uploadProjectImageValue]
  );

  const reset = useCallback(() => setStatus(undefined), []);

  return useMemo(() => ({ uploadImageValues, status, reset }), [reset, status, uploadImageValues]);
};

export default useUploadImageValues;
