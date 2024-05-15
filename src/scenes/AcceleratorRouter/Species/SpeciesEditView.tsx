import React, { useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import PageSnackbar from 'src/components/PageSnackbar';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { useParticipantProjectSpeciesData } from 'src/providers/ParticipantProject/ParticipantProjectSpeciesContext';
import { useProject } from 'src/providers/hooks';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';

export default function SpeciesEditView(): JSX.Element {
  const theme = useTheme();
  const { goToParticipantProjectSpecies } = useNavigateTo();
  const { isMobile } = useDeviceInfo();
  const { currentParticipantProjectSpecies, currentSpecies, isBusy, participantProjectSpeciesId, update } =
    useParticipantProjectSpeciesData();
  const { projectId } = useProject();
  const { currentDeliverable, deliverableId } = useDeliverableData();

  const [speciesRecord, setSpeciesRecord, onChangeSpecies] = useForm<Species | undefined>(undefined);
  const [rationale, setRationale] = useState(currentParticipantProjectSpecies?.rationale || '');

  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  useEffect(() => {
    if (currentSpecies) {
      setSpeciesRecord(currentSpecies);
    }
  }, [currentSpecies, setSpeciesRecord]);

  const saveSpecies = () => {
    if (!(currentParticipantProjectSpecies && speciesRecord)) {
      return;
    }

    if (!speciesRecord.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      const nextParticipantProjectSpecies: ParticipantProjectSpecies = {
        ...currentParticipantProjectSpecies,
        rationale,
      };

      update(speciesRecord, nextParticipantProjectSpecies);
    }
  };

  return (
    <TfMain>
      {(isBusy || !currentSpecies) && <BusySpinner withSkrim={true} />}
      {currentSpecies && (
        <PageForm
          cancelID='cancelEditSpecies'
          saveID='saveEditSpecies'
          onCancel={() => goToParticipantProjectSpecies(deliverableId, projectId, participantProjectSpeciesId)}
          onSave={saveSpecies}
        >
          <Box marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
            <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxt}>
              {strings.formatString(strings.DELIVERABLE_PROJECT, currentDeliverable?.projectName ?? '')}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              {currentSpecies.scientificName}
            </Typography>
            <PageSnackbar />
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: '32px',
              padding: theme.spacing(3),
              margin: 0,
            }}
          >
            <Grid item xs={12} paddingBottom={theme.spacing(2)}>
              <TextField
                label={strings.RATIONALE}
                id='rationale'
                type='text'
                value={rationale}
                onChange={(value) => setRationale(value as string)}
              />
            </Grid>
            {speciesRecord && (
              <SpeciesDetailsForm
                gridSize={gridSize()}
                record={speciesRecord}
                onChange={onChangeSpecies}
                nameFormatError={nameFormatError}
                setNameFormatError={setNameFormatError}
              />
            )}
          </Box>
        </PageForm>
      )}
    </TfMain>
  );
}
