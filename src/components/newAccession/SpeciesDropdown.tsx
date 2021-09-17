import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import speciesSelector from '../../state/selectors/species';
import strings from '../../strings';
import Autocomplete from '../common/Autocomplete';

interface Props {
  specie?: string;
  onChange: (id: string, value: unknown, isNew: boolean) => void;
}

export default function SpeciesDropdown({
  specie,
  onChange,
}: Props): JSX.Element {
  const species = useRecoilValue(speciesSelector);
  const resetSpecies = useResetRecoilState(speciesSelector);

  const onChangeHandler = (id: string, value: unknown) => {
    const found = species.findIndex((specie) => specie.name === value);
    if (found === -1) {
      onChange(id, value, true);
    } else {
      onChange(id, value, false);
    }
  };

  React.useEffect(() => {
    return () => {
      resetSpecies();
    };
  }, []);

  return (
    <Autocomplete
      id='species'
      selected={specie}
      onChange={onChangeHandler}
      label={strings.SPECIES}
      values={species.map((specie) => specie.name)}
    />
  );
}
