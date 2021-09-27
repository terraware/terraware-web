import { Table, TableBody, TableContainer, TableRow } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { PlantSummary } from '../../../api/types/plant';
import plantsSummarySelector from '../../../state/selectors/plantsSummary';
import strings from '../../../strings';
import Map from './Map';
import SpeciesChart from './SpeciesChart';
import SummaryCell from './SummaryCell';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    map: {
      width: '100%',
      height: '400px',
    },
    mapContainer: {
      paddingTop: theme.spacing(5),
    },
  })
);

export default function Dashboard(): JSX.Element {
  const classes = useStyles();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const onFullscreenHandler = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <main>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={isFullscreen ? 12 : 6}>
            <React.Suspense fallback={strings.LOADING}>
              <Map
                onFullscreen={onFullscreenHandler}
                isFullscreen={isFullscreen}
              />
            </React.Suspense>
          </Grid>
          <Grid item xs={isFullscreen ? 12 : 6}>
            <Grid container>
              <Grid item xs={12}>
                <TableContainer component={Paper}>
                  <Table aria-label='simple table'>
                    <TableBody>
                      <React.Suspense fallback={strings.LOADING}>
                        <SummaryRow />
                      </React.Suspense>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.mapContainer}>
                  <React.Suspense fallback={strings.LOADING}>
                    <SpeciesChart isFullscreen={isFullscreen} />
                  </React.Suspense>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}

function SummaryRow(): JSX.Element {
  const lastWeekPlantsSummary = useRecoilValue(plantsSummarySelector(7));
  const lastWeekSummary = getSummary(lastWeekPlantsSummary);

  const currentPlantsSummary = useRecoilValue(plantsSummarySelector(0));
  const currentSummary = getSummary(currentPlantsSummary);

  return (
    <TableRow>
      <SummaryCell
        title={strings.PLANTS}
        current={currentSummary.plants}
        lastWeek={lastWeekSummary.plants}
      />
      <SummaryCell
        title={strings.SPECIES}
        current={currentSummary.species}
        lastWeek={lastWeekSummary.species}
      />
    </TableRow>
  );
}

interface Summary {
  plants: number;
  species: number;
}

const getSummary = (plantsSummary: PlantSummary[] | undefined): Summary => {
  const result = {
    plants: 0,
    species: plantsSummary?.length ?? 0,
  };
  if (plantsSummary) {
    plantsSummary.forEach((plant) => {
      result.plants += plant.count;
    });
  }

  return result;
};
