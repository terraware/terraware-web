import React, { useMemo } from 'react';
import { BusySpinner } from '@terraware/web-components';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useLocalization } from 'src/providers';
import Card from 'src/components/common/Card';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import RejectedDeliverableMessage from 'src/scenes/DeliverablesRouter/RejectedDeliverableMessage';
import DocumentsList from 'src/scenes/DeliverablesRouter/DocumentsList';
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import DocumentsUploader from 'src/components/DeliverableView/DocumentsUploader';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';

export type Props = EditProps & {
  isBusy?: boolean;
};

const DeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: ViewProps = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.DELIVERABLES,
      },
    ],
    [activeLocale]
  );

  if (isMobile) {
    return <MobileMessage {...viewProps} />;
  }

  return (
    <Page title={<TitleBar {...props} />} crumbs={crumbs}>
      <>
        {props.isBusy && <BusySpinner />}
        <RejectedDeliverableMessage {...viewProps} />
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Metadata {...viewProps} />
          <DocumentsUploader {...viewProps} />
          <DocumentsList {...viewProps} />
        </Card>
      </>
    </Page>
  );
};

export default DeliverableView;
