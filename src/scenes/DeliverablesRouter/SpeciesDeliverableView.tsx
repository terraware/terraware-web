import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Metadata from 'src/components/DeliverableView/Metadata';
import MobileMessage from 'src/components/DeliverableView/MobileMessage';
import TitleBar from 'src/components/DeliverableView/TitleBar';
import { EditProps, ViewProps } from 'src/components/DeliverableView/types';
import useUpdateDeliverable from 'src/components/DeliverableView/useUpdateDeliverable';
import Page from 'src/components/Page';
import SpeciesDeliverableTable from 'src/components/SpeciesDeliverableTable';
import Card from 'src/components/common/Card';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { requestListParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesListRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import SpeciesDeliverableStatusMessage from './SpeciesDeliverableStatusMessage';
import SubmitDeliverableDialog from './SubmitDeliverableDialog';

export type Props = EditProps & {
  isBusy?: boolean;
};

const SpeciesDeliverableView = (props: Props): JSX.Element => {
  const { ...viewProps }: ViewProps = props;
  const projectId = viewProps.deliverable.projectId;

  const dispatch = useAppDispatch();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const { currentParticipantProject } = useParticipantData();
  const { currentDeliverable: deliverable } = useDeliverableData();
  const { status: requestStatus, update } = useUpdateDeliverable();

  const ppsSearchResults = useAppSelector(selectParticipantProjectSpeciesListRequest(projectId));

  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);

  const submitButtonIsDisabled = useMemo(() => {
    return (
      !ppsSearchResults?.data?.length ||
      ppsSearchResults?.data?.every((species) => species.participantProjectSpecies.submissionStatus === 'Approved')
    );
  }, [ppsSearchResults]);

  useEffect(() => {
    if (!currentParticipantProject?.id) {
      return;
    }

    void dispatch(requestListParticipantProjectSpecies(projectId));
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

  const submitDeliverable = useCallback(() => {
    if (deliverable?.id !== undefined) {
      update({ ...deliverable, status: 'In Review' });
    }
    setShowSubmitDialog(false);
  }, [deliverable, update]);

  if (isMobile) {
    return <MobileMessage {...viewProps} />;
  }

  return (
    <>
      {deliverable && showSubmitDialog && (
        <SubmitDeliverableDialog onClose={() => setShowSubmitDialog(false)} onSubmit={submitDeliverable} />
      )}

      <Page
        title={<TitleBar {...props} />}
        crumbs={crumbs}
        rightComponent={
          <Button
            disabled={submitButtonIsDisabled}
            label={strings.SUBMIT_FOR_APPROVAL}
            onClick={() => setShowSubmitDialog(true)}
            size='medium'
            id='submitDeliverable'
          />
        }
      >
        {(props.isBusy || requestStatus === 'pending') && <BusySpinner />}
        <Box display='flex' flexDirection='column' flexGrow={1}>
          <SpeciesDeliverableStatusMessage {...viewProps} species={ppsSearchResults?.data || []} />
          <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Metadata {...viewProps} />
            <SpeciesDeliverableTable deliverable={viewProps.deliverable} />
          </Card>
        </Box>
      </Page>
    </>
  );
};

export default SpeciesDeliverableView;
