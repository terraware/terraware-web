import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PlantingSiteZone, PlantingSitePlot } from 'src/types/PlantingSite';
import { cardTitleStyle } from './PlantingSiteDetails';
import strings from 'src/strings';
import DashboardChart from './DashboardChart';
import PlotSelector, { PlotInfo, ZoneInfo } from 'src/components/PlotSelector';

export interface Props {
  siteId?: number;
  zones?: PlantingSiteZone[];
  plantsDashboardPreferences?: { [key: string]: unknown };
  setPlantsDashboardPreferences: React.Dispatch<React.SetStateAction<{ [key: string]: unknown } | undefined>>;
  setSelectedPlotId: (id?: number) => void;
  setSelectedZoneId: (id?: number) => void;
}

export default function SpeciesByPlotChart(props: Props): JSX.Element {
  const {
    zones,
    plantsDashboardPreferences,
    setPlantsDashboardPreferences,
    setSelectedPlotId,
    setSelectedZoneId,
    siteId,
  } = props;
  const [selectedPlot, setSelectedPlot] = useState<PlantingSitePlot>();
  const [selectedZone, setSelectedZone] = useState<PlantingSiteZone>();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const theme = useTheme();

  const onChangeZone = (zone: ZoneInfo | undefined) => {
    if (zones && zone) {
      const foundZone = zones.find((plantingZone) => plantingZone.id.toString() === zone.id.toString());
      const defaultPlot = foundZone && foundZone.plots ? foundZone.plots[0] : undefined;
      setSelectedZone(foundZone);
      setSelectedPlot(defaultPlot);
      if (setPlantsDashboardPreferences && foundZone) {
        setPlantsDashboardPreferences({ ...plantsDashboardPreferences, zoneId: foundZone.id, plotId: defaultPlot?.id });
      }
    } else {
      setSelectedZone(undefined);
      setSelectedPlot(undefined);
      setPlantsDashboardPreferences({ ...plantsDashboardPreferences, zoneId: undefined, plotId: undefined });
    }
  };

  const onChangePlot = (plot: PlotInfo | undefined) => {
    if (plot && selectedZone) {
      const plotFound = selectedZone.plots.find((plantingPlot) => plantingPlot.id.toString() === plot.id.toString());
      setSelectedPlot(plotFound);
      if (setPlantsDashboardPreferences) {
        setPlantsDashboardPreferences({ ...plantsDashboardPreferences, plotId: plotFound?.id });
      }
    } else {
      setSelectedPlot(undefined);
    }
  };

  useEffect(() => {
    if (selectedPlot) {
      setLabels(selectedPlot?.populations?.map((population) => population.species_scientificName));
      setValues(selectedPlot?.populations?.map((population) => population.totalPlants));
      setSelectedPlotId(Number(selectedPlot.id));
    } else {
      setLabels([]);
      setValues([]);
      setSelectedPlotId(undefined);
    }
  }, [selectedPlot, setSelectedPlotId]);

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
      setSelectedPlot(undefined);
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

    const lastPlot = plantsDashboardPreferences?.plotId as string;
    const plots = zoneToBeSelected.plots;
    const plot = plots.find((p) => p.id.toString() === lastPlot?.toString());
    setSelectedPlot(plot || plots[0]);
  }, [plantsDashboardPreferences, zones, selectedZone]);

  return (
    <>
      <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_PLOT_AND_SPECIES}</Typography>
      <Box sx={{ marginTop: theme.spacing(2) }}>
        {(zones || !siteId) && (
          <PlotSelector
            zones={(zones || []) as ZoneInfo[]}
            onZoneSelected={onChangeZone}
            onPlotSelected={onChangePlot}
            horizontalLayout={true}
            selectedZone={selectedZone}
            selectedPlot={selectedPlot}
          />
        )}
        <Box sx={{ marginTop: 2 }}>
          <DashboardChart chartId='speciesByPlotChart' chartLabels={labels} chartValues={values} minHeight='126px' />
        </Box>
      </Box>
    </>
  );
}
