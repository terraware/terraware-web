import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useFundingEntity } from 'src/providers';
import { FundingEntity } from 'src/types/FundingEntity';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import FundingEntityForm from './FundingEntityForm';
import useUpdateFundingEntity from './useUpdateFundingEntity';

const EditView = () => {
  const navigate = useNavigate();
  const location = useStateLocation();
  const { fundingEntity, reload } = useFundingEntity();
  const updateFundingEntity = useUpdateFundingEntity();

  const goToViewFundingEntity = useCallback(() => {
    reload();
    navigate(
      getLocation(
        APP_PATHS.ACCELERATOR_FUNDING_ENTITIES_VIEW.replace(':fundingEntityId', `${fundingEntity?.id}`),
        location
      )
    );
  }, [navigate, location, fundingEntity]);

  const handleOnSave = useCallback(
    (record: FundingEntity) => {
      updateFundingEntity.update(record);
    },
    [updateFundingEntity]
  );

  useEffect(() => {
    if (updateFundingEntity.succeeded) {
      goToViewFundingEntity();
    }
  }, [updateFundingEntity]);

  return (
    <Page title={fundingEntity?.name || ''} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      {fundingEntity && (
        <FundingEntityForm
          busy={updateFundingEntity.busy}
          fundingEntity={fundingEntity}
          onCancel={goToViewFundingEntity}
          onSave={handleOnSave}
        />
      )}
    </Page>
  );
};

export default EditView;
