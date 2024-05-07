import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps } from 'src/components/DeliverableView/types';
import Page from 'src/components/Page';
import SpeciesDeliverableTable from 'src/components/SpeciesDeliverableTable';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import RejectedDeliverableMessage from './RejectedDeliverableMessage';

export type Props = EditProps & {
  isBusy?: boolean;
  showRejectDialog: () => void;
};

const SpeciesDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: Props = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

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
    <Page title={<TitleBar {...viewProps} />} rightComponent={props.callToAction} crumbs={crumbs}>
      {props.isBusy && <BusySpinner />}
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <RejectedDeliverableMessage {...viewProps} />
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Metadata {...viewProps} />
          <SpeciesDeliverableTable projectId={viewProps.deliverable.projectId} />
        </Card>
      </Box>
    </Page>
  );
};

export default SpeciesDeliverableView;
