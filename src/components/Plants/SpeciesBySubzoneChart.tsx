import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PlantingSiteZone, PlantingSiteSubzone } from 'src/types/PlantingSite';
import { cardTitleStyle } from './PlantingSiteDetails';
import strings from 'src/strings';
import BarChart from 'src/components/common/Chart/BarChart';
import SubzoneSelector, { SubzoneInfo, ZoneInfo } from 'src/components/SubzoneSelector';

export interface Props {
  siteId?: number;
  zones?: PlantingSiteZone[];
  plantsDashboardPreferences?: { [key: string]: unknown };
  setPlantsDashboardPreferences: React.Dispatch<React.SetStateAction<{ [key: string]: unknown } | undefined>>;
  setSelectedSubzoneId: (id?: number) => void;
  setSelectedZoneId: (id?: number) => void;
}

export default function SpeciesBySubzoneChart(props: Props): JSX.Element {
  const {
    zones,
    plantsDashboardPreferences,
    setPlantsDashboardPreferences,
    setSelectedSubzoneId,
    setSelectedZoneId,
    siteId,
  } = props;
  const [selectedSubzone, setSelectedSubzone] = useState<PlantingSiteSubzone>();
  const [selectedZone, setSelectedZone] = useState<PlantingSiteZone>();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const theme = useTheme();

  const onChangeZone = (zone: ZoneInfo | undefined) => {
    if (zones && zone) {
      const foundZone = zones.find((plantingZone) => plantingZone.id.toString() === zone.id.toString());
      const defaultSubzone = foundZone && foundZone.plantingSubzones ? foundZone.plantingSubzones[0] : undefined;
      setSelectedZone(foundZone);
      setSelectedSubzone(defaultSubzone);
      if (setPlantsDashboardPreferences && foundZone) {
        setPlantsDashboardPreferences({
          ...plantsDashboardPreferences,
          zoneId: foundZone.id,
          subzoneId: defaultSubzone?.id,
        });
      }
    } else {
      setSelectedZone(undefined);
      setSelectedSubzone(undefined);
      setPlantsDashboardPreferences({ ...plantsDashboardPreferences, zoneId: undefined, subzoneId: undefined });
    }
  };

  const onChangeSubzone = (subzone: SubzoneInfo | undefined) => {
    if (subzone && selectedZone) {
      const subzoneFound = selectedZone.plantingSubzones.find(
        (plantingSubzone) => plantingSubzone.id.toString() === subzone.id.toString()
      );
      setSelectedSubzone(subzoneFound);
      if (setPlantsDashboardPreferences) {
        setPlantsDashboardPreferences({ ...plantsDashboardPreferences, subzoneId: subzoneFound?.id });
      }
    } else {
      setSelectedSubzone(undefined);
    }
  };

  useEffect(() => {
    if (selectedSubzone) {
      setLabels(selectedSubzone?.populations?.map((population) => population.species_scientificName));
      setValues(selectedSubzone?.populations?.map((population) => population.totalPlants));
      setSelectedSubzoneId(Number(selectedSubzone.id));
    } else {
      setLabels([]);
      setValues([]);
      setSelectedSubzoneId(undefined);
    }
  }, [selectedSubzone, setSelectedSubzoneId]);

  useEffect(() => {
    if (selectedZone) {
      setSelectedZoneId(Number(selectedZone.id));
    } else {
      setSelectedZoneId(undefined);
    }
  }, [selectedZone, setSelectedZoneId]);

  useEffect(() => {
    if (!zones?.length) {
      setSelectedZone(undefined);
      setSelectedSubzone(undefined);
      return;
    }

    if (selectedZone && zones.some((zoneInfo) => zoneInfo.id.toString() === selectedZone.id.toString())) {
      // this site was already processed, we got here because the preferences were updated
      return;
    }

    const lastZone = plantsDashboardPreferences?.zoneId as string;
    const zone = zones.find((z) => z.id.toString() === lastZone?.toString());
    const zoneToBeSelected = zone || zones[0];
    setSelectedZone(zoneToBeSelected);

    const lastSubzone = plantsDashboardPreferences?.subzoneId as string;
    const subzones = zoneToBeSelected.plantingSubzones;
    const subzone = subzones.find((p) => p.id.toString() === lastSubzone?.toString());
    setSelectedSubzone(subzone || subzones[0]);
  }, [plantsDashboardPreferences, zones, selectedZone]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_SUBZONE_AND_SPECIES}</Typography>
      <Box sx={{ marginTop: theme.spacing(2) }}>
        {(zones || !siteId) && (
          <SubzoneSelector
            zones={(zones || []) as ZoneInfo[]}
            onZoneSelected={onChangeZone}
            onSubzoneSelected={onChangeSubzone}
            horizontalLayout={true}
            selectedZone={selectedZone}
            selectedSubzone={selectedSubzone}
          />
        )}
        <Box sx={{ marginTop: 2 }}>
          <BarChart chartId='speciesBySubzoneChart' chartLabels={labels} chartValues={values} minHeight='126px' />
        </Box>
      </Box>
    </>
  );
}
