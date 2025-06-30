import React, { useCallback, useEffect } from 'react';

import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useFundingEntity } from 'src/providers';
import strings from 'src/strings';
import { FundingEntity } from 'src/types/FundingEntity';

import FundingEntityForm from './FundingEntityForm';
import useUpdateFundingEntity from './useUpdateFundingEntity';

const EditView = () => {
  const { fundingEntity, reload } = useFundingEntity();
  const updateFundingEntity = useUpdateFundingEntity();
  const { goToFundingEntity } = useNavigateTo();

  const goToViewFundingEntity = useCallback(() => {
    reload();
    goToFundingEntity(String(fundingEntity?.id));
  }, [fundingEntity, goToFundingEntity, reload]);

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
  }, [updateFundingEntity, goToViewFundingEntity]);

  return (
    <Page
      title={strings.EDIT_FUNDING_ENTITY}
      description={strings.EDIT_FUNDING_ENTITY_DESC}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
    >
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
