import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Autocomplete } from '@terraware/web-components';

import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type SubzoneInfo = {
  id: number | string;
  fullName: string;
};

export type ZoneInfo = {
  id: number | string;
  name: string;
  substrata?: SubzoneInfo[];
};

export type SubzoneSelectorProps = {
  zones: ZoneInfo[];
  onSubzoneSelected: (subzone?: SubzoneInfo) => void;
  onZoneSelected: (zone?: ZoneInfo) => void;
  zoneError?: string;
  subzoneError?: string;
  horizontalLayout?: boolean;
  selectedSubzone?: SubzoneInfo;
  selectedZone?: ZoneInfo;
};

export default function SubzoneSelector(props: SubzoneSelectorProps): JSX.Element {
  const {
    zones,
    onZoneSelected,
    onSubzoneSelected,
    zoneError,
    subzoneError,
    horizontalLayout,
    selectedSubzone,
    selectedZone,
  } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const zoneToDropdownItem = (zone?: ZoneInfo) =>
    zone ? { label: zone.name, value: zone.id } : { label: '', value: '' };
  const subzoneToDropdownItem = (subzone?: SubzoneInfo) =>
    subzone ? { label: subzone.fullName, value: subzone.id } : { label: '', value: '' };

  const onChangeZone = (zone: any) => {
    const foundZone = zones.find((zoneItem) => zoneItem.id.toString() === zone?.value?.toString());
    onZoneSelected(foundZone);
  };

  const onChangeSubzone = (subzone: any) => {
    const foundSubzone = selectedZone?.substrata?.find(
      (subzoneItem) => subzoneItem.id.toString() === subzone?.value?.toString()
    );
    onSubzoneSelected(foundSubzone);
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
      color={theme.palette.TwClrTxt}
      marginRight={theme.spacing(1)}
      minWidth='80px'
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
      .filter((zone) => zone.substrata)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((zone) => zoneToDropdownItem(zone));
  }, [zones]);

  const subzoneOptions: any[] = useMemo(() => {
    if (!selectedZone?.substrata) {
      return [];
    }
    return [...selectedZone.substrata]
      .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { numeric: true }))
      .map((subzone) => subzoneToDropdownItem(subzone));
  }, [selectedZone]);

  return (
    <Box
      display='flex'
      flexWrap='wrap'
      flexDirection={isMobile ? 'column' : 'row'}
      sx={
        horizontalLayout
          ? {
              '& .MuiAutocomplete-root': { width: '100%' },
            }
          : {}
      }
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
          options={zoneOptions}
          onChange={(value) => onChangeZone(value)}
          errorText={zoneError}
          disabled={!zones.length}
          isEqual={isEqual}
          freeSolo={false}
          hideClearIcon={true}
        />
      </Box>
      <Box flex={1} margin={theme.spacing(2, 0, 0)} sx={horizontalLayout ? horizontalStyle : {}}>
        {horizontalLayout && horizontalLabel(strings.SUBZONE)}
        <Autocomplete
          id='subzone'
          placeholder={strings.SELECT}
          label={horizontalLayout ? '' : strings.SUBZONE_REQUIRED}
          selected={subzoneToDropdownItem(selectedSubzone)}
          options={subzoneOptions}
          onChange={(value) => onChangeSubzone(value)}
          errorText={subzoneError}
          disabled={!selectedZone?.substrata?.length}
          isEqual={isEqual}
          freeSolo={false}
          hideClearIcon={true}
        />
      </Box>
    </Box>
  );
}
