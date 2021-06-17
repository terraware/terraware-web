import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import React from "react";
import Map from "./Map";
import SpeciesChart from "./SpeciesChart";

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: "flex",
      overflow: "auto",
      flexDirection: "column",
      marginBottom: "30px",
    },
    fixedHeight: {
      height: "100%",
    },
    map: {
      width: "100%",
      height: "400px",
    },
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
    depositContext: {
      flex: 1,
      marginLeft: theme.spacing(1),
    },
    details: {
      display: "flex",
      height: "24px",
    },
    cell: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    border: {
      borderRight: `1px solid ${theme.palette.grey[300]}`,
      padding: theme.spacing(5, 1),
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

  // const [value, setValue] = React.useState("1");

  // const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
  //   setValue(newValue);
  // };

  return (
    <main>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={isFullscreen ? 12 : 6}>
            {/* <TabContext value={value}>
              <AppBar position="static">
                <TabList onChange={handleChange} aria-label="simple tabs">
                  <Tab label="Map" {...a11yProps(0)} value="1" />
                  <Tab label="Table" {...a11yProps(1)} value="2" />
                </TabList>
              </AppBar>
              <TabPanel value="1">
                <Grid container spacing={3}>
                  <Map></Map>
                </Grid>
              </TabPanel>
              <TabPanel value="2">
                <Table
                  columns={columns}
                  rows={speciesData.features}
                  orderBy="name"
                  Renderer={GeolocationCellRenderer}
                />
              </TabPanel>
            </TabContext> */}
            <Map onFullscreen={onFullscreenHandler}></Map>
          </Grid>
          <Grid item xs={isFullscreen ? 12 : 6}>
            <Grid container>
              <Grid item xs={12}>
                <TableContainer component={Paper}>
                  <Table aria-label="simple table">
                    <TableBody>
                      <TableRow>
                        <TableCell className={classes.border}>
                          <div className={classes.cell}>
                            <div>
                              <Typography
                                component="h2"
                                variant="h6"
                                gutterBottom
                              >
                                63 Trees
                              </Typography>
                              <div className={classes.details}>
                                <ArrowUpwardIcon color="primary" />
                                <Typography
                                  color="textSecondary"
                                  className={classes.depositContext}
                                >
                                  10% since last week
                                </Typography>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={classes.cell}>
                            <div>
                              <Typography
                                component="h2"
                                variant="h6"
                                gutterBottom
                              >
                                3 Species
                              </Typography>
                              <div className={classes.details}>
                                <ArrowUpwardIcon color="primary" />
                                <Typography
                                  color="textSecondary"
                                  className={classes.depositContext}
                                >
                                  20% since last week
                                </Typography>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12}>
                <Paper className={classes.mapContainer}>
                  <SpeciesChart isFullscreen={isFullscreen} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}

// const columns: TableColumnType[] = [
//   { key: "name", name: "Name", type: "string" },
//   { key: "location", name: "Location", type: "string" },
// ];

// function a11yProps(index: any) {
//   return {
//     id: `simple-tab-${index}`,
//     "aria-controls": `simple-tabpanel-${index}`,
//   };
// }
