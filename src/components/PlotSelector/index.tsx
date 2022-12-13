import React, { useEffect, useState } from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Autocomplete } from '@terraware/web-components';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  horizontal: {
    '& .MuiAutocomplete-root': {
      width: '100%',
    },
  },
}));

export type PlotInfo = {
  id: number;
  fullName: string;
};

export type ZoneInfo = {
  id: number;
  name: string;
  plots?: PlotInfo[];
};

export type PlotSelectorProps = {
  zones: ZoneInfo[];
  onPlotSelected: (plot?: PlotInfo) => void;
  onZoneSelected?: (zone?: ZoneInfo) => void;
  initialSelectedPlotId?: number;
  zoneError?: string;
  plotError?: string;
  horizontalLayout?: boolean;
};

export default function PlotSelector(props: PlotSelectorProps): JSX.Element {
  const { zones, onZoneSelected, onPlotSelected, initialSelectedPlotId, zoneError, plotError, horizontalLayout } =
    props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();

  const [selectedZone, setSelectedZone] = useState<ZoneInfo>();
  const [selectedPlot, setSelectedPlot] = useState<PlotInfo>();

  const zoneToDropdownItem = (zone?: ZoneInfo) => (zone ? { label: zone.name, value: zone.id } : undefined);
  const plotToDropdownItem = (plot?: PlotInfo) => (plot ? { label: plot.fullName, value: plot.id } : undefined);

  const onChangeZone = (zone: any) => {
    const foundZone = zones.find((zoneItem) => zoneItem.id.toString() === zone?.value?.toString());
    setSelectedPlot(undefined);
    setSelectedZone(foundZone);
    onPlotSelected(undefined);
    if (onZoneSelected) {
      onZoneSelected(foundZone);
    }
  };

  const onChangePlot = (plot: any) => {
    const foundPlot = selectedZone?.plots?.find((plotItem) => plotItem.id.toString() === plot?.value?.toString());
    setSelectedPlot(foundPlot || undefined);
    onPlotSelected(foundPlot);
  };

  useEffect(() => {
    let foundPlot;
    const zoneWithPlot = zones.find((zone) => {
      foundPlot = zone?.plots?.find((plot) => plot.id.toString() === initialSelectedPlotId?.toString());
      return !!foundPlot;
    });
    setSelectedZone(zoneWithPlot);
    setSelectedPlot(foundPlot);
  }, [initialSelectedPlotId, zones]);

  const gridSize = () => (isMobile ? 12 : 6);

  const isEqual = (optionA: any, optionB: any) => optionA.value.toString() === optionB.value.toString();

  const horizontalLabel = (text: string) => (
    <Typography fontSize='16px' fontWeight={500} color={theme.palette.ClrTextFill} marginRight={theme.spacing(1)}>
      {text}
    </Typography>
  );

  const horizontalStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  return (
    <Grid
      display='flex'
      margin={theme.spacing(1, 0, 2)}
      flexDirection={isMobile ? 'column' : 'row'}
      className={horizontalLayout ? `${classes.horizontal}` : ''}
    >
      <Grid
        xs={gridSize()}
        margin={theme.spacing(2, isMobile ? 0 : 2, 0, 0)}
        sx={horizontalLayout ? horizontalStyle : {}}
      >
        {horizontalLayout && horizontalLabel(strings.ZONE)}
        <Autocomplete
          id='zone'
          placeholder={strings.SELECT}
          label={horizontalLayout ? '' : strings.ZONE}
          selected={zoneToDropdownItem(selectedZone)}
          values={zones.filter((zone) => zone.plots).map((zone) => zoneToDropdownItem(zone)) as any[]}
          onChange={(id, value) => onChangeZone(value)}
          errorText={zoneError}
          disabled={!zones.length}
          isEqual={isEqual}
          freeSolo={false}
          hideClearIcon={true}
        />
      </Grid>
      <Grid xs={gridSize()} margin={theme.spacing(2, 0, 0)} sx={horizontalLayout ? horizontalStyle : {}}>
        {horizontalLayout && horizontalLabel(strings.PLOT)}
        <Autocomplete
          key={selectedZone?.id}
          id='plot'
          placeholder={strings.SELECT}
          label={horizontalLayout ? '' : strings.PLOT}
          selected={plotToDropdownItem(selectedPlot)}
          values={selectedZone?.plots?.map((plot) => plotToDropdownItem(plot)) || ([] as any[])}
          onChange={(id, value) => onChangePlot(value)}
          errorText={plotError}
          disabled={!selectedZone?.plots?.length}
          isEqual={isEqual}
          freeSolo={false}
          hideClearIcon={true}
        />
      </Grid>
    </Grid>
  );
}
