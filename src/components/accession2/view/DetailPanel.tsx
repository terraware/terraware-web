import { Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import { Accession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { searchCountries } from 'src/api/country/country';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import { Country } from 'src/types/Country';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Accession2EditModal from '../edit/Accession2EditModal';
import ViewPhotosModal from './ViewPhotosModal';
import { isContributor } from 'src/utils/organization';

type DetailPanelProps = {
  accession?: Accession2;
  organization: ServerOrganization;
  reload: () => void;
};
export default function DetailPanel(props: DetailPanelProps): JSX.Element {
  const { accession, organization, reload } = props;
  const userCanEdit = !isContributor(organization);
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
  const gridLeftSide = isMobile ? 12 : 2;
  const gridRightSide = isMobile ? 12 : 10;
  const [photosModalOpened, setPhotosModalOpened] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [openEditAccessionModal, setOpenEditAccessionModal] = useState(false);
  const [countries, setCountries] = useState<Country[]>();
  const classes = useStyles();

  useEffect(() => {
    const populateCountries = async () => {
      const response = await searchCountries();
      if (response) {
        setCountries(response);
      }
    };
    populateCountries();
  }, []);

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
      countries && country && subdivision ? getSubdivisionByCode(countries, country, subdivision)?.name : '',
      countries && country ? getCountryByCode(countries, country)?.name : '',
    ];

    return data.filter((str) => str).join(', ');
  };

  const collectionSource = getCollectionSource();
  const numPlants = accession?.plantsCollectedFrom;
  const isNotPlural = numPlants === 1;

  const spaceFiller = () => <Box sx={{ marginLeft: 1, height: '24px', width: 2 }} />;

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
          <Grid item xs={12} display='flex' justifyContent='space-between'>
            <Typography fontWeight={500}>{strings.ACCESSION_DETAIL}</Typography>
            {userCanEdit ? (
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditAccessionModal(true)}>
                <Icon name='iconEdit' />
              </IconButton>
            ) : (
              spaceFiller()
            )}
          </Grid>
        ) : null}
        <Grid item xs={mainStructureSize}>
          {!isMobile && (
            <Grid item xs={12}>
              <Typography fontSize='18px' fontWeight={500}>
                {strings.ACCESSION_DETAIL}
              </Typography>
            </Grid>
          )}
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
              {getCollectionSiteAddress()}

              {accession.collectionSiteNotes && (
                <Box marginTop={2} display='flex'>
                  <Typography>
                    <Icon name='iconFile' className={classes.folderIcon} />
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
            <Grid item xs={gridRightSide}>
              {`${strings.COLLECTED_FROM}${numPlants === undefined ? '' : ' ' + numPlants}${
                collectionSource && collectionSource !== 'Other' ? ' ' + collectionSource : ''
              } ${isNotPlural ? strings.PLANT : strings.PLANTS}`}
              {accession.plantId ? <Typography>{`${strings.PLANT_ID}: ${accession.plantId}`}</Typography> : ''}
              {accession.notes ? (
                <Box marginTop={2} display='flex'>
                  <Typography>
                    <Icon name='iconFile' className={classes.folderIcon} />
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
            {userCanEdit ? (
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditAccessionModal(true)}>
                <Icon name='iconEdit' />
              </IconButton>
            ) : (
              spaceFiller()
            )}
          </Grid>
        ) : null}
      </Grid>
    </>
  ) : (
    <Box />
  );
}
