import { CssBaseline, Grid, ThemeProvider } from '@material-ui/core';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
import Species from './components/Species';
import theme from './theme';

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Grid container spacing={3}>
          <Grid item xs={1}>
            <NavBar />
          </Grid>
          <Grid item xs={11}>
            <Switch>
              <Route exact path='/' component={Dashboard} />
              <Route exact path='/species' component={Species} />
            </Switch>
          </Grid>
        </Grid>
      </ThemeProvider>
    </Router>
  );
}

export default App;
