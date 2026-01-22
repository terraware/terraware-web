import React, { type JSX, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import PhotosList from 'src/components/common/PhotosList';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import { isContributor } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import Accession2EditModal from '../edit/Accession2EditModal';

type DetailPanelProps = {
  accession?: Accession;
  reload: () => void;
};
export default function DetailPanel(props: DetailPanelProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { countries } = useLocalization();
  const { accession, reload } = props;
  const userCanEdit = !isContributor(selectedOrganization);
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

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

  const photoUrls = useMemo(
    () => accession?.photoFilenames?.map((file) => `/api/v1/seedbank/accessions/${accession.id}/photos/${file}`) ?? [],
    [accession?.photoFilenames, accession?.id]
  );

  return accession ? (
    <>
      {openEditAccessionModal && (
        <Accession2EditModal
          accession={accession}
          open={openEditAccessionModal}
          onClose={() => setOpenEditAccessionModal(false)}
          reload={reload}
        />
      )}
      <Grid container>
        <Grid item xs={9}>
          <Grid item xs={12} sx={headerStyle}>
            {strings.ACCESSION_DETAILS}
          </Grid>
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.COLLECTION_DATE}
            </Grid>
            <Grid item xs={gridRightSide} sx={valueStyle}>
              {accession.collectedDate}
            </Grid>
          </Grid>
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.COLLECTORS}
            </Grid>
            <Grid item xs={gridRightSide} sx={valueStyle}>
              {accession.collectors && accession.collectors.length > 0 ? accession.collectors.join(', ') : ''}
            </Grid>
          </Grid>
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.COLLECTION_SITE}
            </Grid>
            <Grid item xs={gridRightSide} sx={valueStyle}>
              {accession.collectionSiteName}
              {accession.collectionSiteLandowner ? (
                <Typography color={theme.palette.TwClrTxtSecondary}>
                  ({strings.OWNER}: {accession.collectionSiteLandowner})
                </Typography>
              ) : (
                ''
              )}
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
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.PLANT_LABEL}
            </Grid>
            <Grid item xs={gridRightSide} sx={valueStyle}>
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
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.PHOTOS}
            </Grid>
            <Grid item xs={gridRightSide} sx={valueStyle} display='flex'>
              <PhotosList photoUrls={photoUrls} />
            </Grid>
          </Grid>
        </Grid>

        <Grid />
        <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
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
