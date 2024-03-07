import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import DocumentsUploader from 'src/components/DeliverableView/DocumentsUploader';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps } from 'src/components/DeliverableView/types';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useUser } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import DocumentsList from './DocumentsList';
import RejectedDeliverableMessage from './RejectedDeliverableMessage';

export type Props = EditProps & {
  isBusy?: boolean;
  showRejectDialog: () => void;
};

const DeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: Props = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const canEdit = isAllowed('UPDATE_PROJECT_ACCELERATOR_DATA');

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.ACCELERATOR_DELIVERABLES,
      },
    ],
    [activeLocale]
  );

  if (isMobile) {
    return <MobileMessage {...viewProps} />;
  }

  return (
    <Page title={<TitleBar {...viewProps} />} rightComponent={canEdit ? props.callToAction : undefined} crumbs={crumbs}>
      {props.isBusy && <BusySpinner />}
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <RejectedDeliverableMessage {...viewProps} />
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Metadata {...viewProps} />
          <Typography marginBottom={theme.spacing(2)} fontSize='20px' lineHeight='28px' fontWeight={600}>
            {strings.DOCUMENTS}
          </Typography>
          {canEdit && <DocumentsUploader {...viewProps} deliverableStatusesToIgnore={['Not Submitted', 'In Review']} />}
          <DocumentsList {...viewProps} />
        </Card>
      </Box>
    </Page>
  );
};

export default DeliverableView;
