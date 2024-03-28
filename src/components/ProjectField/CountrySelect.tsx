import { useEffect, useMemo, useState } from 'react';

import { DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { LocationService } from 'src/services';
import { Country } from 'src/types/Country';

import { ProjectFieldEditProps } from '.';
import ProjectFieldSelect from './Select';

const CountrySelect = ({ id, label, onChange, value }: ProjectFieldEditProps) => {
  const { activeLocale } = useLocalization();

  const [countries, setCountries] = useState<Country[]>([]);

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
        const response = await LocationService.getCountries();
        if (response) {
          setCountries(response);
        }
      };
      populateCountries();
    }
  }, [activeLocale]);

  return <ProjectFieldSelect id={id} label={label} onChange={onChange} value={value} options={options} />;
};

export default CountrySelect;
