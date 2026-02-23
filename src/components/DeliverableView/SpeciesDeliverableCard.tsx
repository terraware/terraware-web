import React, { type JSX, useEffect } from 'react';

import { Box } from '@mui/material';

import Metadata from 'src/components/DeliverableView/Metadata';
import { EditProps } from 'src/components/DeliverableView/types';
import SpeciesDeliverableTable from 'src/components/SpeciesDeliverableTable';
import Card from 'src/components/common/Card';
import { requestListAcceleratorProjectSpecies } from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesAsyncThunks';
import { selectAcceleratorProjectSpeciesListRequest } from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

import SpeciesDeliverableStatusMessage from './SpeciesDeliverableStatusMessage';

const SpeciesDeliverableCard = (props: EditProps): JSX.Element => {
  const { deliverable, setSubmitButtonDisabled } = props;
  const dispatch = useAppDispatch();

  const ppsSearchResults = useAppSelector(selectAcceleratorProjectSpeciesListRequest(deliverable.projectId));

  useEffect(() => {
    const disabled =
      !ppsSearchResults?.data?.length ||
      ppsSearchResults?.data?.every((species) => species.participantProjectSpecies.submissionStatus === 'Approved');
    setSubmitButtonDisabled?.(disabled);
  }, [ppsSearchResults, setSubmitButtonDisabled]);

  useEffect(() => {
    void dispatch(requestListAcceleratorProjectSpecies(deliverable.projectId));
  }, [deliverable.projectId, dispatch]);

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
