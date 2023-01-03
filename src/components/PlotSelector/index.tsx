import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
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
  id: number | string;
  fullName: string;
};

export type ZoneInfo = {
  id: number | string;
  name: string;
  plots?: PlotInfo[];
};

export type PlotSelectorProps = {
  zones: ZoneInfo[];
  onPlotSelected: (plot?: PlotInfo) => void;
  onZoneSelected: (zone?: ZoneInfo) => void;
  zoneError?: string;
  plotError?: string;
  horizontalLayout?: boolean;
  selectedPlot?: PlotInfo;
  selectedZone?: ZoneInfo;
};

export default function PlotSelector(props: PlotSelectorProps): JSX.Element {
  const { zones, onZoneSelected, onPlotSelected, zoneError, plotError, horizontalLayout, selectedPlot, selectedZone } =
    props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();

  const zoneToDropdownItem = (zone?: ZoneInfo) =>
    zone ? { label: zone.name, value: zone.id } : { label: '', value: '' };
  const plotToDropdownItem = (plot?: PlotInfo) =>
    plot ? { label: plot.fullName, value: plot.id } : { label: '', value: '' };

  const onChangeZone = (zone: any) => {
    const foundZone = zones.find((zoneItem) => zoneItem.id.toString() === zone?.value?.toString());
    onZoneSelected(foundZone);
  };

  const onChangePlot = (plot: any) => {
    const foundPlot = selectedZone?.plots?.find((plotItem) => plotItem.id.toString() === plot?.value?.toString());
    onPlotSelected(foundPlot);
  };

  const isEqual = (optionA: any, optionB: any) => {
    if (optionA?.value && optionB?.value) {
      return optionA.value === optionB.value;
    }
    return false;
  };

  const horizontalLabel = (text: string) => (
    <Typography
      fontSize='16px'
      fontWeight={500}
      color={theme.palette.ClrTextFill}
      marginRight={theme.spacing(1)}
      minWidth='40px'
      textAlign='right'
    >
      {text}
    </Typography>
  );

  const horizontalStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };

  const zoneOptions: any[] = useMemo(() => {
    return zones
      .filter((zone) => zone.plots)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((zone) => zoneToDropdownItem(zone));
  }, [zones]);

  const plotOptions: any[] = useMemo(() => {
    if (!selectedZone?.plots) {
      return [];
    }
    return selectedZone.plots
      .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { numeric: true }))
      .map((plot) => plotToDropdownItem(plot));
  }, [selectedZone]);

  return (
    <Box
      display='flex'
      flexWrap='wrap'
      flexDirection={isMobile ? 'column' : 'row'}
      className={horizontalLayout ? `${classes.horizontal}` : ''}
    >
      <Box
        flex={1}
        margin={theme.spacing(2, isMobile || horizontalLayout ? 0 : 2, 0, 0)}
        sx={horizontalLayout ? horizontalStyle : {}}
      >
        {horizontalLayout && horizontalLabel(strings.ZONE)}
        <Autocomplete
          id='zone'
          placeholder={strings.SELECT}
          label={horizontalLayout ? '' : strings.ZONE_REQUIRED}
          selected={zoneToDropdownItem(selectedZone)}
          values={zoneOptions}
          onChange={(value) => onChangeZone(value)}
          errorText={zoneError}
          disabled={!zones.length}
          isEqual={isEqual}
          freeSolo={false}
          hideClearIcon={true}
        />
      </Box>
      <Box flex={1} margin={theme.spacing(2, 0, 0)} sx={horizontalLayout ? horizontalStyle : {}}>
        {horizontalLayout && horizontalLabel(strings.PLOT)}
        <Autocomplete
          id='plot'
          placeholder={strings.SELECT}
          label={horizontalLayout ? '' : strings.PLOT_REQUIRED}
          selected={plotToDropdownItem(selectedPlot)}
          values={plotOptions}
          onChange={(value) => onChangePlot(value)}
          errorText={plotError}
          disabled={!selectedZone?.plots?.length}
          isEqual={isEqual}
          freeSolo={false}
          hideClearIcon={true}
        />
      </Box>
    </Box>
  );
}
