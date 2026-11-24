import React, { useCallback, useEffect, useMemo } from 'react';

import { DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { Region, getRegionValue } from 'src/types/AcceleratorProject';

import { ProjectFieldEditProps } from '.';
import ProjectFieldSelect from './Select';

type Props = Omit<ProjectFieldEditProps, 'onChange'> & {
  allowedCountryNames?: string[];
  onChange: (countryCode?: string, region?: string) => void;
  region?: Region;
};

const CountrySelect = ({ allowedCountryNames, id, label, onChange, region, value, md, height }: Props) => {
  const { countries: localizedCountries } = useLocalization();

  const countries = useMemo(() => {
    if (!allowedCountryNames) {
      return localizedCountries;
    }
    const allowedNames = new Set(allowedCountryNames);
    return localizedCountries.filter(({ canonicalName }) => allowedNames.has(canonicalName));
  }, [allowedCountryNames, localizedCountries]);

  const handleChange = useCallback(
    (_: string, country: string) => {
      const _region = getRegionValue(countries.find((obj) => obj.code === country)?.region ?? '');
      onChange(country, _region);
    },
    [countries, onChange]
  );

  const options = useMemo(
    (): DropdownItem[] =>
      countries.map((country) => ({
        label: country.name,
        value: country.code,
      })),
    [countries]
  );

  useEffect(() => {
    if (countries.length) {
      if (value && !countries.some(({ code }) => code === value)) {
        onChange(undefined, region);
      }
    }
  }, [countries, onChange, region, value]);

  return (
    <ProjectFieldSelect
      id={id}
      md={md}
      label={label}
      onChange={handleChange}
      value={value}
      options={options}
      height={height}
    />
  );
};

export default CountrySelect;
