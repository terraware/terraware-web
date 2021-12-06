import React, { useEffect, useState } from 'react';
import { getAllSpecies } from 'src/api/species/species';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import Autocomplete from '../../common/Autocomplete';

interface SpeciesDropdownProps {
  selectedSpecies?: string;
  onChange: (id: string, value: unknown, isNew: boolean) => void;
}

export default function SpeciesDropdown(props: SpeciesDropdownProps): JSX.Element {
  const { selectedSpecies, onChange } = props;
  const [speciesList, setSpeciesList] = useState<Species[]>([]);

  useEffect(() => {
    const populateSpecies = async () => {
      const response = await getAllSpecies();
      // TODO: what if we cannot fetch the species list?
      if (response.requestSucceeded) {
        setSpeciesList(Array.from(response.speciesById.values()));
      }
    };
    populateSpecies();
  }, []);

  const onChangeHandler = (id: string, selectedName: string) => {
    const found = speciesList.findIndex((item) => item.name === selectedName);
    if (found === -1) {
      onChange(id, selectedName, true);
    } else {
      onChange(id, selectedName, false);
    }
  };

  return (
    <Autocomplete
      id='species'
      selected={selectedSpecies}
      onChange={onChangeHandler}
      label={strings.SPECIES}
      values={speciesList.map((item) => item.name)}
    />
  );
}
