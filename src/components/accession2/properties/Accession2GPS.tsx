import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Close } from '@mui/icons-material';
import { Link, Grid, Box, IconButton, useTheme } from '@mui/material';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import Textfield from 'src/components/common/Textfield/Textfield';
import { Geolocation } from 'src/api/types/accessions';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';
import Coordinates from 'coordinate-parser';
import _ from 'lodash';

type Accession2GPSProps = {
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
  opened?: boolean;
};

export default function Accession2GPS(props: Accession2GPSProps): JSX.Element {
  const { record, onChange, opened } = props;
  const [isOpen, setIsOpen] = useState<boolean>(opened || false);
  const [gpsCoordsList, setGpsCoordsList] = useState<string[]>(
    (record.collectionSiteCoordinates?.length ? record.collectionSiteCoordinates : [undefined]).map((coord) => {
      if (!coord) {
        return '';
      }
      return `${coord.latitude}, ${coord.longitude}`;
    })
  );
  const theme = useTheme();

  useEffect(() => {
    const parsedCoords = gpsCoordsList
      .filter((coords) => !!coords.trim())
      .map((coords) => {
        try {
          const validCoords = new Coordinates(coords);
          return {
            latitude: validCoords.getLatitude(),
            longitude: validCoords.getLongitude(),
          } as Geolocation;
        } catch {
          // skip invalid coords
          return null;
        }
      })
      .filter((coords) => coords !== null) as Geolocation[];

    if (!_.isEqual(parsedCoords, record.collectionSiteCoordinates)) {
      onChange('collectionSiteCoordinates', parsedCoords);
    }
  }, [gpsCoordsList, onChange, record.collectionSiteCoordinates]);

  const onUpdateGPS = (value: any, index: number) => {
    const gps = value as string;
    setGpsCoordsList((prev) => {
      const coords = [...prev];
      coords[index] = gps;
      return coords;
    });
  };

  const onDeleteGpsCoords = (index: number) => {
    setGpsCoordsList((prev) => {
      const coords = [...prev];
      coords.splice(index, 1);
      return coords;
    });
  };

  const onAddGpsCoords = () => {
    setGpsCoordsList((prev) => {
      return [...prev, ''];
    });
  };

  if (!isOpen) {
    return (
      <Grid item xs={12} marginTop={theme.spacing(2)}>
        <Box display='flex' justifyContent='flex-start'>
          <Link
            sx={{ color: theme.palette.TwClrTxtBrand, textDecoration: 'none' }}
            href='#'
            id='addGPS'
            onClick={() => setIsOpen(true)}
          >
            {strings.ADD_GPS_COORDINATES}
          </Link>
        </Box>
      </Grid>
    );
  }

  return (
    <Box display='flex' flexDirection='column' width='100%' marginTop={theme.spacing(2)}>
      {gpsCoordsList.map((gpsCoords, index) => (
        <Box
          key={index}
          mb={2}
          display='flex'
          alignItems='center'
          sx={{ display: 'block', position: 'relative', marginBottom: theme.spacing(1) }}
        >
          <Textfield
            id={`gpsCoords${index}`}
            value={gpsCoords}
            onChange={(unused, value) => onUpdateGPS(value, index)}
            label={index === 0 ? strings.LATITUDE_LONGITUDE : ''}
            type='text'
          />
          {index !== 0 && (
            <IconButton
              id={`delete-gps-coords${index}`}
              aria-label='delete'
              size='small'
              onClick={() => onDeleteGpsCoords(index)}
              sx={{ position: 'absolute', top: theme.spacing(1), right: `-${theme.spacing(4)}` }}
            >
              <Close />
            </IconButton>
          )}
        </Box>
      ))}
      <Box display='flex' justifyContent='flex-end'>
        <Link
          sx={{ color: theme.palette.TwClrTxtBrand, textDecoration: 'none' }}
          href='#'
          id='addGpsCoordsButton'
          onClick={(event: React.SyntheticEvent) => {
            preventDefaultEvent(event);
            onAddGpsCoords();
          }}
        >
          + {strings.ADD}
        </Link>
      </Box>
    </Box>
  );
}
