import { useCallback, useMemo, useState } from 'react';

import { useUploadProjectImageValueMutation } from 'src/queries/generated/documentProducerValues';
import { Statuses } from 'src/redux/features/asyncUtils';
import { UploadImageValueRequestPayloadWithProjectId } from 'src/types/documentProducer/VariableValue';

const useUploadImageValues = () => {
  const [uploadProjectImageValue] = useUploadProjectImageValueMutation();
  const [status, setStatus] = useState<Statuses>();

  const uploadImageValues = useCallback(
    async (
      images: UploadImageValueRequestPayloadWithProjectId[],
      onSuccess?: (image: UploadImageValueRequestPayloadWithProjectId) => void
    ): Promise<boolean> => {
      setStatus('pending');
      const results = await Promise.all(
        images.map(async (image) => {
          const { projectId, variableId, file, caption, citation } = image;
          const result = await uploadProjectImageValue({ projectId, body: { variableId, file, caption, citation } });
          if (!('error' in result)) {
            onSuccess?.(image);
          }
          return result;
        })
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
