import { Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getAllSpecies } from 'src/api/species/species';
import { AccessionPostRequestBody } from 'src/api/types/accessions';
import TextField from 'src/components/common/TextField';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Species } from 'src/types/Species';
import Autocomplete from '../../common/Autocomplete';

interface SpeciesDropdownProps<T extends AccessionPostRequestBody> {
  selectedSpecies?: string;
  organization?: ServerOrganization;
  onChange: (id: string, value: unknown) => void;
  record: T;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
  disabled?: boolean;
}

export default function SpeciesDropdown<T extends AccessionPostRequestBody>(
  props: SpeciesDropdownProps<T>
): JSX.Element {
  const { selectedSpecies, organization, onChange, record, setRecord, disabled } = props;
  const [speciesList, setSpeciesList] = useState<Species[]>([]);

  useEffect(() => {
    const populateSpecies = async () => {
      if (organization) {
        const response = await getAllSpecies(organization.id);
        // TODO: what if we cannot fetch the species list?
        if (response.requestSucceeded) {
          setSpeciesList(response.species);
        }
      }
    };
    populateSpecies();
  }, [organization]);

  const onChangeHandler = (id: string, value: string) => {
    const selectedSpecies = speciesList.filter((species) => species.scientificName === value);
    if (selectedSpecies && selectedSpecies[0]) {
      console.log(selectedSpecies[0].endangered);
      setRecord((previousRecord: T): T => {
        return {
          ...previousRecord,
          [id]: value,
          family: selectedSpecies[0].familyName,
          endangered: selectedSpecies[0].endangered ? 'Yes' : 'No',
          rare: selectedSpecies[0].rare ? 'Yes' : 'No',
        };
      });
    }
  };

  return (
    <>
      <Grid item xs={4}>
        <Autocomplete
          id='species'
          selected={selectedSpecies}
          onChange={onChangeHandler}
          label={strings.SPECIES}
          values={speciesList.map((item) => item.scientificName)}
          disabled={disabled}
          freeSolo={false}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField id='family' value={record.family} onChange={onChange} label={strings.FAMILY} disabled={true} />
      </Grid>
      <Grid item xs={4} />
      <Grid item xs={4}>
        <TextField
          id='endangered'
          value={record.endangered}
          onChange={onChange}
          label={strings.ENDANGERED}
          disabled={true}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField id='rare' value={record.rare} onChange={onChange} label={strings.RARE} disabled={true} />
      </Grid>
    </>
  );
}
