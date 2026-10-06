import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Typography } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { Species } from 'src/types/Species';

export type SpeciesSearchSelectProps = {
  /** Species already recorded in the table. They are keyed by species, so a second row can't exist. */
  excludedSpeciesIds?: number[];
  id: string;
  /** Called with the picked species, or with undefined once the field no longer names one. */
  onChange: (species: Species | undefined) => void;
  placeholder: string;
};

export default function SpeciesSearchSelect({
  excludedSpeciesIds,
  id,
  onChange,
  placeholder,
}: SpeciesSearchSelectProps): JSX.Element {
  const { species: organizationSpecies } = useOrganizationSpecies();
  const [selectedValue, setSelectedValue] = useState<Species>();

  const options = useMemo(() => {
    const term = (selectedValue?.id === undefined ? selectedValue?.scientificName ?? '' : '').trim().toLowerCase();
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

  const onChangeHandler = useCallback(
    (value: Species) => {
      setSelectedValue(value);
      onChange(value?.id === undefined ? undefined : value);
    },
    [onChange]
  );

  const renderOption = useCallback(
    (option: Species) => (
      <div>
        <Typography component='p'>{option.scientificName}</Typography>
        {option.commonName && (
          <Typography component='p' fontSize='14px' sx={{ color: 'TwClrTxtSecondary' }}>
            {option.commonName}
          </Typography>
        )}
      </div>
    ),
    []
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
      toT={(input: string) => ({ scientificName: input }) as Species}
    />
  );
}
