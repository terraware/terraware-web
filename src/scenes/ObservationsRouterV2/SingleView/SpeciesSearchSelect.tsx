import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Typography } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { Species } from 'src/types/Species';

export type SpeciesSearchSelectProps = {
  excludedSpeciesIds?: number[];
  id: string;
  /** Called with the picked species, or with undefined once the field no longer names one. */
  onChange: (species: Species | undefined) => void;
  placeholder: string;
  unavailableSpeciesIds?: number[];
  unavailableLabel?: string;
};

export default function SpeciesSearchSelect({
  excludedSpeciesIds,
  id,
  onChange,
  placeholder,
  unavailableSpeciesIds,
  unavailableLabel,
}: SpeciesSearchSelectProps): JSX.Element {
  const { species: organizationSpecies } = useOrganizationSpecies();
  const [selectedValue, setSelectedValue] = useState<Species>();

  const options = useMemo(() => {
    const term = (selectedValue?.id === undefined ? (selectedValue?.scientificName ?? '') : '').trim().toLowerCase();
    return organizationSpecies
      .filter((species) => !excludedSpeciesIds?.includes(species.id))
      .filter(
        (species) =>
          term === '' ||
          species.scientificName.toLowerCase().includes(term) ||
          (species.commonName ?? '').toLowerCase().includes(term)
      )
      .toSorted((a, b) => a.scientificName.localeCompare(b.scientificName));
  }, [excludedSpeciesIds, organizationSpecies, selectedValue]);

  const isUnavailable = useCallback(
    (species: Species) => species.id !== undefined && (unavailableSpeciesIds?.includes(species.id) ?? false),
    [unavailableSpeciesIds]
  );

  const onChangeHandler = useCallback(
    (value: Species) => {
      if (value && isUnavailable(value)) {
        return;
      }
      setSelectedValue(value);
      onChange(value?.id === undefined ? undefined : value);
    },
    [isUnavailable, onChange]
  );

  const renderOption = useCallback(
    (option: Species) => {
      const unavailable = isUnavailable(option);
      const caption = unavailable ? unavailableLabel : option.commonName;
      return (
        <div aria-disabled={unavailable || undefined}>
          <Typography component='p' sx={unavailable ? { color: 'TwClrTxtSecondary' } : undefined}>
            {option.scientificName}
          </Typography>
          {caption && (
            <Typography component='p' fontSize='14px' sx={{ color: 'TwClrTxtSecondary' }}>
              {caption}
            </Typography>
          )}
        </div>
      );
    },
    [isUnavailable, unavailableLabel]
  );

  return (
    <SelectT<Species>
      displayLabel={(species) => species?.scientificName ?? ''}
      editable
      fixedMenu
      fullWidth
      id={id}
      isEqual={(a, b) => a?.id !== undefined && a.id === b?.id}
      onChange={onChangeHandler}
      options={options}
      placeholder={placeholder}
      renderOption={renderOption}
      selectedValue={selectedValue}
      selectStyles={{ optionsContainer: { minWidth: '300px' } }}
      toT={(input: string) => ({ scientificName: input }) as Species}
    />
  );
}
