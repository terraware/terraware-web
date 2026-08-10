import React, { type JSX } from 'react';

import { Grid } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useBotanicalCountries } from 'src/hooks/useBotanicalCountries';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

export type CountryAndBotanicalCountrySelectProps = {
  countryCode?: string;
  botanicalCountryCode?: string;
  onChange: (value: { countryCode?: string; botanicalCountryCode?: string }) => void;
  required?: boolean;
};

export default function CountryAndBotanicalCountrySelect({
  countryCode,
  botanicalCountryCode,
  onChange,
  required,
}: CountryAndBotanicalCountrySelectProps): JSX.Element {
  const { countries } = useLocalization();
  const { botanicalCountries } = useBotanicalCountries();

  const countryOptions: DropdownItem[] = (countries ?? []).map((country) => ({
    label: country.name,
    value: country.code,
  }));
  const botanicalCountryOptions: DropdownItem[] = countryCode
    ? botanicalCountries
        .filter((botanicalCountry) => botanicalCountry.countryCode === countryCode)
        .map((botanicalCountry) => ({ label: botanicalCountry.name, value: botanicalCountry.code }))
    : [];

  return (
    <>
      <Grid item xs={12}>
        <Dropdown
          id='country'
          label={strings.COUNTRY}
          placeholder={strings.SELECT}
          options={countryOptions}
          selectedValue={countryCode}
          onChange={(value: string) => onChange({ countryCode: value || undefined, botanicalCountryCode: undefined })}
          fullWidth
          autocomplete
          required={required}
        />
      </Grid>
      <Grid item xs={12}>
        <Dropdown
          id='botanicalCountry'
          label={strings.BOTANICAL_COUNTRY}
          placeholder={strings.SELECT}
          options={botanicalCountryOptions}
          selectedValue={botanicalCountryCode}
          onChange={(value: string) => onChange({ countryCode, botanicalCountryCode: value || undefined })}
          fullWidth
          autocomplete
          required={required}
          disabled={!countryCode}
        />
      </Grid>
    </>
  );
}
