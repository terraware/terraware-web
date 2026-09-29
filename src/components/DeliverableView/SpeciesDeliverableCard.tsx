import React, { type JSX, useEffect, useMemo } from 'react';

import { Box } from '@mui/material';

import Metadata from 'src/components/DeliverableView/Metadata';
import { EditProps } from 'src/components/DeliverableView/types';
import SpeciesDeliverableTable from 'src/components/SpeciesDeliverableTable';
import Card from 'src/components/common/Card';
import { useGetSpeciesForProjectQuery } from 'src/queries/generated/acceleratorProjectSpecies';

import SpeciesDeliverableStatusMessage from './SpeciesDeliverableStatusMessage';

const SpeciesDeliverableCard = (props: EditProps): JSX.Element => {
  const { deliverable, setSubmitButtonDisabled } = props;
  const { currentData } = useGetSpeciesForProjectQuery(deliverable.projectId);
  const projectSpecies = useMemo(() => currentData?.speciesForParticipantProjects ?? [], [currentData]);

  useEffect(() => {
    const disabled =
      !projectSpecies.length ||
      projectSpecies.every((species) => species.participantProjectSpecies.submissionStatus === 'Approved');
    setSubmitButtonDisabled?.(disabled);
  }, [projectSpecies, setSubmitButtonDisabled]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      <SpeciesDeliverableStatusMessage deliverable={deliverable} species={projectSpecies} />
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Metadata deliverable={deliverable} />
        <SpeciesDeliverableTable deliverable={deliverable} />
      </Card>
    </Box>
  );
};

export default SpeciesDeliverableCard;
