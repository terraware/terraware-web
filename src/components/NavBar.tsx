import { Tab, Tabs } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import React from "react";
import { Link as RouterLink, useRouteMatch } from "react-router-dom";

const useStyles = makeStyles((theme) =>
  createStyles({
    icon: {
      padding: theme.spacing(1, 1),
      width: "68px",
    },
    appBar: {
      backgroundColor: theme.palette.common.white,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    grow: {
      flexGrow: 1,
    },
    addAccession: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    flex: {
      display: "flex",
    },
  })
);

export default function NavBar(): JSX.Element | null {
  const isSpeciesRoute = useRouteMatch("/species/");
  const classes = useStyles();
  const [tabIndexSelected, setTabIndexSelected] = React.useState(0);
  React.useEffect(() => {
    setTabIndexSelected(isSpeciesRoute ? 1 : 0);
  }, [isSpeciesRoute]);

  return (
    <AppBar position="static" className={classes.appBar} elevation={1}>
      <Toolbar className={classes.grow}>
        <div className={classes.icon} id="tf-icon">
          <img src="/assets/logo.svg" alt="logo" />
        </div>
        <Tabs
          value={tabIndexSelected}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            id="tab-dashboard"
            label="Dashboard"
            component={RouterLink}
            to="/"
          />
          <Tab
            id="tab-species"
            label="Species"
            component={RouterLink}
            to="/species"
          />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}
