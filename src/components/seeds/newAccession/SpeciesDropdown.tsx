import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import speciesSelector from 'src/state/selectors/species';
import strings from 'src/strings';
import Autocomplete from '../../common/Autocomplete';

interface Props {
  species?: string;
  onChange: (id: string, value: unknown, isNew: boolean) => void;
}

export default function SpeciesDropdown({ species, onChange }: Props): JSX.Element {
  const speciesList = useRecoilValue(speciesSelector);
  const resetSpecies = useResetRecoilState(speciesSelector);

  const onChangeHandler = (id: string, selectedSpecies: string) => {
    const found = speciesList.findIndex((item) => item.name === selectedSpecies);
    if (found === -1) {
      onChange(id, selectedSpecies, true);
    } else {
      onChange(id, selectedSpecies, false);
    }
  };

  React.useEffect(() => {
    return () => {
      resetSpecies();
    };
  }, [resetSpecies]);

  return (
    <Autocomplete
      id='species'
      selected={species}
      onChange={onChangeHandler}
      label={strings.SPECIES}
      values={speciesList.map((item) => item.name)}
    />
  );
}
