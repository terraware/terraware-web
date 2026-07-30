import React, { type JSX, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import TextField from 'src/components/common/Textfield/Textfield';
import {
  PlantingSitePayload,
  StratumResponsePayload,
  SubstratumResponsePayload,
} from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingPlanPlantsChip from './PlantingPlanPlantsChip';

const PLACEHOLDER = '-';

const parseDensity = (value: string | undefined): number | undefined => {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export type PlantingPlanDensitySectionProps = {
  plantingSite: PlantingSitePayload;
  densityByStratum: Record<number, string>;
  onDensityChange: (stratumId: number, value: string) => void;
};

const PlantingPlanDensitySection = ({
  plantingSite,
  densityByStratum,
  onDensityChange,
}: PlantingPlanDensitySectionProps): JSX.Element => {
  const theme = useTheme();
  const strata = useMemo(() => plantingSite.strata ?? [], [plantingSite.strata]);

  const totalPlants = useMemo(
    () =>
      strata.reduce((sum, stratum) => {
        const density = parseDensity(densityByStratum[stratum.id]);
        if (density === undefined) {
          return sum;
        }
        return (
          sum + stratum.substrata.reduce((total, substratum) => total + Math.round(substratum.areaHa * density), 0)
        );
      }, 0),
    [densityByStratum, strata]
  );

  return (
    <Box flex={1} minWidth={0}>
      <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginBottom={theme.spacing(2)}>
        {strings.SET_TARGET_DENSITY_DESCRIPTION}
      </Typography>
      <Box display='flex' alignItems='center' gap={theme.spacing(1)} marginBottom={theme.spacing(2)}>
        <Icon name='iconMyLocation' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
        <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrBaseBlack} flex={1}>
          {strings.DENSITY}
        </Typography>
        <PlantingPlanPlantsChip plants={totalPlants} />
      </Box>

      <Box display='flex' flexDirection='column' gap={theme.spacing(2)}>
        {strata.map((stratum) => (
          <StratumGroup
            key={stratum.id}
            stratum={stratum}
            density={densityByStratum[stratum.id] ?? ''}
            onDensityChange={(value) => onDensityChange(stratum.id, value)}
          />
        ))}
      </Box>
    </Box>
  );
};

type StratumGroupProps = {
  stratum: StratumResponsePayload;
  density: string;
  onDensityChange: (value: string) => void;
};

const StratumGroup = ({ stratum, density, onDensityChange }: StratumGroupProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();

  const parsedDensity = parseDensity(density);

  const plantsFor = (areaHa: number): number | undefined =>
    parsedDensity === undefined ? undefined : Math.round(areaHa * parsedDensity);

  const stratumTotal =
    parsedDensity === undefined
      ? undefined
      : stratum.substrata.reduce((sum, substratum) => sum + (plantsFor(substratum.areaHa) ?? 0), 0);

  const areaLabel = (areaHa: number) =>
    strings.formatString(strings.X_HA, numberFormatter.format(areaHa, { decimals: 1 })).toString();

  const densityLabel =
    parsedDensity === undefined
      ? PLACEHOLDER
      : strings.formatString(strings.X_PER_HA, numberFormatter.format(parsedDensity)).toString();

  const plantsLabel = (plants: number | undefined) =>
    plants === undefined ? PLACEHOLDER : numberFormatter.format(plants);

  return (
    <Box sx={{ border: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}>
      <Box
        sx={{
          alignItems: 'center',
          backgroundColor: theme.palette.TwClrBgSecondary,
          display: 'flex',
          gap: theme.spacing(2),
          padding: theme.spacing(1.5, 2),
        }}
      >
        <Box display='flex' alignItems='baseline' gap={theme.spacing(1)} flex={1} minWidth={0}>
          <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {stratum.name}
          </Typography>
          <Typography fontSize='14px' color={theme.palette.TwClrTxt}>
            {areaLabel(stratum.areaHa)}
          </Typography>
        </Box>
        <StratumDensityEditor value={density} onChange={onDensityChange} />
        <Typography
          fontSize='16px'
          fontWeight={600}
          color={theme.palette.TwClrBaseBlack}
          minWidth='90px'
          textAlign='right'
        >
          {stratumTotal === undefined
            ? PLACEHOLDER
            : strings.formatString(strings.X_PLANTS, numberFormatter.format(stratumTotal)).toString()}
        </Typography>
      </Box>

      {stratum.substrata.map((substratum: SubstratumResponsePayload) => (
        <Box
          key={substratum.id}
          sx={{ alignItems: 'center', display: 'flex', gap: theme.spacing(2), padding: theme.spacing(1.5, 2) }}
        >
          <Box display='flex' alignItems='baseline' gap={theme.spacing(1)} flex={1} minWidth={0}>
            <Typography fontSize='16px' fontWeight={400} color={theme.palette.TwClrTxt}>
              {substratum.name}
            </Typography>
            <Typography fontSize='14px' color={theme.palette.TwClrTxt}>
              {areaLabel(substratum.areaHa)}
            </Typography>
          </Box>
          <Typography fontSize='16px' color={theme.palette.TwClrTxtSecondary} minWidth='70px' textAlign='right'>
            {densityLabel}
          </Typography>
          <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt} minWidth='90px' textAlign='right'>
            {plantsLabel(plantsFor(substratum.areaHa))}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

type StratumDensityEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const StratumDensityEditor = ({ value, onChange }: StratumDensityEditorProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const parsed = parseDensity(value);

  const commit = () => {
    onChange(draft.trim());
    setEditing(false);
  };

  return (
    <Box display='flex' alignItems='center' gap={theme.spacing(0.5)}>
      {editing ? (
        <TextField
          id='stratum-density'
          type='number'
          label=''
          value={draft}
          onChange={(next) => setDraft(String(next ?? ''))}
          onBlur={commit}
          onKeyDown={(key: string) => {
            if (key === 'Enter' && document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          min={0}
          autoFocus
          sx={{ width: '80px' }}
        />
      ) : (
        <>
          <Typography fontSize='16px' fontWeight={400} color={theme.palette.TwClrTxt}>
            {parsed === undefined ? PLACEHOLDER : numberFormatter.format(parsed)}
          </Typography>
          <Button
            icon='iconEdit'
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            priority='ghost'
            size='small'
            type='passive'
          />
        </>
      )}
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
        {strings.formatString(strings.X_PER_HA, '').toString().trim()}
      </Typography>
    </Box>
  );
};

export default PlantingPlanDensitySection;
