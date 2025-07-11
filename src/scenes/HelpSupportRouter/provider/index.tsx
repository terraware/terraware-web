import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { requestListSupportRequestTypes } from 'src/redux/features/support/supportAsyncThunks';
import { selectSupportRequestTypesByRequest } from 'src/redux/features/support/supportSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { SupportRequestType } from 'src/types/Support';

import { SupportContext, SupportData } from './Context';

export type Props = {
  children?: React.ReactNode;
};

const SupportProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();

  const [listSupportRequestTypesRequestId, setListSupportRequestTypesRequestId] = useState<string>('');
  const listSupportRequestTypesRequest = useAppSelector(
    selectSupportRequestTypesByRequest(listSupportRequestTypesRequestId)
  );

  const [supportRequestTypes, setSupportRequestTypes] = useState<SupportRequestType[]>();

  const [supportData, setSupportData] = useState<SupportData>({
    types: supportRequestTypes,
  });

  useEffect(() => {
    if (supportRequestTypes === undefined) {
      const request = dispatch(requestListSupportRequestTypes());
      setListSupportRequestTypesRequestId(request.requestId);
    }
  }, [supportRequestTypes, dispatch]);

  useEffect(() => {
    if (
      listSupportRequestTypesRequest &&
      listSupportRequestTypesRequest.status === 'success' &&
      listSupportRequestTypesRequest.data
    ) {
      setSupportRequestTypes(listSupportRequestTypesRequest.data);
    }
  }, [listSupportRequestTypesRequest]);

  useEffect(() => {
    setSupportData({
      types: supportRequestTypes,
    });
  }, [supportRequestTypes]);

  return (
    <SupportContext.Provider value={supportData}>
      {children}
      <Outlet />
    </SupportContext.Provider>
  );
};

export default SupportProvider;
