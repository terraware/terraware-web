import React, { type JSX, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import PhotosList from 'src/components/common/PhotosList';
import { API_PATHS } from 'src/constants';
import useAccession from 'src/hooks/useAccession';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import strings from 'src/strings';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import { getDateTimeDisplayValue } from 'src/utils/dateFormatter';
import { getSeedBank } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import Accession2EditModal from '../edit/Accession2EditModal';

export default function DetailPanel(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { countries } = useLocalization();
  const { accessionId: accessionIdParam } = useParams<{ accessionId: string }>();
  const { accession } = useAccession(Number(accessionIdParam));
  const { isAllowed } = useUser();
  const userCanEdit = isAllowed('EDIT_ACCESSION', { organization: selectedOrganization });
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const seedBank =
    selectedOrganization && accession ? getSeedBank(selectedOrganization, accession.facilityId) : undefined;
  const timeZone = useLocationTimeZone().get(seedBank).id;

  const headerStyle = {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: theme.spacing(3.5),
  };

  const categoryStyle = {
    color: theme.palette.TwClrTxtSecondary,
    fontSize: '14px',
    fontWeight: 400,
  };

  const valueStyle = {
    color: theme.palette.TwClrTxt,
    fontSize: '14px',
    fontWeight: 500,
  };

  const gridRowStyle = {
    display: isMobile ? 'block' : 'flex',
    marginBottom: theme.spacing(3),
  };

  const gridLeftSide = isMobile ? 12 : 2;
  const gridRightSide = isMobile ? 12 : 10;
  const [openEditAccessionModal, setOpenEditAccessionModal] = useState(false);

  const getCollectionSource = () => {
    const source = accession?.collectionSource;

    if (source === 'Wild') {
      return strings.WILD_IN_SITU;
    }

    if (source === 'Reintroduced') {
      return strings.REINTRODUCED;
    }

    if (source === 'Cultivated') {
      return strings.CULTIVATED_EX_SITU;
    }

    return strings.OTHER;
  };

  const getCollectionSiteAddress = () => {
    const city = accession?.collectionSiteCity;
    const country = accession?.collectionSiteCountryCode;
    const subdivision = accession?.collectionSiteCountrySubdivision;
    const data = [
      city,
      (countries && country && subdivision && getSubdivisionByCode(countries, country, subdivision)?.name) ??
        subdivision,
      countries && country ? getCountryByCode(countries, country)?.name : '',
    ];

    return data ? <Box>{data.filter((str) => str).join(', ')}</Box> : null;
  };

  const collectionSource = getCollectionSource();
  const numPlants = accession?.plantsCollectedFrom;
  const isNotPlural = numPlants === 1;

  const spaceFiller = () => <Box sx={{ marginLeft: 1, height: '24px', width: 2 }} />;

  const accessionPhotoFilenames = accession?.photoFilenames;
  const accessionId = accession?.id;

  const photoUrls = useMemo(
    () =>
      accessionId && accessionPhotoFilenames
        ? accessionPhotoFilenames.map((file) =>
            API_PATHS.ACCESSION_PHOTO.replace('{accessionId}', String(accessionId)).replace('{photoFilename}', file)
          )
        : [],
    [accessionPhotoFilenames, accessionId]
  );

  return accession ? (
    <>
      {openEditAccessionModal && (
        <Accession2EditModal open={openEditAccessionModal} onClose={() => setOpenEditAccessionModal(false)} />
      )}
      <Grid container>
        <Grid size={9}>
          <Grid sx={headerStyle} size={12}>
            {strings.ACCESSION_DETAILS}
          </Grid>
          <Grid sx={gridRowStyle} size={12}>
            <Grid sx={categoryStyle} size={gridLeftSide}>
              {strings.COLLECTION_TIME}
            </Grid>
            <Grid sx={valueStyle} size={gridRightSide}>
              {accession.collectedTime
                ? getDateTimeDisplayValue(new Date(accession.collectedTime).getTime(), timeZone)
                : '- -'}
            </Grid>
          </Grid>
          <Grid sx={gridRowStyle} size={12}>
            <Grid sx={categoryStyle} size={gridLeftSide}>
              {strings.RECEIVED_DATE}
            </Grid>
            <Grid sx={valueStyle} size={gridRightSide}>
              {accession.receivedDate}
            </Grid>
          </Grid>
          <Grid sx={gridRowStyle} size={12}>
            <Grid sx={categoryStyle} size={gridLeftSide}>
              {strings.COLLECTORS}
            </Grid>
            <Grid sx={valueStyle} size={gridRightSide}>
              {accession.collectors && accession.collectors.length > 0 ? accession.collectors.join(', ') : ''}
            </Grid>
          </Grid>
          <Grid sx={gridRowStyle} size={12}>
            <Grid sx={categoryStyle} size={gridLeftSide}>
              {strings.COLLECTION_SITE}
            </Grid>
            <Grid sx={valueStyle} size={gridRightSide}>
              {accession.collectionSiteName}
              {getCollectionSiteAddress()}

              {accession.collectionSiteNotes && (
                <Box marginTop={2} display='flex'>
                  <Typography>
                    <Icon
                      name='iconFile'
                      style={{
                        marginRight: theme.spacing(1),
                        fill: theme.palette.TwClrIcn,
                      }}
                    />
                    {accession.collectionSiteNotes}
                  </Typography>
                </Box>
              )}

              {accession.collectionSiteCoordinates && accession.collectionSiteCoordinates.length > 0 ? (
                <Box marginTop={2}>
                  {accession.collectionSiteCoordinates?.map((coordinate, index) => (
                    <Box key={`coordinates${index}`}>
                      {coordinate.longitude}, {coordinate.latitude}
                    </Box>
                  ))}
                </Box>
              ) : (
                ''
              )}
            </Grid>
          </Grid>
          <Grid sx={gridRowStyle} size={12}>
            <Grid sx={categoryStyle} size={gridLeftSide}>
              {strings.LANDOWNER}
            </Grid>
            <Grid sx={valueStyle} size={gridRightSide}>
              {accession.collectionSiteLandowner}
            </Grid>
          </Grid>
          <Grid sx={gridRowStyle} size={12}>
            <Grid sx={categoryStyle} size={gridLeftSide}>
              {strings.PLANT_LABEL}
            </Grid>
            <Grid sx={valueStyle} size={gridRightSide}>
              {`${strings.COLLECTED_FROM}${numPlants === undefined ? '' : ' ' + numPlants}${
                collectionSource && collectionSource !== 'Other' ? ' ' + collectionSource : ''
              } ${isNotPlural ? strings.PLANT : strings.PLANTS.toLowerCase()}`}
              {accession.plantId ? (
                <Typography>{`${strings.PLANT_ID_IF_APPLICABLE}: ${accession.plantId}`}</Typography>
              ) : (
                ''
              )}
              {accession.notes ? (
                <Box marginTop={2} display='flex'>
                  <Typography>
                    <Icon
                      name='iconFile'
                      style={{
                        marginRight: theme.spacing(1),
                        fill: theme.palette.TwClrIcn,
                      }}
                    />
                    {accession.notes}
                  </Typography>
                </Box>
              ) : null}
            </Grid>
          </Grid>
          <Grid sx={gridRowStyle} size={12}>
            <Grid sx={categoryStyle} size={gridLeftSide}>
              {strings.PHOTOS}
            </Grid>
            <Grid sx={valueStyle} display='flex' size={gridRightSide}>
              <PhotosList photoUrls={photoUrls} />
            </Grid>
          </Grid>
        </Grid>

        <Grid />
        <Grid sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }} size={3}>
          {userCanEdit ? (
            <Box height='32px'>
              <Button
                onClick={() => setOpenEditAccessionModal(true)}
                icon='iconEdit'
                label={isMobile ? '' : strings.EDIT}
                priority='secondary'
              />
            </Box>
          ) : (
            spaceFiller()
          )}
        </Grid>
      </Grid>
    </>
  ) : (
    <Box />
  );
}
