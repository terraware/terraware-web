import React, { type JSX, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Dropdown, Icon } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Textfield from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useBotanicalCountries } from 'src/hooks/useBotanicalCountries';
import { useLocalization } from 'src/providers';
import { useOverrideProjectSpeciesDataMutation } from 'src/queries/generated/species';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';

import ProjectCheckSummary from './SpeciesCheck/ProjectCheckSummary';
import { NATIVITY_VALUES, Nativity, getNativityLabel } from './SpeciesCheck/types';

export type OverrideSpeciesModalProps = {
  onClose: () => void;
  speciesId: number;
  speciesName: string;
  project: Project;
  currentNativity?: Nativity;
  currentJustification?: string;
};

export default function OverrideSpeciesModal({
  onClose,
  speciesId,
  speciesName,
  project,
  currentNativity,
  currentJustification,
}: OverrideSpeciesModalProps): JSX.Element {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { countries } = useLocalization();
  const { botanicalCountries } = useBotanicalCountries();
  const [overrideSpecies, { isLoading: isBusy }] = useOverrideProjectSpeciesDataMutation();

  const [nativity, setNativity] = useState<Nativity | undefined>(currentNativity);
  const [justification, setJustification] = useState<string>(currentJustification ?? '');

  const countryName = useMemo(
    () => countries?.find((country) => country.code === project.countryCode)?.name,
    [countries, project.countryCode]
  );
  const botanicalCountryName = useMemo(
    () => botanicalCountries.find((bc) => bc.code === project.botanicalCountryCode)?.name,
    [botanicalCountries, project.botanicalCountryCode]
  );

  const nativityOptions = NATIVITY_VALUES.map((value) => ({ label: getNativityLabel(value), value }));

  const onOverride = async () => {
    if (!nativity) {
      return;
    }
    try {
      await overrideSpecies({
        overrides: [
          {
            projectId: project.id,
            speciesId,
            overriddenNativity: nativity,
            overriddenJustification: justification,
          },
        ],
      }).unwrap();
      onClose();
    } catch {
      snackbar.toastError();
    }
  };

  return (
    <>
      {isBusy && <BusySpinner withSkrim />}
      <DialogBox
        onClose={onClose}
        open={true}
        title={strings.OVERRIDE_SPECIES}
        size='large'
        scrolled
        middleButtons={[
          <Button
            id='cancel'
            key='cancel'
            label={strings.CANCEL}
            onClick={onClose}
            priority='secondary'
            type='passive'
            disabled={isBusy}
          />,
          <Button
            id='override'
            key='override'
            label={strings.OVERRIDE}
            onClick={() => void onOverride()}
            disabled={isBusy || !nativity || justification.trim().length === 0}
          />,
        ]}
      >
        <Box display='flex' flexDirection='column' gap={theme.spacing(2)} textAlign='left'>
          <Box
            sx={{
              backgroundColor: theme.palette.TwClrBgSecondary,
              borderRadius: theme.spacing(1),
              padding: theme.spacing(2),
            }}
          >
            <ProjectCheckSummary
              projectName={project.name}
              countryName={countryName}
              botanicalCountryName={botanicalCountryName}
              updates={1}
              speciesChecked={1}
            />
          </Box>
          <Box
            sx={{
              border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              backgroundColor: theme.palette.TwClrBgWarningTertiary,
              padding: theme.spacing(2),
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing(1.5),
            }}
          >
            <Box display='flex' alignItems='center' gap={theme.spacing(1)}>
              <Icon name='warning' size='medium' fillColor={theme.palette.TwClrIcnWarning} />
              <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrTxt}>
                {speciesName}
              </Typography>
            </Box>
            <Dropdown
              id='override-status'
              label={strings.STATUS}
              options={nativityOptions}
              selectedValue={nativity}
              onChange={(value: string) => setNativity(value as Nativity)}
              fixedMenu
            />
            <Textfield
              id='override-justification'
              label={''}
              type='text'
              value={justification}
              placeholder={strings.JUSTIFICATION_FOR_PLANTING}
              onChange={(value) => setJustification(value as string)}
            />
          </Box>
        </Box>
      </DialogBox>
    </>
  );
}
