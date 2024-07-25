import React, { useEffect } from 'react';

import { Box } from '@mui/material';

import Metadata from 'src/components/DeliverableView/Metadata';
import { EditProps } from 'src/components/DeliverableView/types';
import SpeciesDeliverableTable from 'src/components/SpeciesDeliverableTable';
import Card from 'src/components/common/Card';
import { requestListParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesListRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

import SpeciesDeliverableStatusMessage from './SpeciesDeliverableStatusMessage';

const SpeciesDeliverableCard = (props: EditProps): JSX.Element => {
  const { deliverable, setSubmitButtonDisalbed } = props;
  const dispatch = useAppDispatch();

  const ppsSearchResults = useAppSelector(selectParticipantProjectSpeciesListRequest(deliverable.projectId));

  useEffect(() => {
    const disabled = !ppsSearchResults?.data?.length ||
      ppsSearchResults?.data?.every((species) => species.participantProjectSpecies.submissionStatus === 'Approved')
    setSubmitButtonDisalbed?.(disabled)
  }, [ppsSearchResults, setSubmitButtonDisalbed])

  useEffect(() => {
    void dispatch(requestListParticipantProjectSpecies(deliverable.projectId));
  }, [deliverable.projectId]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <SpeciesDeliverableStatusMessage deliverable={deliverable} species={ppsSearchResults?.data || []} />
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Metadata deliverable={deliverable} />
        <SpeciesDeliverableTable deliverable={deliverable} />
      </Card>
    </Box>
  );
};

export default SpeciesDeliverableCard;
