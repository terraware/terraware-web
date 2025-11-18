import React, { useCallback, useEffect } from 'react';

import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { CreateFundingEntityApiArg, useCreateFundingEntityMutation } from 'src/queries/generated/fundingEntities';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

import FundingEntityForm from './FundingEntityForm';

const NewView = () => {
  const [create, createResult] = useCreateFundingEntityMutation();
  const { goToFundingEntities, goToFundingEntity } = useNavigateTo();

  const handleOnSave = useCallback(
    (record: FundingEntity) => {
      const payload: CreateFundingEntityApiArg = {
        createFundingEntityRequestPayload: {
          name: record.name,
          projects: record.projects.map((project) => project.projectId),
        },
      };
      void create(payload);
    },
    [create]
  );

  useEffect(() => {
    if (createResult.isSuccess) {
      goToFundingEntity(createResult.data.fundingEntity.id);
    }
  }, [createResult, goToFundingEntity]);

  return (
    <Page title={strings.ADD_FUNDING_ENTITY} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <FundingEntityForm onCancel={goToFundingEntities} onSave={handleOnSave} />
    </Page>
  );
};

export default NewView;
