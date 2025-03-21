import React, { useCallback, useEffect } from 'react';

import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

import FundingEntityForm from './FundingEntityForm';
import useCreateFundingEntity from './useCreateFundingEntity';

const NewView = () => {
  const createFundingEntity = useCreateFundingEntity();
  const { goToFundingEntities, goToFundingEntity } = useNavigateTo();

  const handleOnSave = useCallback(
    (record: FundingEntity) => {
      createFundingEntity.create(record);
    },
    [createFundingEntity]
  );

  useEffect(() => {
    if (createFundingEntity.succeeded && createFundingEntity.data) {
      goToFundingEntity(createFundingEntity.data.id);
    }
  }, [createFundingEntity]);

  return (
    <Page title={strings.ADD_FUNDING_ENTITY} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <FundingEntityForm onCancel={goToFundingEntities} onSave={handleOnSave} />
    </Page>
  );
};

export default NewView;
