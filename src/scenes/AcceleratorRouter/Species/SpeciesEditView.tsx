import React, { useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Dropdown, Message } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import PageSnackbar from 'src/components/PageSnackbar';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { useParticipantProjectSpeciesData } from 'src/providers/ParticipantProject/ParticipantProjectSpeciesContext';
import { useLocalization, useOrganization, useProject } from 'src/providers/hooks';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import strings from 'src/strings';
import { ParticipantProjectSpecies, getSpeciesNativeCategoryOptions } from 'src/types/ParticipantProjectSpecies';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';

import SpeciesInternalFieldsForm from './SpeciesInternalFieldsForm';

export default function SpeciesEditView(): JSX.Element {
  const theme = useTheme();
  const { goToParticipantProjectSpecies } = useNavigateTo();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { currentParticipantProjectSpecies, currentSpecies, isBusy, participantProjectSpeciesId, update } =
    useParticipantProjectSpeciesData();
  const { projectId } = useProject();
  const { currentDeliverable, deliverableId } = useDeliverableData();
  const { activeLocale } = useLocalization();

  const [speciesRecord, setSpeciesRecord, onChangeSpecies] = useForm<Species | undefined>(undefined);
  const [participantProjectSpeciesRecord, setParticipantProjectSpeciesRecord, onChangeParticipantProjectSpecies] =
    useForm<ParticipantProjectSpecies | undefined>(undefined);

  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  const onChange = (id: string, value: unknown): void => {
    if (
      (['rationale', 'speciesNativeCategory'] as (keyof ParticipantProjectSpecies)[]).includes(
        id as keyof ParticipantProjectSpecies
      )
    ) {
      return onChangeParticipantProjectSpecies(id, value);
    }
    return onChangeSpecies(id, value);
  };

  useEffect(() => {
    if (currentSpecies) {
      setSpeciesRecord(currentSpecies);
    }
  }, [currentSpecies, setSpeciesRecord]);

  useEffect(() => {
    if (currentParticipantProjectSpecies) {
      setParticipantProjectSpeciesRecord(currentParticipantProjectSpecies);
    }
  }, [currentParticipantProjectSpecies, setParticipantProjectSpeciesRecord]);

  const saveSpecies = () => {
    if (!(currentParticipantProjectSpecies && speciesRecord)) {
      return;
    }

    if (!speciesRecord.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      update(speciesRecord, participantProjectSpeciesRecord);
    }
  };

  return (
    <TfMain>
      {(isBusy || !speciesRecord || !participantProjectSpeciesRecord) && <BusySpinner withSkrim={true} />}
      {speciesRecord && participantProjectSpeciesRecord && (
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
              {speciesRecord.scientificName}
            </Typography>
            <PageSnackbar />
          </Box>
          <Box marginBottom={4}>
            <Message
              title={strings.formatString(strings.EDITING_SPECIES_DATA_FOR_ORGANIZATION, selectedOrganization.name)}
              body={strings.formatString(
                strings.EDITING_SPECIES_DATA_FOR_ORGANIZATION_WARNING,
                selectedOrganization.name
              )}
              type='page'
              priority='warning'
            />
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: '32px 32px 0 0',
              padding: theme.spacing(3),
              margin: 0,
            }}
          >
            <Grid item xs={12} paddingBottom={theme.spacing(2)}>
              <Dropdown
                id='speciesNativeCategory'
                selectedValue={participantProjectSpeciesRecord?.speciesNativeCategory}
                onChange={(value) => onChange('speciesNativeCategory', value)}
                options={getSpeciesNativeCategoryOptions(activeLocale)}
                label={strings.NATIVE_NON_NATIVE}
                aria-label={strings.NATIVE_NON_NATIVE}
                placeholder={strings.SELECT}
                fixedMenu
                required
              />
            </Grid>
            <Grid item xs={12} paddingBottom={theme.spacing(2)}>
              <TextField
                label={strings.RATIONALE}
                id='rationale'
                type='text'
                value={participantProjectSpeciesRecord?.rationale}
                onChange={(value: unknown) => onChangeParticipantProjectSpecies('rationale', value)}
              />
            </Grid>
            {speciesRecord && (
              <SpeciesDetailsForm
                gridSize={gridSize()}
                record={speciesRecord}
                participantProjectSpeciesRecord={participantProjectSpeciesRecord}
                onChange={onChange}
                nameFormatError={nameFormatError}
                setNameFormatError={setNameFormatError}
                additionalFields={<SpeciesInternalFieldsForm speciesRecord={speciesRecord} onChange={onChange} />}
              />
            )}
          </Box>
        </PageForm>
      )}
    </TfMain>
  );
}
