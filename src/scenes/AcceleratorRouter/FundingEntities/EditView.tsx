import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import {
  UpdateFundingEntityApiArg,
  useGetFundingEntityQuery,
  useUpdateFundingEntityMutation,
} from 'src/queries/generated/fundingEntities';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

import FundingEntityForm from './FundingEntityForm';

const EditView = () => {
  const { goToFundingEntity } = useNavigateTo();

  const pathParams = useParams<{ fundingEntityId: string }>();
  const { data: getFundingEntityResponse } = useGetFundingEntityQuery({
    fundingEntityId: Number(pathParams.fundingEntityId),
  });

  const [update, updateResult] = useUpdateFundingEntityMutation();
  const goToViewFundingEntity = useCallback(() => {
    goToFundingEntity(Number(pathParams.fundingEntityId));
  }, [goToFundingEntity, pathParams.fundingEntityId]);

  const handleOnSave = useCallback(
    (record: FundingEntity) => {
      const payload: UpdateFundingEntityApiArg = {
        fundingEntityId: record.id,
        updateFundingEntityRequestPayload: {
          name: record.name,
          projects: record.projects.map((project) => project.projectId),
        },
      };
      void update(payload);
    },
    [update]
  );

  useEffect(() => {
    if (updateResult.isSuccess) {
      goToViewFundingEntity();
    }
  }, [goToViewFundingEntity, updateResult]);

  return (
    <Page
      title={strings.EDIT_FUNDING_ENTITY}
      description={strings.EDIT_FUNDING_ENTITY_DESC}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
    >
      {getFundingEntityResponse && (
        <FundingEntityForm
          busy={updateResult.isLoading}
          fundingEntity={getFundingEntityResponse.fundingEntity}
          onCancel={goToViewFundingEntity}
          onSave={handleOnSave}
        />
      )}
    </Page>
  );
};

export default EditView;
