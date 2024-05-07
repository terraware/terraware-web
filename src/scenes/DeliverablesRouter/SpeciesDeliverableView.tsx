import React, { useEffect, useMemo } from 'react';

import { Box } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import Page from 'src/components/Page';
import SpeciesDeliverableTable from 'src/components/SpeciesDeliverableTable';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { requestListParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesListRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import RejectedDeliverableMessage from 'src/scenes/DeliverablesRouter/RejectedDeliverableMessage';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import SpeciesDeliverableStatusMessage from './SpeciesDeliverableStatusMessage';

export type Props = EditProps & {
  isBusy?: boolean;
};

const SpeciesDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: ViewProps = props;
  const dispatch = useAppDispatch();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { currentParticipantProject } = useParticipantData();
  const participantProjectSpecies = useAppSelector(
    selectParticipantProjectSpeciesListRequest(currentParticipantProject?.id || -1)
  );

  const submitButtonIsDisabled = useMemo(() => {
    return (
      !participantProjectSpecies?.data?.length ||
      participantProjectSpecies?.data?.every((species) => species.status === 'Approved')
    );
  }, [participantProjectSpecies]);

  useEffect(() => {
    if (!currentParticipantProject?.id) {
      return;
    }

    void dispatch(requestListParticipantProjectSpecies(currentParticipantProject?.id));
  }, []);

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
          disabled={submitButtonIsDisabled}
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
        <SpeciesDeliverableStatusMessage {...viewProps} species={participantProjectSpecies?.data || []} />
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Metadata {...viewProps} />
          <SpeciesDeliverableTable projectId={currentParticipantProject?.id || -1} />
        </Card>
      </Box>
    </Page>
  );
};

export default SpeciesDeliverableView;
