import React, { type JSX, useState } from 'react';

import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import TextField from 'src/components/common/Textfield/Textfield';
import { PlantingSitePayload, StratumResponsePayload } from 'src/queries/generated/plantingSites';
import { useUpdateStratumMutation } from 'src/queries/generated/strata';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import PlantingPlanPlantsChip from './PlantingPlanPlantsChip';
import {
  DensityType,
  plantsForArea,
  siteDensity,
  siteGoalPlants,
  stratumDensity,
  stratumPlants,
} from './plantingPlanGoals';

const PLACEHOLDER = '-';
const GRID_COLUMNS = 'minmax(0, 1fr) 150px 90px';

export type PlantingPlanDensityTableProps = {
  plantingSite: PlantingSitePayload;
  densityType: DensityType;
  title: string;
};

const PlantingPlanDensityTable = ({ plantingSite, densityType, title }: PlantingPlanDensityTableProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const strata = plantingSite.strata ?? [];

  const totalPlants = siteGoalPlants(plantingSite, densityType) ?? 0;

  const cellText = (value: string, options?: { bold?: boolean; secondary?: boolean; align?: 'left' | 'right' }) => (
    <Typography
      fontSize='16px'
      fontWeight={options?.bold ? 600 : 500}
      color={options?.secondary ? theme.palette.TwClrTxtSecondary : theme.palette.TwClrTxt}
      textAlign={options?.align ?? 'left'}
    >
      {value}
    </Typography>
  );

  const areaLabel = (areaHa: number) =>
    strings.formatString(strings.X_HA, numberFormatter.format(areaHa, { decimals: 1 })).toString();

  const perHaLabel = (density: number | undefined) =>
    density === undefined
      ? PLACEHOLDER
      : strings.formatString(strings.X_PER_HA, numberFormatter.format(density)).toString();

  const plantsLabel = (plants: number | undefined) =>
    plants === undefined ? PLACEHOLDER : numberFormatter.format(plants);

  return (
    <Box>
      <Box display='flex' alignItems='center' gap={theme.spacing(1)} marginBottom={theme.spacing(1)}>
        <Icon name='iconMyLocation' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
        <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrBaseBlack} flex={1}>
          {title}
        </Typography>
        <PlantingPlanPlantsChip plants={totalPlants} />
      </Box>

      <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}>
        <Box
          display='grid'
          gridTemplateColumns={GRID_COLUMNS}
          gap={theme.spacing(2)}
          sx={{ padding: theme.spacing(1, 2), borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
        >
          {cellText(strings.STRATA, { secondary: true })}
          {cellText(strings.DENSITY, { secondary: true, align: 'right' })}
          {cellText(strings.PLANTS, { secondary: true, align: 'right' })}
        </Box>

        {strata.map((stratum) => (
          <StratumRow
            key={stratum.id}
            stratum={stratum}
            densityType={densityType}
            areaLabel={areaLabel}
            perHaLabel={perHaLabel}
            plantsLabel={plantsLabel}
          />
        ))}

        <Box
          display='grid'
          gridTemplateColumns={GRID_COLUMNS}
          gap={theme.spacing(2)}
          alignItems='center'
          sx={{ backgroundColor: theme.palette.TwClrBgSecondary, padding: theme.spacing(1.5, 2) }}
        >
          <Box display='flex' alignItems='baseline' gap={theme.spacing(1)} minWidth={0}>
            {cellText(strings.SITE, { secondary: true })}
            {plantingSite.areaHa !== undefined && cellText(areaLabel(plantingSite.areaHa), { secondary: true })}
          </Box>
          {cellText(perHaLabel(siteDensity(plantingSite, densityType)), { secondary: true, align: 'right' })}
          {cellText(plantsLabel(siteGoalPlants(plantingSite, densityType)), { bold: true, align: 'right' })}
        </Box>
      </Box>
    </Box>
  );
};

type StratumRowProps = {
  stratum: StratumResponsePayload;
  densityType: DensityType;
  areaLabel: (areaHa: number) => string;
  perHaLabel: (density: number | undefined) => string;
  plantsLabel: (plants: number | undefined) => string;
};

