import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Dropdown, Message } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import PageSnackbar from 'src/components/PageSnackbar';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useAcceleratorProjectSpeciesData } from 'src/providers/AcceleratorProject/AcceleratorProjectSpeciesContext';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { useLocalization, useOrganization, useProject } from 'src/providers/hooks';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import strings from 'src/strings';
import { AcceleratorProjectSpecies, getSpeciesNativeCategoryOptions } from 'src/types/AcceleratorProjectSpecies';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';

import SpeciesInternalFieldsForm from './SpeciesInternalFieldsForm';

export default function SpeciesEditView(): JSX.Element {
  const theme = useTheme();
  const { goToAcceleratorProjectSpecies } = useNavigateTo();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { currentAcceleratorProjectSpecies, currentSpecies, isBusy, acceleratorProjectSpeciesId, update } =
    useAcceleratorProjectSpeciesData();
  const { projectId } = useProject();
  const { currentDeliverable, deliverableId } = useDeliverableData();
  const { activeLocale } = useLocalization();

  const [speciesRecord, setSpeciesRecord, , onChangeSpeciesCallback] = useForm<Species | undefined>(undefined);
  const [acceleratorProjectSpeciesRecord, setAcceleratorProjectSpeciesRecord, , onChangeProjectSpeciesCallback] =
    useForm<AcceleratorProjectSpecies | undefined>(undefined);

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

  useEffect(() => {
    if (currentAcceleratorProjectSpecies) {
      setAcceleratorProjectSpeciesRecord(currentAcceleratorProjectSpecies);
    }
  }, [currentAcceleratorProjectSpecies, setAcceleratorProjectSpeciesRecord]);

  const saveSpecies = useCallback(() => {
    if (!(currentAcceleratorProjectSpecies && speciesRecord)) {
      return;
    }

    if (!speciesRecord.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      update(speciesRecord, acceleratorProjectSpeciesRecord);
    }
  }, [currentAcceleratorProjectSpecies, acceleratorProjectSpeciesRecord, speciesRecord, update]);

  return (
    <TfMain>
      {(isBusy || !speciesRecord || !acceleratorProjectSpeciesRecord) && <BusySpinner withSkrim={true} />}
      {speciesRecord && acceleratorProjectSpeciesRecord && (
        <PageForm
          cancelID='cancelEditSpecies'
          saveID='saveEditSpecies'
          onCancel={() => goToAcceleratorProjectSpecies(deliverableId, projectId, acceleratorProjectSpeciesId)}
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
              title={strings.formatString(
                strings.EDITING_SPECIES_DATA_FOR_ORGANIZATION,
                selectedOrganization?.name || ''
              )}
              body={strings.formatString(
                strings.EDITING_SPECIES_DATA_FOR_ORGANIZATION_WARNING,
                selectedOrganization?.name || ''
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
                selectedValue={acceleratorProjectSpeciesRecord?.speciesNativeCategory}
                onChange={onChangeProjectSpeciesCallback('speciesNativeCategory')}
                options={getSpeciesNativeCategoryOptions(activeLocale)}
                label={strings.NATIVE_NON_NATIVE}
                aria-label={strings.NATIVE_NON_NATIVE}
                placeholder={strings.SELECT}
                fixedMenu
                required
              />
            </Grid>
            <Grid item xs={12} paddingBottom={theme.spacing(3)}>
              <TextField
                label={strings.RATIONALE}
                id='rationale'
                type='text'
                value={acceleratorProjectSpeciesRecord?.rationale}
                onChange={onChangeProjectSpeciesCallback('rationale')}
              />
            </Grid>

            {speciesRecord && (
              <Grid
                sx={{ borderTop: `1px solid ${theme.palette.TwClrBaseGray100}` }}
                container
                padding={theme.spacing(3, 0, 0, 0)}
              >
                <SpeciesDetailsForm
                  gridSize={gridSize()}
                  record={speciesRecord}
                  acceleratorProjectSpeciesRecord={acceleratorProjectSpeciesRecord}
                  onChange={onChangeSpeciesCallback}
                  nameFormatError={nameFormatError}
                  setNameFormatError={setNameFormatError}
                  additionalFields={
                    <SpeciesInternalFieldsForm speciesRecord={speciesRecord} onChange={onChangeSpeciesCallback} />
                  }
                />
              </Grid>
            )}
          </Box>
        </PageForm>
      )}
    </TfMain>
  );
}
