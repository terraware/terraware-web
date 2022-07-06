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
  const { selectedSpecies, organization, onChange, setRecord, disabled } = props;
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [family, setFamily] = useState<string>();
  const [endangered, setEndangered] = useState<string>();
  const [rare, setRare] = useState<string>();

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

  useEffect(() => {
    const filteredSpecies = speciesList.filter((species) => species.scientificName === selectedSpecies);
    if (filteredSpecies && filteredSpecies[0]) {
      setFamily(filteredSpecies[0].familyName);
      if (filteredSpecies[0].endangered !== undefined) {
        setEndangered(filteredSpecies[0].endangered ? 'Yes' : 'No');
      } else {
        setEndangered(strings.UNESPECIFIED);
      }
      if (filteredSpecies[0].rare !== undefined) {
        setRare(filteredSpecies[0].rare ? 'Yes' : 'No');
      } else {
        setRare(strings.UNESPECIFIED);
      }
    } else {
      setFamily(undefined);
      setEndangered(undefined);
      setRare(undefined);
    }
  }, [selectedSpecies, speciesList]);

  const onChangeHandler = (id: string, value: string) => {
    setRecord((previousRecord: T): T => {
      return {
        ...previousRecord,
        [id]: value,
      };
    });
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
        <TextField id='family' value={family} onChange={onChange} label={strings.FAMILY} disabled={true} />
      </Grid>
      <Grid item xs={4} />
      <Grid item xs={4}>
        <TextField id='endangered' value={endangered} onChange={onChange} label={strings.ENDANGERED} disabled={true} />
      </Grid>
      <Grid item xs={4}>
        <TextField id='rare' value={rare} onChange={onChange} label={strings.RARE} disabled={true} />
      </Grid>
    </>
  );
}
