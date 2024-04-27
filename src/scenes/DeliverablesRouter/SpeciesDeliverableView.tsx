import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import RejectedDeliverableMessage from 'src/scenes/DeliverablesRouter/RejectedDeliverableMessage';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type Props = EditProps & {
  isBusy?: boolean;
};

const SpeciesDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: ViewProps = props;
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  // TODO: get participant project species for participant project id
  // and disable button if no species OR if all species are already approved

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
    <Page
      title={<TitleBar {...props} />}
      crumbs={crumbs}
      rightComponent={
        <Button
          label={strings.SUBMIT_FOR_APPROVAL}
          onClick={() => {
            console.log('submit for approval button pressed');
          }}
          size='medium'
          id='submitDeliverable'
        />
      }
    >
      {props.isBusy && <BusySpinner />}
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <RejectedDeliverableMessage {...viewProps} />
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Metadata {...viewProps} />
          <Typography marginBottom={theme.spacing(2)} fontSize='20px' lineHeight='28px' fontWeight={600}>
            {strings.SPECIES}
          </Typography>
          {/* TODO: Species table here */}
        </Card>
      </Box>
    </Page>
  );
};

export default SpeciesDeliverableView;
