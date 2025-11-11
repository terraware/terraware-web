import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import Page from 'src/components/Page';
import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useFundingEntity } from 'src/providers';
import { useGetFundingEntityQuery, useUpdateFundingEntityMutation } from 'src/queries/funder/fundingEntities';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

import FundingEntityForm from './FundingEntityForm';
import useUpdateFundingEntity from './useUpdateFundingEntity';

const EditView = () => {
  const { fundingEntity, reload } = useFundingEntity();
  const updateFundingEntity = useUpdateFundingEntity();
  const { goToFundingEntity } = useNavigateTo();

  const rtkQueryEnabled = isEnabled('Redux RTK Query');

  const pathParams = useParams<{ fundingEntityId: string }>();
  const { data: rtkFundingEntity } = useGetFundingEntityQuery(Number(pathParams.fundingEntityId), {
    skip: !rtkQueryEnabled,
  });

  const [update, result] = useUpdateFundingEntityMutation();
  const goToViewFundingEntity = useCallback(() => {
    reload();
    goToFundingEntity(Number(pathParams.fundingEntityId));
  }, [goToFundingEntity, pathParams.fundingEntityId, reload]);

  const handleOnSave = useCallback(
    (record: FundingEntity) => {
      if (rtkQueryEnabled) {
        const payload = {
          id: record.id,
          body: {
            name: record.name,
            projects: record.projects.map((project) => project.projectId),
          },
        };
        update(payload);
      } else {
        updateFundingEntity.update(record);
      }
    },
    [rtkQueryEnabled, update, updateFundingEntity]
  );

  useEffect(() => {
    if (updateFundingEntity.succeeded) {
      goToViewFundingEntity();
    }
  }, [updateFundingEntity, goToViewFundingEntity]);

  useEffect(() => {
    if (result.isSuccess) {
      goToViewFundingEntity();
    }
  }, [goToViewFundingEntity, result]);

  return (
    <Page
      title={strings.EDIT_FUNDING_ENTITY}
      description={strings.EDIT_FUNDING_ENTITY_DESC}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
    >
      {!rtkQueryEnabled && fundingEntity && (
        <FundingEntityForm
          busy={updateFundingEntity.busy}
          fundingEntity={fundingEntity}
          onCancel={goToViewFundingEntity}
          onSave={handleOnSave}
        />
      )}
      {rtkQueryEnabled && rtkFundingEntity && (
        <FundingEntityForm
          busy={updateFundingEntity.busy}
          fundingEntity={rtkFundingEntity}
          onCancel={goToViewFundingEntity}
          onSave={handleOnSave}
        />
      )}
    </Page>
  );
};

export default EditView;
