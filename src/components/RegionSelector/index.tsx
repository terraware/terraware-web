import { Grid, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Country, Subdivision } from 'src/types/Country';
import { searchCountries } from 'src/api/country/country';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Autocomplete } from '@terraware/web-components';

type RegionSelectorProps = {
  selectedCountryCode?: string;
  selectedCountrySubdivisionCode?: string;
  onChangeCountryCode: (countryCode: string, hasSubdivisions: boolean) => void;
  onChangeCountrySubdivisionCode: (countrySubdivisionCode: string) => void;
  countryError?: string;
  countrySubdivisionError?: string;
  horizontalLayout?: boolean;
};

export default function RegionSelector({
  selectedCountryCode,
  selectedCountrySubdivisionCode,
  onChangeCountryCode,
  onChangeCountrySubdivisionCode,
  countryError,
  countrySubdivisionError,
  horizontalLayout,
}: RegionSelectorProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [countries, setCountries] = useState<Country[]>();

  useEffect(() => {
    const populateCountries = async () => {
      const response = await searchCountries();
      if (response) {
        setCountries(response);
      }
    };
    populateCountries();
  }, []);

  const onChangeCountry = (newValue: string) => {
    const found = countries?.find((country) => country.name === newValue);
    if (countries && found) {
      const code = found.code.toString();
      onChangeCountryCode(code, !!getCountryByCode(countries, code)?.subdivisions);
    }
  };

  const onChangeCountrySubdivision = (newValue: string) => {
    if (countries && selectedCountryCode) {
      const selectedCountry = getCountryByCode(countries, selectedCountryCode);
      const found = selectedCountry?.subdivisions.find((subdivision: Subdivision) => subdivision.name === newValue);
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

  const toDropdownItem = (entity: Country | Subdivision) => ({ label: entity.name, value: entity.code });

  const countriesOptions = () => {
    return countries?.map((country) => toDropdownItem(country)) ?? [];
  };

  const subdivisionOptions = () => {
    const country = getSelectedCountry();
    if (country) {
      return country.subdivisions.map((subd) => toDropdownItem(subd));
    }
    return [];
  };

  return (
    <>
      <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
        <Autocomplete
          id='countryCode'
          placeholder={strings.SELECT}
          selected={getSelectedCountry() ? toDropdownItem(getSelectedCountry()!) : ''}
          values={countriesOptions()}
          onChange={(value: any) => onChangeCountry(value.label)}
          isEqual={(optionA: any, optionB: any) => {
            return optionA?.value === optionB?.value;
          }}
          freeSolo={false}
          hideClearIcon={true}
          label={strings.COUNTRY_REQUIRED}
          errorText={countryError}
        />
      </Grid>
      {getSelectedCountry()?.subdivisions ? (
        <Grid
          item
          xs={gridSize()}
          paddingLeft={isMobile ? 0 : theme.spacing(2)}
          paddingBottom={theme.spacing(4)}
          sx={{ '&.MuiGrid-item': { paddingTop: 0 } }}
        >
          <Autocomplete
            id='countySubdivisionCode'
            placeholder={strings.SELECT}
            selected={getSelectedCountrySubdivision() ? toDropdownItem(getSelectedCountrySubdivision()!) : ''}
            values={subdivisionOptions()}
            onChange={(value: any) => onChangeCountrySubdivision(value.label)}
            isEqual={(optionA: any, optionB: any) => {
              return optionA?.value === optionB?.value;
            }}
            freeSolo={false}
            hideClearIcon={true}
            label={strings.STATE_REQUIRED}
            errorText={countrySubdivisionError}
          />
        </Grid>
      ) : (
        horizontalLayout && !isMobile && <Grid item xs={gridSize()} paddingLeft={isMobile ? 0 : theme.spacing(2)} />
      )}
    </>
  );
}
