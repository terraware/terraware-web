import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Divider, Stack, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingPlanDensitySection from './PlantingPlanDensitySection';
import PlantingPlanSpeciesSection, { SpeciesTarget } from './PlantingPlanSpeciesSection';
import PlantingPlanStats from './PlantingPlanStats';

const PLACEHOLDER = '-';

const parseDensity = (value: string | undefined): number | undefined => {
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export type PlantingPlanSiteGoalsProps = {
  plantingSite: PlantingSitePayload;
};

const PlantingPlanSiteGoals = ({ plantingSite }: PlantingPlanSiteGoalsProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();

  const strata = useMemo(() => plantingSite.strata ?? [], [plantingSite.strata]);

  const [densityByStratum, setDensityByStratum] = useState<Record<number, string>>({});
  const [speciesTargets, setSpeciesTargets] = useState<SpeciesTarget[]>([]);

  const onDensityChange = useCallback((stratumId: number, value: string) => {
    setDensityByStratum((current) => ({ ...current, [stratumId]: value }));
  }, []);

  const onAddSpecies = useCallback((speciesId: number, target: string) => {
    setSpeciesTargets((current) => [...current, { speciesId, target }]);
  }, []);

  const onUpdateSpecies = useCallback((speciesId: number, target: string) => {
    setSpeciesTargets((current) =>
      current.map((entry) => (entry.speciesId === speciesId ? { ...entry, target } : entry))
    );
  }, []);

  const onRemoveSpecies = useCallback((speciesId: number) => {
    setSpeciesTargets((current) => current.filter((entry) => entry.speciesId !== speciesId));
  }, []);

  const targetPlants = useMemo(() => {
    let total = 0;
    let anyDensitySet = false;
    strata.forEach((stratum) => {
      const density = parseDensity(densityByStratum[stratum.id]);
      if (density !== undefined) {
        anyDensitySet = true;
        stratum.substrata.forEach((substratum) => {
          total += Math.round(substratum.areaHa * density);
        });
      }
    });
    return anyDensitySet ? total : undefined;
  }, [densityByStratum, strata]);

  const stats = useMemo(() => {
    const area =
      plantingSite.areaHa === undefined
        ? PLACEHOLDER
        : strings.formatString(strings.X_HA, numberFormatter.format(plantingSite.areaHa, { decimals: 1 })).toString();

    const targetPlantingDensity =
      targetPlants === undefined || !plantingSite.areaHa
        ? PLACEHOLDER
        : strings
            .formatString(strings.X_PER_HA, numberFormatter.format(Math.round(targetPlants / plantingSite.areaHa)))
            .toString();

    return {
      area,
      strata: numberFormatter.format(strata.length),
      targetPlantingDensity,
      targetPlants:
        targetPlants === undefined
          ? PLACEHOLDER
          : strings.formatString(strings.X_PLANTS, numberFormatter.format(targetPlants)).toString(),
      targetSpecies: speciesTargets.length === 0 ? PLACEHOLDER : numberFormatter.format(speciesTargets.length),
    };
  }, [numberFormatter, plantingSite.areaHa, speciesTargets.length, strata.length, targetPlants]);

  return (
    <Card
      style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: theme.spacing(3), width: '100%' }}
      radius={theme.spacing(1)}
    >
      <PlantingPlanStats
        targetPlants={stats.targetPlants}
        area={stats.area}
        targetPlantingDensity={stats.targetPlantingDensity}
        targetSpecies={stats.targetSpecies}
        strata={stats.strata}
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        divider={<Divider orientation='vertical' flexItem sx={{ borderColor: theme.palette.TwClrBrdrTertiary }} />}
        spacing={3}
        marginTop={theme.spacing(3)}
      >
        <PlantingPlanDensitySection
          plantingSite={plantingSite}
          densityByStratum={densityByStratum}
          onDensityChange={onDensityChange}
        />
        <PlantingPlanSpeciesSection
          speciesTargets={speciesTargets}
          onAdd={onAddSpecies}
          onUpdate={onUpdateSpecies}
          onRemove={onRemoveSpecies}
        />
      </Stack>
    </Card>
  );
};

export default PlantingPlanSiteGoals;
