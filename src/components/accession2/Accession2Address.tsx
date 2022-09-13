import React, { useState, useEffect } from 'react';
import strings from 'src/strings';
import { Link, Grid, Box, useTheme } from '@mui/material';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Textfield from 'src/components/common/Textfield/Textfield';
import Autocomplete from 'src/components/common/Autocomplete';
import { searchCountries } from 'src/api/country/country';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import { Country } from 'src/types/Country';

type Accession2AddressProps = {
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
  opened?: boolean;
};

export default function Accession2Address(props: Accession2AddressProps): JSX.Element {
  const { record, onChange, opened } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [countries, setCountries] = useState<Country[]>();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  useEffect(() => {
    const populateCountries = async () => {
      const response = await searchCountries();
      if (response) {
        setCountries(response);
      }
    };
    populateCountries();
  }, []);

  const gridSize = () => (isMobile ? 12 : 6);

  const onChangeCountry = (newValue: string) => {
    const found = countries?.find((country) => country.name === newValue);
    if (found) {
      onChange('collectionSiteCountryCode', found.code.toString());
    }
  };

  const onChangeSubdivision = (newValue: string) => {
    const selectedCountry = getSelectedCountry();
    const found = selectedCountry?.subdivisions?.find((subdivision) => subdivision.name === newValue);
    if (found) {
      onChange('collectionSiteCountrySubdivision', found.code.toString());
    }
  };

  const getSelectedCountry = () => {
    if (countries && record.collectionSiteCountryCode) {
      const selectedCountry = getCountryByCode(countries, record.collectionSiteCountryCode);
      if (selectedCountry) {
        return selectedCountry;
      }
    }
  };

  const getSelectedSubdivision = () => {
    if (countries && record.collectionSiteCountryCode && record.collectionSiteCountrySubdivision) {
      const selectedSubdivision = getSubdivisionByCode(
        countries,
        record.collectionSiteCountryCode,
        record.collectionSiteCountrySubdivision
      );
      if (selectedSubdivision) {
        return selectedSubdivision;
      }
    }
  };

  if (!isOpen && !opened) {
    return (
      <Grid item xs={12} marginTop={theme.spacing(2)}>
        <Box display='flex' justifyContent='flex-start'>
          <Link sx={{ textDecoration: 'none' }} href='#' id='addAddress' onClick={() => setIsOpen(true)}>
            {strings.ADD_ADDRESS}
          </Link>
        </Box>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} display='flex' flexDirection={'column'} marginTop={theme.spacing(2)}>
      <Grid item xs={12}>
        <Textfield
          id='collectionSiteCity'
          value={record.collectionSiteCity}
          onChange={onChange}
          type='text'
          label={strings.CITY}
        />
      </Grid>
      <Grid item xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} marginTop={theme.spacing(2)}>
        <Grid item xs={gridSize()} sx={{ marginRight: isMobile ? 0 : theme.spacing(2) }}>
          <Autocomplete
            id='collectionSiteCountrySubdivision'
            selected={getSelectedSubdivision()?.name}
            onChange={(index, value) => onChangeSubdivision(value)}
            label={strings.STATE_PROVINCE_REGION}
            values={getSelectedCountry()?.subdivisions?.map((subdivision) => subdivision.name) || []}
            freeSolo={true}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={{ marginTop: isMobile ? theme.spacing(2) : 0 }}>
          <Autocomplete
            id='collectionSiteCountryCode'
            selected={getSelectedCountry()?.name}
            onChange={(index, value) => onChangeCountry(value)}
            label={strings.COUNTRY}
            values={countries?.map((country) => country.name) || []}
            freeSolo={true}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <Textfield
          id='collectionSiteNotes'
          value={record.collectionSiteNotes}
          onChange={onChange}
          type='textarea'
          label={strings.DESCRIPTION_NOTES}
        />
      </Grid>
    </Grid>
  );
}
