import React, { useCallback, useState } from 'react';

import TfMain from 'src/components/common/TfMain';
import { useAcceptDisclaimerMutation, useGetDisclaimerQuery } from 'src/queries/generated/disclaimer';

import DisclaimerModal from './DisclaimerModal';

const DisclaimerPage = () => {
  const { currentData } = useGetDisclaimerQuery();
  const [acceptDisclaimer] = useAcceptDisclaimerMutation();
  const [open, setOpen] = useState(true);

  const logout = useCallback(() => {
    window.location.href = '/sso/logout';
  }, []);

  // Accepting invalidates the Disclaimer tag, which refetches getDisclaimer automatically.
  const accept = useCallback(() => {
    void acceptDisclaimer();
  }, [acceptDisclaimer]);

  return (
    <TfMain>
      <DisclaimerModal
        content={currentData?.disclaimer?.content}
        onCancel={logout}
        onConfirm={accept}
        open={open}
        setOpen={setOpen}
      />
    </TfMain>
  );
};

export default DisclaimerPage;
