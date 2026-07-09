import React, { useCallback, useState } from 'react';

import TfMain from 'src/components/common/TfMain';
import { useLocalization } from 'src/providers';
import { useAcceptDisclaimerMutation, useGetDisclaimerQuery } from 'src/queries/generated/disclaimer';
import useSnackbar from 'src/utils/useSnackbar';

import DisclaimerModal from './DisclaimerModal';

const DisclaimerPage = () => {
  const { currentData } = useGetDisclaimerQuery();
  const snackbar = useSnackbar();
  const { strings } = useLocalization();
  const [acceptDisclaimer] = useAcceptDisclaimerMutation();

  const [open, setOpen] = useState(true);

  const logout = useCallback(() => {
    window.location.href = '/sso/logout';
  }, []);

  const accept = useCallback(async () => {
    try {
      await acceptDisclaimer().unwrap();
    } catch (error) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [acceptDisclaimer, snackbar, strings.GENERIC_ERROR]);

  return (
    <TfMain>
      <DisclaimerModal
        content={currentData?.disclaimer?.content}
        onCancel={logout}
        onConfirm={() => {
          void accept();
        }}
        open={open}
        setOpen={setOpen}
      />
    </TfMain>
  );
};

export default DisclaimerPage;
