import { Grid, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Country, Subdivision } from 'src/types/Country';
import { LocationService } from 'src/services';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Dropdown } from '@terraware/web-components';
import { useLocalization } from '../../providers';

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
  const { activeLocale } = useLocalization();
  const [countries, setCountries] = useState<Country[]>();

  useEffect(() => {
    if (activeLocale) {
      const populateCountries = async () => {
        const response = await LocationService.getCountries();
        if (response) {
          setCountries(response);
        }
      };
      populateCountries();
    }
  }, [activeLocale]);

  const onChangeCountry = (newValue: string) => {
    const found = countries?.find((country) => country.code.toString() === newValue);
    if (countries && found) {
      const code = found.code.toString();
      onChangeCountryCode(code, !!getCountryByCode(countries, code)?.subdivisions);
    }
  };

  const onChangeCountrySubdivision = (newValue: string) => {
    if (countries && selectedCountryCode) {
      const selectedCountry = getCountryByCode(countries, selectedCountryCode);
      const found = selectedCountry?.subdivisions.find(
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
      return country.subdivisions.map((subd) => toDropdownItem(subd));
    }
    return [];
  };

  return (
    <>
      {countries && (
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
          <Dropdown
            id='countryCode'
            placeholder={strings.SELECT}
            selectedValue={getSelectedCountry()?.code?.toString() ?? ''}
            options={countriesOptions()}
            onChange={(value: any) => onChangeCountry(value)}
            hideClearIcon={true}
            label={strings.COUNTRY_REQUIRED}
            errorText={countryError}
            autocomplete={true}
          />
        </Grid>
      )}
      {getSelectedCountry()?.subdivisions ? (
        <Grid
          item
          xs={gridSize()}
          paddingLeft={isMobile ? 0 : theme.spacing(2)}
          paddingBottom={theme.spacing(4)}
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
