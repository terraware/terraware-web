import { CssBaseline, Grid, ThemeProvider } from "@material-ui/core";
import React, { Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import { RecoilRoot, useRecoilValue } from "recoil";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import Species from "./components/Species";
import sessionSelector from "./state/selectors/session";
import theme from "./theme";

function App() {
  return (
    <RecoilRoot>
      <Suspense fallback={"loading"}>
        <Router>
          <AppContent />
        </Router>
      </Suspense>
    </RecoilRoot>
  );
}

export default App;

function AppContent() {
  const session = useRecoilValue(sessionSelector);
  const history = useHistory();

  useEffect(() => {
    if (session) {
      history.push("/dashboard");
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!session && <Route exact path="/" component={Login} />}
      {session && (
        <Grid container spacing={3}>
          <Grid item xs={1}>
            <NavBar />
          </Grid>
          <Grid item xs={11}>
            <Switch>
              <Route exact path="/dashboard" component={Dashboard} />
              <Route exact path="/species" component={Species} />
            </Switch>
          </Grid>
        </Grid>
      )}
    </ThemeProvider>
  );
}
