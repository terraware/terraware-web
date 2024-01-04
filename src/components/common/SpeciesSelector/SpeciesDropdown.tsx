import { Typography } from '@mui/material';
import strings from 'src/strings';
import { SelectT } from '@terraware/web-components';

export type RenderableSpecies = {
  commonName?: string;
  id?: number;
  scientificName: string;
};

export type SpeciesDropdownProps<T extends RenderableSpecies> = {
  disabled?: boolean;
  errorText?: string;
  onChangeHandler: (value: T) => void;
  required?: boolean;
  selectedValue?: T;
  speciesList: T[];
  tooltipTitle?: string;
};

export default function SpeciesDropdown<T extends RenderableSpecies>({
  disabled,
  errorText,
  onChangeHandler,
  required,
  selectedValue,
  speciesList,
  tooltipTitle,
}: SpeciesDropdownProps<T>): JSX.Element {
  const isEqual = (A: RenderableSpecies, B: RenderableSpecies) => {
    return A?.scientificName === B?.scientificName && A.id !== undefined && B.id !== undefined;
  };

  const toT = (option: string) => {
    return { scientificName: option } as T;
  };

  const renderOption = (option: RenderableSpecies) => {
    return (
      <div>
        <Typography component='p' sx={{ fontStyle: 'italic', display: 'inline-block' }}>
          {option.scientificName}
        </Typography>
        &nbsp;
        {option.commonName && (
          <Typography component='p' sx={{ display: 'inline-block' }}>
            ({option.commonName})
          </Typography>
        )}
      </div>
    );
  };

  return (
    <SelectT<T>
      id='speciesSelector'
      label={strings.SPECIES}
      required={required}
      disabled={disabled}
      placeholder={strings.SEARCH_OR_SELECT}
      options={speciesList}
      onChange={onChangeHandler}
      isEqual={isEqual}
      renderOption={renderOption}
      displayLabel={(species) => species?.scientificName || ''}
      selectedValue={selectedValue}
      toT={toT}
      fullWidth={true}
      editable={true}
      errorText={errorText}
      tooltipTitle={tooltipTitle}
      fixedMenu={true}
    />
  );
}
