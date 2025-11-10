import React, { useCallback, useEffect } from 'react';

import Page from 'src/components/Page';
import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useCreateFundingEntitiesMutation } from 'src/queries/funder/fundingEntities';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

import FundingEntityForm from './FundingEntityForm';
import useCreateFundingEntity from './useCreateFundingEntity';

const NewView = () => {
  const [create, result] = useCreateFundingEntitiesMutation();
  const createFundingEntity = useCreateFundingEntity();
  const { goToFundingEntities, goToFundingEntity } = useNavigateTo();
  const rtkQueryEnabled = isEnabled('Redux RTK Query');

  const handleOnSave = useCallback(
    (record: FundingEntity) => {
      if (rtkQueryEnabled) {
        const payload = {
          name: record.name,
          projects: record.projects.map((project) => project.projectId),
        };
        create(payload);
      } else {
        createFundingEntity.create(record);
      }
    },
    [create, createFundingEntity, rtkQueryEnabled]
  );

  useEffect(() => {
    if (createFundingEntity.succeeded && createFundingEntity.data) {
      goToFundingEntity(createFundingEntity.data.id);
    }
  }, [createFundingEntity, goToFundingEntity]);

  useEffect(() => {
    if (rtkQueryEnabled && result.isSuccess) {
      goToFundingEntity(result.data.fundingEntity.id);
    }
  }, [goToFundingEntity, result, rtkQueryEnabled]);

  return (
    <Page title={strings.ADD_FUNDING_ENTITY} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <FundingEntityForm onCancel={goToFundingEntities} onSave={handleOnSave} />
    </Page>
  );
};

export default NewView;
