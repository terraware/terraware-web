import React, { useCallback, useState } from 'react';

import TfMain from 'src/components/common/TfMain';
import { useDisclaimerData } from 'src/providers/Disclaimer/Context';

import DisclaimerModal from './DisclaimerModal';

const DisclaimerPage = () => {
  const { accept } = useDisclaimerData();
  const [open, setOpen] = useState(true);

  const logout = useCallback(() => {
    window.location.href = '/sso/logout';
  }, []);

  return (
    <TfMain>
      <DisclaimerModal onCancel={logout} onConfirm={accept} open={open} setOpen={setOpen} />
    </TfMain>
  );
};

export default DisclaimerPage;
