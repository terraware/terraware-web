import { AppBar, Tab } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";
import React from "react";
import * as speciesData from "../../data/species.json";
import Table from "../common/table";
import { TableColumnType } from "../common/table/types";
import Map from "../Map";
import GeolocationCellRenderer from "./GeolocationCellRenderer";

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
  })
);

export default function Dashboard(): JSX.Element {
  const classes = useStyles();

  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
  };

  return (
    <main>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <Paper className={classes.paper}>
                  <Typography
                    component="h2"
                    variant="h6"
                    color="primary"
                    gutterBottom
                  >
                    500 Trees
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper className={classes.paper}>
                  <Typography
                    component="h2"
                    variant="h6"
                    color="primary"
                    gutterBottom
                  >
                    20 Species
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={1} />
          <Grid item xs={1} />
          <Grid item xs={6}>
            <TabContext value={value}>
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
            </TabContext>
          </Grid>
          <Grid item xs={5} />
        </Grid>
      </Container>
    </main>
  );
}

const columns: TableColumnType[] = [
  { key: "name", name: "Name", type: "string" },
  { key: "location", name: "Location", type: "string" },
];

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
