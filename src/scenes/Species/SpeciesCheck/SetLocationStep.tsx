import React, { type JSX } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import { BotanicalCountry } from 'src/queries/search/botanicalCountries';
import strings from 'src/strings';
import { Country } from 'src/types/Country';

import { LocationEdit, LocationTarget } from './types';

export type SetLocationStepProps = {
  targets: LocationTarget[];
  edits: Record<number, LocationEdit>;
  countries: Country[];
  botanicalCountries: BotanicalCountry[];
  onChange: (targetKey: number, edit: LocationEdit) => void;
};

const SetLocationStep = ({
  targets,
  edits,
  countries,
  botanicalCountries,
  onChange,
}: SetLocationStepProps): JSX.Element => {
  const theme = useTheme();

  const countryOptions: DropdownItem[] = countries.map((country) => ({ label: country.name, value: country.code }));
  const hasCountryMapping = botanicalCountries.some((bc) => bc.countryCode !== undefined);

  return (
    <Box display='flex' flexDirection='column' gap={theme.spacing(3)} textAlign='left'>
      {targets.map((target, index) => {
        const edit = edits[target.key] ?? {};
        const botanicalCountryOptions: DropdownItem[] = edit.countryCode
          ? botanicalCountries
              .filter((bc) => !hasCountryMapping || bc.countryCode === edit.countryCode)
              .map((bc) => ({ label: bc.name, value: bc.code }))
          : [];
        return (
          <Box key={target.key} display='flex' flexDirection='column' gap={theme.spacing(2)}>
            {index > 0 && <Divider sx={{ marginBottom: theme.spacing(1) }} />}
            <Typography fontSize='16px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {target.name}
            </Typography>
            <Dropdown
              id={`country-${target.key}`}
              label={strings.COUNTRY}
              placeholder={strings.SELECT}
              options={countryOptions}
              selectedValue={edit.countryCode}
              onChange={(value: string) =>
                onChange(target.key, { countryCode: value, botanicalCountryCode: undefined })
              }
              fullWidth
              required
              autocomplete
            />
            <Dropdown
              id={`botanical-country-${target.key}`}
              label={strings.BOTANICAL_COUNTRY}
              placeholder={strings.SELECT}
              options={botanicalCountryOptions}
              selectedValue={edit.botanicalCountryCode}
              onChange={(value: string) => onChange(target.key, { ...edit, botanicalCountryCode: value })}
              fullWidth
              required
              autocomplete
              disabled={!edit.countryCode}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default SetLocationStep;
