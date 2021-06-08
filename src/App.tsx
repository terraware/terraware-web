import { CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import NavBar from "./components/NavBar";
import Species from "./components/Species";
import theme from "./theme";

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NavBar />
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route exact path="/species" component={Species} />
        </Switch>
      </ThemeProvider>
    </Router>
  );
}

export default App;
