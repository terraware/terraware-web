import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

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
    menu: {
      width: "180px",
    },
  })
);

export default function NavBar(): JSX.Element | null {
  const classes = useStyles();

  return (
    <Drawer variant="permanent" open={true} classes={{ paper: classes.menu }}>
      <div className={classes.icon} id="tf-icon">
        <img src="/assets/logo.svg" alt="logo" />
      </div>
      <Divider />
      <List>
        <div>
          <ListItem button component={RouterLink} to="/">
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component={RouterLink} to="/species">
            <ListItemText primary="Species" />
          </ListItem>
        </div>
      </List>
    </Drawer>
  );
}
