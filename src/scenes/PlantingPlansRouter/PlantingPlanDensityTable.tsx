import React, { type JSX, useState } from 'react';

import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import TextField from 'src/components/common/Textfield/Textfield';
import { PlantingSitePayload, StratumResponsePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

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

export type CommitStratumDensity = (
  stratumId: number,
  densityType: DensityType,
  value: number | undefined
) => Promise<void>;

export type PlantingPlanDensityTableProps = {
  plantingSite: PlantingSitePayload;
  densityType: DensityType;
  title: string;
  onCommitDensity: CommitStratumDensity;
};

const PlantingPlanDensityTable = ({
  plantingSite,
  densityType,
  title,
  onCommitDensity,
}: PlantingPlanDensityTableProps): JSX.Element => {
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
            onCommitDensity={onCommitDensity}
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
  onCommitDensity: CommitStratumDensity;
};

const StratumRow = ({
  stratum,
  densityType,
  areaLabel,
  perHaLabel,
  plantsLabel,
  onCommitDensity,
}: StratumRowProps): JSX.Element => {
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
        <StratumDensityEditor stratum={stratum} densityType={densityType} onCommitDensity={onCommitDensity} />
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
  onCommitDensity: CommitStratumDensity;
};

const StratumDensityEditor = ({ stratum, densityType, onCommitDensity }: StratumDensityEditorProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const density = stratumDensity(stratum, densityType);

  const save = async (value: number | undefined) => {
    setEditing(false);
    setError('');
    setBusy(true);
    await onCommitDensity(stratum.id, densityType, value);
    setBusy(false);
  };

  const commit = async () => {
    const trimmed = draft.trim();

    if (trimmed === '') {
      setError('');
      if (densityType === 'target' && density !== undefined) {
        await save(undefined);
      } else {
        setEditing(false);
      }
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError(strings.PLANTING_DENSITY_MUST_BE_POSITIVE);
      return;
    }

    if (parsed === density) {
      setEditing(false);
      setError('');
      return;
    }

    await save(parsed);
  };

  return (
    <Box display='flex' alignItems='center' justifyContent='flex-end' gap={theme.spacing(0.5)}>
      {editing ? (
        <TextField
          id={`density-${densityType}-${stratum.id}`}
          type='number'
          label=''
          value={draft}
          onChange={(next) => {
            setDraft(String(next ?? ''));
            if (error) {
              setError('');
            }
          }}
          onBlur={() => void commit()}
          onKeyDown={(key: string) => {
            if (key === 'Enter' && document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          min={0}
          errorText={error || undefined}
          autoFocus
          disabled={busy}
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
            disabled={busy}
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
