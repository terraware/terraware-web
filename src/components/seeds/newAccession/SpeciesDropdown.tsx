import { Grid } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getAllSpecies } from 'src/api/species/species';
import { AccessionPostRequestBody } from 'src/api/types/accessions';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Autocomplete from '../../common/Autocomplete';

interface SpeciesDropdownProps<T extends AccessionPostRequestBody> {
  selectedSpecies?: string;
  organization?: ServerOrganization;
  record: T;
  setRecord: React.Dispatch<React.SetStateAction<T>>;
  disabled?: boolean;
}

export default function SpeciesDropdown<T extends AccessionPostRequestBody>(
  props: SpeciesDropdownProps<T>
): JSX.Element {
  const { selectedSpecies, organization, setRecord, disabled } = props;
  const [speciesList, setSpeciesList] = useState<Species[]>([]);

  const { isMobile } = useDeviceInfo();
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
    setRecord((previousRecord: T): T => {
      return {
        ...previousRecord,
        [id]: value,
      };
    });
  };

  return (
    <>
      <Grid item xs={isMobile ? 12 : 4}>
        <Autocomplete
          id='species'
          selected={selectedSpecies}
          onChange={onChangeHandler}
          label={strings.SPECIES}
          values={speciesList.map((item) => item.scientificName)}
          disabled={disabled}
          freeSolo={false}
          isV1={true}
        />
      </Grid>
    </>
  );
}
