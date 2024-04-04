import { useEffect, useMemo, useState } from 'react';

import { DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { LocationService } from 'src/services';
import { Country } from 'src/types/Country';
import { Region, getRegionLabel } from 'src/types/ParticipantProject';

import { ProjectFieldEditProps } from '.';
import ProjectFieldSelect from './Select';

export type Props = ProjectFieldEditProps & {
  region?: Region;
};

const CountrySelect = ({ id, label, onChange, region, value }: Props) => {
  const { activeLocale } = useLocalization();

  const [countries, setCountries] = useState<Country[]>([]);

  const options = useMemo(
    (): DropdownItem[] =>
      countries
        // BE returns localized regions, hence the check against the label
        .filter((country) => !region || getRegionLabel(region) === country.region)
        .map((country) => ({
          label: country.name,
          value: country.code,
        })),
    [countries, region]
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
      onChange('countryCode', '');
    }
  }, [countries, onChange, value]);

  return (
    <ProjectFieldSelect disabled={!region} id={id} label={label} onChange={onChange} options={options} value={value} />
  );
};

export default CountrySelect;
