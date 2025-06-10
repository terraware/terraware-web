import React, { useCallback, useEffect, useMemo, useState } from 'react';

import DisclaimerPage from 'src/components/Disclaimer/DisclaimerPage';
import { useUser } from 'src/providers/hooks';
import { requestAcceptDisclaimer, requestDisclaimer } from 'src/redux/features/disclaimer/disclaimerAsyncThunks';
import { selectDisclaimer, selectDisclaimerAccept } from 'src/redux/features/disclaimer/disclaimerSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Disclaimer } from 'src/types/Disclaimer';

import { DisclaimerContext } from './Context';

type Props = {
  children: React.ReactNode;
};

const DisclaimerProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();

  const { user } = useUser();
  const [disclaimerRequestId, setDisclaimerRequestId] = useState<string>('');
  const [acceptRequestId, setAcceptRequestId] = useState<string>('');

  const [disclaimer, setDisclaimer] = useState<Disclaimer>();

  const disclaimerResponse = useAppSelector(selectDisclaimer(disclaimerRequestId));
  const acceptDisclaimerResponse = useAppSelector(selectDisclaimerAccept(acceptRequestId));

  const reload = useCallback(() => {
    if (user?.userType === 'Funder') {
      const request = dispatch(requestDisclaimer());
      setDisclaimerRequestId(request.requestId);
    }
  }, [dispatch, user?.userType]);

  const accept = useCallback(() => {
    const request = dispatch(requestAcceptDisclaimer());
    setAcceptRequestId(request.requestId);
  }, [dispatch]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (disclaimerResponse && disclaimerResponse.status === 'success') {
      setDisclaimer(disclaimerResponse.data);
    }
  }, [disclaimerResponse]);

  useEffect(() => {
    if (acceptDisclaimerResponse && acceptDisclaimerResponse.status === 'success') {
      reload();
    }
  }, [acceptDisclaimerResponse, reload]);

  const data = useMemo(
    () => ({
      accept,
      disclaimer,
      reload,
    }),
    [accept, disclaimer, reload]
  );

  return (
    <DisclaimerContext.Provider value={data}>
      {disclaimer && disclaimer.acceptedOn === undefined ? <DisclaimerPage /> : <>{children}</>}
    </DisclaimerContext.Provider>
  );
};

export default DisclaimerProvider;