const StratumRow = ({ stratum, densityType, areaLabel, perHaLabel, plantsLabel }: StratumRowProps): JSX.Element => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const density = stratumDensity(stratum, densityType);

  return (
    <>
      <Box
        display='grid'
        gridTemplateColumns={GRID_COLUMNS}
        gap={theme.spacing(2)}
        alignItems='center'
        sx={{ padding: theme.spacing(2, 0.5) }}
      >
        <Box display='flex' alignItems='center' gap={'5px'} minWidth={0}>
          <IconButton onClick={() => setExpanded((current) => !current)} size='small'>
            <Icon name={expanded ? 'caretUp' : 'caretDown'} />
          </IconButton>
          <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrTxt} paddingLeft={theme.spacing(2)}>
            {stratum.name}
          </Typography>
          <Typography
            fontSize='14px'
            fontWeight={400}
            color={theme.palette.TwClrTxt}
            marginLeft={theme.spacing(1)}
            paddingRight={'11px'}
          >
            {areaLabel(stratum.areaHa)}
          </Typography>
        </Box>
        <StratumDensityEditor stratum={stratum} densityType={densityType} />
        <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrBaseBlack} textAlign='right'>
          {plantsLabel(stratumPlants(stratum, densityType))}
        </Typography>
      </Box>

      {expanded &&
        stratum.substrata.map((substratum) => (
          <Box
            key={substratum.id}
            display='grid'
            gridTemplateColumns={GRID_COLUMNS}
            gap={theme.spacing(2)}
            alignItems='center'
            sx={{ backgroundColor: theme.palette.TwClrBgSecondary, padding: theme.spacing(2) }}
          >
            <Box display='flex' alignItems='baseline' gap={theme.spacing(1)} minWidth={0}>
              <Typography fontSize='16px' color={theme.palette.TwClrTxt}>
                {substratum.name}
              </Typography>
              <Typography fontSize='14px' color={theme.palette.TwClrTxt}>
                {areaLabel(substratum.areaHa)}
              </Typography>
            </Box>
            <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary} textAlign='right'>
              {perHaLabel(density)}
            </Typography>
            <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt} textAlign='right'>
              {plantsLabel(plantsForArea(substratum.areaHa, density))}
            </Typography>
          </Box>
        ))}
    </>
  );
};

type StratumDensityEditorProps = {
  stratum: StratumResponsePayload;
  densityType: DensityType;
};

const StratumDensityEditor = ({ stratum, densityType }: StratumDensityEditorProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const snackbar = useSnackbar();
  const [updateStratum, { isLoading }] = useUpdateStratumMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const density = stratumDensity(stratum, densityType);

  const commit = async () => {
    setEditing(false);
    const parsed = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(parsed) || parsed < 0 || parsed === density) {
      return;
    }
    try {
      await updateStratum({
        id: stratum.id,
        updateStratumRequestPayload:
          densityType === 'initial'
            ? { initialPlantingDensity: parsed, targetPlantDensity: stratum.targetPlantDensity }
            : { initialPlantingDensity: stratum.initialPlantingDensity, targetPlantDensity: parsed },
      }).unwrap();
    } catch (e) {
      snackbar.toastError();
    }
  };

  return (
    <Box display='flex' alignItems='center' justifyContent='flex-end' gap={theme.spacing(0.5)}>
      {editing ? (
        <TextField
          id={`density-${densityType}-${stratum.id}`}
          type='number'
          label=''
          value={draft}
          onChange={(next) => setDraft(String(next ?? ''))}
          onBlur={() => void commit()}
          onKeyDown={(key: string) => {
            if (key === 'Enter' && document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          min={0}
          autoFocus
          disabled={isLoading}
          sx={{ width: '72px' }}
        />
      ) : (
        <>
          <Typography fontSize='16px' color={theme.palette.TwClrBaseBlack}>
            {density === undefined ? PLACEHOLDER : numberFormatter.format(density)}
          </Typography>
          <IconButton
            onClick={() => {
              setDraft(density === undefined ? '' : String(density));
              setEditing(true);
            }}
            size='small'
            disabled={isLoading}
          >
            <Icon name={'iconEdit'} />
          </IconButton>
        </>
      )}
      <Typography fontSize='14px' color={theme.palette.TwClrTxt}>
        {strings.formatString(strings.X_PER_HA, '').toString().trim()}
      </Typography>
    </Box>
  );
};

export default PlantingPlanDensityTable;
