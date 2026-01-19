import React, { type JSX } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Country, Subdivision } from 'src/types/Country';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type RegionSelectorProps = {
  selectedCountryCode?: string;
  selectedCountrySubdivisionCode?: string;
  onChangeCountryCode: (countryCode: string, hasSubdivisions: boolean) => void;
  onChangeCountrySubdivisionCode?: (countrySubdivisionCode: string) => void;
  countryError?: string;
  countrySubdivisionError?: string;
  horizontalLayout?: boolean;
  hideCountrySubdivisions?: boolean;
  countryLabel?: string;
  countryTooltip?: string;
  paddingBottom?: string;
};

export default function RegionSelector({
  selectedCountryCode,
  selectedCountrySubdivisionCode,
  onChangeCountryCode,
  onChangeCountrySubdivisionCode,
  countryError,
  countrySubdivisionError,
  horizontalLayout,
  hideCountrySubdivisions,
  countryLabel,
  countryTooltip,
  paddingBottom,
}: RegionSelectorProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { countries } = useLocalization();

  const onChangeCountry = (newValue: string) => {
    const found = countries?.find((country) => country.code.toString() === newValue);
    if (countries && found) {
      const code = found.code.toString();
      onChangeCountryCode(code, !!getCountryByCode(countries, code)?.subdivisions);
    }
  };

  const onChangeCountrySubdivision = (newValue: string) => {
    if (countries && selectedCountryCode && onChangeCountrySubdivisionCode) {
      const selectedCountry = getCountryByCode(countries, selectedCountryCode);
      const found = (selectedCountry?.subdivisions || []).find(
        (subdivision: Subdivision) => subdivision.code.toString() === newValue
      );
      if (found) {
        onChangeCountrySubdivisionCode(found.code.toString());
      }
    }
  };

  const getSelectedCountry = () => {
    if (countries && selectedCountryCode) {
      return getCountryByCode(countries, selectedCountryCode);
    }
  };

  const getSelectedCountrySubdivision = () => {
    if (countries && selectedCountryCode && selectedCountrySubdivisionCode) {
      const selectedSubdivision = getSubdivisionByCode(countries, selectedCountryCode, selectedCountrySubdivisionCode);
      if (selectedSubdivision) {
        return selectedSubdivision;
      }
    }
  };

  const gridSize = () => {
    if (isMobile || !horizontalLayout) {
      return 12;
    }
    return 6;
  };

  const toDropdownItem = (entity: Country | Subdivision) => ({ label: entity.name, value: entity.code.toString() });

  const countriesOptions = () => {
    return countries?.map((country) => toDropdownItem(country)) ?? [];
  };

  const subdivisionOptions = () => {
    const country = getSelectedCountry();
    if (country) {
      return (country.subdivisions || []).map((subd) => toDropdownItem(subd));
    }
    return [];
  };

  return (
    <>
      <Grid item xs={gridSize()} paddingBottom={paddingBottom}>
        <Dropdown
          id='countryCode'
          placeholder={strings.SELECT}
          selectedValue={getSelectedCountry()?.code?.toString() ?? ''}
          options={countriesOptions()}
          onChange={(value: any) => onChangeCountry(value)}
          hideClearIcon={true}
          label={countryLabel || strings.COUNTRY_REQUIRED}
          errorText={countryError}
          autocomplete={true}
          tooltipTitle={countryTooltip}
        />
      </Grid>
      {!hideCountrySubdivisions && getSelectedCountry()?.subdivisions ? (
        <Grid
          item
          xs={gridSize()}
          paddingLeft={isMobile ? 0 : theme.spacing(2)}
          paddingBottom={paddingBottom}
          sx={{ '&.MuiGrid-item': { paddingTop: 0 } }}
        >
          <Dropdown
            id='countySubdivisionCode'
            placeholder={strings.SELECT}
            selectedValue={getSelectedCountrySubdivision()?.code?.toString() ?? ''}
            options={subdivisionOptions()}
            onChange={(value: any) => onChangeCountrySubdivision(value)}
            hideClearIcon={true}
            label={strings.STATE_REQUIRED}
            errorText={countrySubdivisionError}
            autocomplete={true}
          />
        </Grid>
      ) : (
        horizontalLayout && !isMobile && <Grid item xs={gridSize()} paddingLeft={isMobile ? 0 : theme.spacing(2)} />
      )}
    </>
  );
}
