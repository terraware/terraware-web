import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

import FundingEntityForm from './FundingEntityForm';
import useCreateFundingEntity from './useCreateFundingEntity';

const NewView = () => {
  const navigate = useNavigate();
  const createFundingEntity = useCreateFundingEntity();

  const goToListView = useCallback(() => {
    navigate({ pathname: APP_PATHS.ACCELERATOR_FUNDING_ENTITIES });
  }, [navigate]);

  const goToFundingEntityView = useCallback(
    (fundingEntityId: number) => {
      navigate({
        pathname: APP_PATHS.ACCELERATOR_FUNDING_ENTITIES_VIEW.replace(':fundingEntityId', String(fundingEntityId)),
      });
    },
    [navigate]
  );

  const handleOnSave = useCallback(
    (record: FundingEntity) => {
      createFundingEntity.create(record);
    },
    [createFundingEntity]
  );

  useEffect(() => {
    if (createFundingEntity.succeeded && createFundingEntity.data) {
      goToFundingEntityView(createFundingEntity.data.id);
    }
  }, [createFundingEntity]);

  return (
    <Page title={strings.ADD_FUNDING_ENTITY} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <FundingEntityForm onCancel={goToListView} onSave={handleOnSave} />
    </Page>
  );
};

export default NewView;
