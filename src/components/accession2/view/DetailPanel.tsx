import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';
import { useState } from 'react';
import { Accession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Accession2EditModal from '../edit/Accession2EditModal';
import ViewPhotosModal from './ViewPhotosModal';

type DetailPanelProps = {
  accession?: Accession2;
  organization: ServerOrganization;
  reload: () => void;
};
export default function DetailPanel(props: DetailPanelProps): JSX.Element {
  const { accession, organization, reload } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const categoryStyle = {
    color: '#708284',
  };

  const gridRowStyle = {
    display: isMobile ? 'block' : 'flex',
    padding: theme.spacing(2, 0),
  };

  const useStyles = makeStyles(() => ({
    folderIcon: {
      fill: '#3A4445',
      marginRight: theme.spacing(1),
    },
  }));

  const mainStructureSize = isMobile ? 12 : 9;
  const gridLeftSide = isMobile ? 12 : 4;
  const gridRightSide = isMobile ? 12 : 8;
  const [photosModalOpened, setPhotosModalOpened] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [openEditAccessionModal, setOpenEditAccessionModal] = useState(false);
  const classes = useStyles();

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

  const collectionSource = getCollectionSource();
  const numPlants = accession?.plantsCollectedFrom;
  const isNotPlural = numPlants === 1;

  return accession ? (
    <>
      <Accession2EditModal
        accession={accession}
        open={openEditAccessionModal}
        onClose={() => setOpenEditAccessionModal(false)}
        organization={organization}
        reload={reload}
      />
      <ViewPhotosModal
        accessionId={accession.id.toString()}
        photosNames={accession.photoFilenames || []}
        open={photosModalOpened}
        onClose={() => setPhotosModalOpened(false)}
        selectedSlide={selectedSlide}
      />
      <Grid container>
        {isMobile ? (
          <Grid item xs={12}>
            <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditAccessionModal(true)}>
              <Icon name='iconEdit' />
            </IconButton>
          </Grid>
        ) : null}
        <Grid item xs={mainStructureSize}>
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.COLLECTION_DATE}
            </Grid>
            <Grid item xs={gridRightSide}>
              {accession.collectedDate}
            </Grid>
          </Grid>
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.COLLECTOR}
            </Grid>
            <Grid item xs={gridRightSide}>
              {accession.collectors && accession.collectors.length > 0 ? accession.collectors[0] : ''}
            </Grid>
          </Grid>
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.COLLECTING_LOCATION}
            </Grid>
            <Grid item xs={gridRightSide}>
              {accession.collectionSiteName}
              {accession.collectionSiteLandowner ? (
                <Typography color='#708284'>
                  ({strings.OWNER}: {accession.collectionSiteLandowner})
                </Typography>
              ) : (
                ''
              )}
              {accession.collectionSiteCity && accession.collectionSiteCountryCode
                ? `${accession.collectionSiteCity}, ${
                    accession.collectionSiteCountrySubdivision ? `${accession.collectionSiteCountrySubdivision}, ` : ''
                  }
              ${accession.collectionSiteCountryCode}`
                : ''}

              {accession.collectionSiteNotes && (
                <Box marginTop={2} display='flex'>
                  <Icon name='folder' className={classes.folderIcon} />
                  <Typography>{accession.collectionSiteNotes}</Typography>
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
              {strings.PLANT_AND_SITE}
            </Grid>
            <Grid item xs={gridRightSide}>
              {`${strings.COLLECTED_FROM}${numPlants === undefined ? '' : ' ' + numPlants}${
                collectionSource ? ' ' + collectionSource : ''
              } ${isNotPlural ? strings.PLANT : strings.PLANTS}`}
              {accession.plantId ? <Typography>{`${strings.PLANT_ID}: ${accession.plantId}`}</Typography> : ''}
              <Box marginTop={2} display='flex'>
                <Icon name='folder' className={classes.folderIcon} />
                <Typography>{accession.notes}</Typography>
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={gridRowStyle}>
            <Grid item xs={gridLeftSide} sx={categoryStyle}>
              {strings.PHOTOS}
            </Grid>
            <Grid item xs={gridRightSide} display='flex'>
              {accession.photoFilenames?.map((file, index) => {
                return (
                  <Box paddingRight={theme.spacing(2)} key={`photo-${index}`}>
                    <img
                      src={`/api/v1/seedbank/accessions/${accession.id}/photos/${file}?maxHeight=100`}
                      alt=''
                      onClick={() => {
                        setSelectedSlide(index);
                        setPhotosModalOpened(true);
                      }}
                    />
                  </Box>
                );
              })}
            </Grid>
          </Grid>
        </Grid>

        <Grid />
        {!isMobile ? (
          <Grid item xs={3}>
            <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditAccessionModal(true)}>
              <Icon name='iconEdit' />
            </IconButton>
          </Grid>
        ) : null}
      </Grid>
    </>
  ) : (
    <Box />
  );
}
