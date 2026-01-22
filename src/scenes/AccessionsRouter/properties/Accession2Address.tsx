import React, { type JSX, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';

import AddLink from 'src/components/common/AddLink';
import Autocomplete from 'src/components/common/Autocomplete';
import Textfield from 'src/components/common/Textfield/Textfield';
import { useLocalization } from 'src/providers';
import { AccessionPostRequestBody } from 'src/services/SeedBankService';
import strings from 'src/strings';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type Accession2AddressProps = {
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
  opened?: boolean;
};

export default function Accession2Address(props: Accession2AddressProps): JSX.Element {
  const { record, onChange, opened } = props;
  const [isOpen, setIsOpen] = useState<boolean>(opened || false);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { countries } = useLocalization();
  const [temporalCountryValue, setTemporalCountryValue] = useState('');
  const [temporalSubValue, setTemporalSubValue] = useState('');

  const gridSize = () => (isMobile ? 12 : 6);

  const onChangeCountry = (newValue: string) => {
    setTemporalCountryValue(newValue);
    const found = countries?.find((country) => country.name === newValue);
    if (getSelectedSubdivision()) {
      onChangeSubdivision('');
    }
    if (found) {
      onChange('collectionSiteCountryCode', found.code.toString());
    } else {
      onChange('collectionSiteCountryCode', undefined);
    }
  };

  const onChangeSubdivision = (newValue: string) => {
    setTemporalSubValue(newValue);
    const selectedCountry = getSelectedCountry();
    const found = selectedCountry?.subdivisions?.find((subdivision) => subdivision.name === newValue);
    if (found) {
      onChange('collectionSiteCountrySubdivision', found.code.toString());
    } else {
      onChange('collectionSiteCountrySubdivision', undefined);
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

  if (!isOpen) {
    return (
      <Grid item xs={12} marginTop={theme.spacing(2)}>
        <Box display='flex' justifyContent='flex-start'>
          <AddLink id='addAddress' onClick={() => setIsOpen(true)} large={true} text={strings.ADD_ADDRESS} />
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
          onChange={(value) => onChange('collectionSiteCity', value)}
          type='text'
          label={strings.CITY}
        />
      </Grid>
      {countries !== undefined && (
        <Grid item xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} marginTop={theme.spacing(2)}>
          <Grid item xs={gridSize()} sx={{ marginRight: isMobile ? 0 : theme.spacing(2) }}>
            <Autocomplete
              id='collectionSiteCountryCode'
              selected={getSelectedCountry()?.name || temporalCountryValue}
              onChange={(value: any) => onChangeCountry(value)}
              label={strings.COUNTRY}
              placeholder={strings.COUNTRY}
              options={countries?.map((country) => country.name) || []}
              freeSolo={true}
            />
          </Grid>
          <Grid item xs={gridSize()} sx={{ marginTop: isMobile ? theme.spacing(2) : 0 }}>
            {getSelectedCountry()?.subdivisions ? (
              <Autocomplete
                id='collectionSiteCountrySubdivision'
                selected={getSelectedSubdivision()?.name || temporalSubValue}
                onChange={(value: any) => onChangeSubdivision(value)}
                label={strings.STATE_PROVINCE_REGION}
                placeholder={strings.SELECT}
                options={getSelectedCountry()?.subdivisions?.map((subdivision) => subdivision.name) || []}
                freeSolo={true}
              />
            ) : (
              <Textfield
                id='collectionSiteCountrySubdivision'
                value={record.collectionSiteCountrySubdivision}
                onChange={(value) => onChange('collectionSiteCountrySubdivision', value)}
                type='text'
                label={strings.STATE_PROVINCE_REGION}
              />
            )}
          </Grid>
        </Grid>
      )}
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <Textfield
          id='collectionSiteNotes'
          value={record.collectionSiteNotes}
          onChange={(value) => onChange('collectionSiteNotes', value)}
          type='textarea'
          label={strings.DESCRIPTION_NOTES}
        />
      </Grid>
    </Grid>
  );
}
