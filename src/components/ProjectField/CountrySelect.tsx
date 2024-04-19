import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { LocationService } from 'src/services';
import { Country } from 'src/types/Country';
import { Region, getRegionValue } from 'src/types/ParticipantProject';

import { ProjectFieldEditProps } from '.';
import ProjectFieldSelect from './Select';

export type Props = Omit<ProjectFieldEditProps, 'onChange'> & {
  onChange: (countryCode?: string, region?: string) => void;
  region?: Region;
};

const CountrySelect = ({ id, label, onChange, region, value }: Props) => {
  const { activeLocale } = useLocalization();

  const [countries, setCountries] = useState<Country[]>([]);

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
    if (activeLocale) {
      const populateCountries = async () => {
        const response = await LocationService.getCountriesWithRegion();
        if (response) {
          setCountries(response);
        }
      };
      populateCountries();
    }
  }, [activeLocale]);

  useEffect(() => {
    if (value && !countries.some(({ code }) => code === value)) {
      onChange(undefined, region);
    }
  }, [countries, onChange, region, value]);

  return <ProjectFieldSelect id={id} label={label} onChange={handleChange} value={value} options={options} />;
};

export default CountrySelect;
