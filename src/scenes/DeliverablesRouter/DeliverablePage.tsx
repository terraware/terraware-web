import React, { ReactNode } from 'react';

import { useDeviceInfo } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps } from 'src/components/DeliverableView/types';
import Page from 'src/components/Page';

type DeliverablePageProp = EditProps & {
  children?: ReactNode;
  crumbs?: Crumb[];
  isLoading?: boolean;
  rightComponent?: ReactNode;
};

const DeliverablePage = (props: DeliverablePageProp) => {
  const { children, crumbs, isLoading, rightComponent } = props;
  const { isMobile } = useDeviceInfo();

  if (isMobile) {
    return <MobileMessage {...props} />;
  }

  return (
    <Page title={<TitleBar {...props} />} crumbs={crumbs} isLoading={isLoading} rightComponent={rightComponent}>
      {children}
    </Page>
  );
};

export default DeliverablePage;
