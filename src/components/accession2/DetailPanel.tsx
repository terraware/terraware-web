import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { Accession2 } from 'src/api/accessions2/accession';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type DetailPanelProps = {
  accession?: Accession2;
};
export default function DetailPanel(props: DetailPanelProps): JSX.Element {
  const { accession } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const history = useHistory();

  const categoryStyle = {
    color: '#708284',
  };

  const gridRowStyle = {
    display: isMobile ? 'block' : 'flex',
    padding: theme.spacing(2, 0),
  };

  const mainStructureSize = isMobile ? 12 : 9;
  const gridLeftSide = isMobile ? 12 : 4;

  const gridRightSide = isMobile ? 12 : 8;
  const today = moment();
  const seedCollectionDate = accession?.collectedDate ? moment(accession?.collectedDate, 'YYYY-MM-DD') : undefined;

  const age = seedCollectionDate ? today.diff(seedCollectionDate, 'months') : undefined;

  const displayAge = () => {
    if (age === undefined) {
      return '';
    } else if (age < 1) {
      return strings.LESS_THAN_A_MONTH;
    } else {
      return `${age} ${strings.MONTHS}`;
    }
  };

  const goToEdit = () => {
    if (accession) {
      history.push(APP_PATHS.ACCESSIONS2_EDIT.replace(':accessionId', accession.id.toString()));
    }
  };

  return accession ? (
    <Grid container>
      {isMobile ? (
        <Grid item xs={12}>
          <Button label={strings.EDIT} onClick={goToEdit} />
        </Grid>
      ) : null}
      <Grid item xs={mainStructureSize}>
        <Grid item xs={12} sx={gridRowStyle}>
          <Grid item xs={gridLeftSide} sx={categoryStyle}>
            {strings.QUANTITY}
          </Grid>
          <Grid item xs={gridRightSide}>
            {accession.remainingQuantity?.quantity} {accession.remainingQuantity?.units}
            {accession.remainingQuantity?.grams ? `(${accession.remainingQuantity?.grams} ${strings.GRAMS})` : ''}
          </Grid>
        </Grid>
        <Grid item xs={12} sx={gridRowStyle}>
          <Grid item xs={gridLeftSide} sx={categoryStyle}>
            {strings.VIABILITY}
          </Grid>
          <Grid item xs={gridRightSide}>
            {accession.latestViabilityPercent}
          </Grid>
        </Grid>
        <Grid item xs={12} sx={gridRowStyle}>
          <Grid item xs={gridLeftSide} sx={categoryStyle}>
            {strings.AGE}
          </Grid>
          <Grid item xs={gridRightSide}>
            {displayAge()}
          </Grid>
        </Grid>
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
              <Typography>
                ({strings.OWNER}: {accession.collectionSiteLandowner})
              </Typography>
            ) : (
              ''
            )}
            {accession.collectionSiteCity &&
            accession.collectionSiteCountrySubdivision &&
            accession.collectionSiteCountryCode
              ? `${accession.collectionSiteCity}, ${accession.collectionSiteCountrySubdivision},
              ${accession.collectionSiteCountryCode}`
              : ''}
            {accession.collectionSiteCoordinates && accession.collectionSiteCoordinates.length > 0
              ? accession.collectionSiteCoordinates?.map(
                  (coordinate) => `${coordinate.longitude},  ${coordinate.latitude}`
                )
              : ''}
          </Grid>
        </Grid>
        <Grid item xs={12} sx={gridRowStyle}>
          <Grid item xs={gridLeftSide} sx={categoryStyle}>
            {strings.PLANT_AND_SITE}
          </Grid>
          <Grid item xs={gridRightSide}>
            {`${strings.COLLECTED_FROM} ${accession.plantsCollectedFromMax}-${accession.plantsCollectedFromMin} ${strings.WILD_PLANT}`}
            {accession.founderId ? <Typography>{`${strings.PLANT_ID}: ${accession.founderId}`}</Typography> : ''}
            {accession.notes}
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
                  <img src={`/api/v1/seedbank/accessions/${accession.id}/photos/${file}`} width={'200px'} alt='' />
                </Box>
              );
            })}
          </Grid>
        </Grid>
      </Grid>

      <Grid />
      {!isMobile ? (
        <Grid item xs={3}>
          <Button label={strings.EDIT} onClick={goToEdit} />
        </Grid>
      ) : null}
    </Grid>
  ) : (
    <Box />
  );
}
