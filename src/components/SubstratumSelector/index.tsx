import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Autocomplete } from '@terraware/web-components';

import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type SubstratumInfo = {
  id: number | string;
  fullName: string;
};

export type StratumInfo = {
  id: number | string;
  name: string;
  substrata?: SubstratumInfo[];
};

export type SubstratumSelectorProps = {
  strata: StratumInfo[];
  onStratumSelected: (stratum?: StratumInfo) => void;
  onSubstratumSelected: (substratum?: SubstratumInfo) => void;
  stratumError?: string;
  substratumError?: string;
  horizontalLayout?: boolean;
  selectedStratum?: StratumInfo;
  selectedSubstratum?: SubstratumInfo;
};

export default function SubstratumSelector(props: SubstratumSelectorProps): JSX.Element {
  const {
    strata,
    onStratumSelected,
    onSubstratumSelected,
    stratumError,
    substratumError,
    horizontalLayout,
    selectedSubstratum,
    selectedStratum,
  } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const stratumToDropdownItem = (stratum?: StratumInfo) =>
    stratum ? { label: stratum.name, value: stratum.id } : { label: '', value: '' };
  const substratumToDropdownItem = (substratum?: SubstratumInfo) =>
    substratum ? { label: substratum.fullName, value: substratum.id } : { label: '', value: '' };

  const onChangeStratum = (stratum: any) => {
    const foundStratum = strata.find((stratumItem) => stratumItem.id.toString() === stratum?.value?.toString());
    onStratumSelected(foundStratum);
  };

  const onChangeSubstratum = (substratum: any) => {
    const foundSubstratum = selectedStratum?.substrata?.find(
      (substratumItem) => substratumItem.id.toString() === substratum?.value?.toString()
    );
    onSubstratumSelected(foundSubstratum);
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

  const stratumOptions: any[] = useMemo(() => {
    return strata
      .filter((stratum) => stratum.substrata)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((stratum) => stratumToDropdownItem(stratum));
  }, [strata]);

  const substratumOptions: any[] = useMemo(() => {
    if (!selectedStratum?.substrata) {
      return [];
    }
    return [...selectedStratum.substrata]
      .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { numeric: true }))
      .map((substratum) => substratumToDropdownItem(substratum));
  }, [selectedStratum]);

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
        {horizontalLayout && horizontalLabel(strings.STRATUM)}
        <Autocomplete
          id='stratum'
          placeholder={strings.SELECT}
          label={horizontalLayout ? '' : strings.STRATUM_REQUIRED}
          selected={stratumToDropdownItem(selectedStratum)}
          options={stratumOptions}
          onChange={(value) => onChangeStratum(value)}
          errorText={stratumError}
          disabled={!strata.length}
          isEqual={isEqual}
          freeSolo={false}
          hideClearIcon={true}
        />
      </Box>
      <Box flex={1} margin={theme.spacing(2, 0, 0)} sx={horizontalLayout ? horizontalStyle : {}}>
        {horizontalLayout && horizontalLabel(strings.SUBSTRATUM)}
        <Autocomplete
          id='substratum'
          placeholder={strings.SELECT}
          label={horizontalLayout ? '' : strings.SUBSTRATUM_REQUIRED}
          selected={substratumToDropdownItem(selectedSubstratum)}
          options={substratumOptions}
          onChange={(value) => onChangeSubstratum(value)}
          errorText={substratumError}
          disabled={!selectedStratum?.substrata?.length}
          isEqual={isEqual}
          freeSolo={false}
          hideClearIcon={true}
        />
      </Box>
    </Box>
  );
}
