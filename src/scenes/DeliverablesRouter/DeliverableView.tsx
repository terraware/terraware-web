import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import DocumentsUploader from 'src/components/DeliverableView/DocumentsUploader';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import DocumentsList from 'src/scenes/DeliverablesRouter/DocumentsList';
import RejectedDeliverableMessage from 'src/scenes/DeliverablesRouter/RejectedDeliverableMessage';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

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
      {props.isBusy && <BusySpinner />}
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <RejectedDeliverableMessage {...viewProps} />
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Metadata {...viewProps} />
          <DocumentsUploader {...viewProps} />
          <DocumentsList {...viewProps} />
        </Card>
      </Box>
    </Page>
  );
};

export default DeliverableView;
