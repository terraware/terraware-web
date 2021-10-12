/* eslint-disable import/no-webpack-loader-syntax */
import {
  createStyles,
  CssBaseline,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core';
import mapboxgl from 'mapbox-gl';
import React, {useEffect, useState} from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import AppBar from './components/AppBar';
import NavBar from './components/NavBar';
import AllPlants from './components/plants/AllPlants';
import Dashboard from './components/plants/Dashboard';
import Species from './components/plants/Species';
import Accession from './components/seeds/accession';
import Database from './components/seeds/database';
import Help from './components/seeds/help';
import NewAccession from './components/seeds/newAccession';
import Summary from './components/seeds/summary';
import Snackbar from './components/Snackbar';
import ErrorBoundary from './ErrorBoundary';
import strings from './strings';
import theme from './theme';
import useTimer from './utils/useTimer';
import PageHeader from './components/seeds/PageHeader';
import PlantsDashboard from './components/plants/Dashboard';
import PlantsList from './components/plants/AllPlants';

// @ts-ignore
mapboxgl.workerClass =
  // tslint:disable-next-line: no-var-requires
  require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

export default function App() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={strings.LOADING}>
          <Router>
            <ThemeProvider theme={theme}>
              <AppContent />
            </ThemeProvider>
          </Router>
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}

const useStyles = makeStyles(() =>
  createStyles({
    content: {
      marginLeft: '200px',
    },
  })
);

function AppContent() {
  const classes = useStyles();
  useTimer();

  const [testList, setTestList] = useState([1, 2, 3, 4]);

  const testFunctionAddsNumToList = () => {
    setTestList((curr) => {
      return [...curr, curr[curr.length - 1] + 1];
    });
  };

  return (
    <>
      <CssBaseline />
      <Snackbar />
      <>
        <div>
          <NavBar />
        </div>
        <div className={classes.content}>
          <AppBar />
          <ErrorBoundary>
            <Switch>
              <Route exact path='/'>
                <Redirect to='/dashboard' />
              </Route>
              <Route exact path='/dashboard' component={Dashboard} />
              <Route exact path='/plants' component={AllPlants} />
              <Route exact path='/species' component={Species} />
              <Route path='/accessions/new' component={NewAccession} />
              <Route path='/accessions/:accessionId' component={Accession} />
              <Route path='/accessions' component={Database} />
              <Route path='/species' component={Species} />
              <Route path='/help' component={Help} />
              <Route exact path='/summary' component={Summary} />
              <Route path='/test'>
                <TestComponent1 testList={testList} addNumToList={testFunctionAddsNumToList}/>
              </Route>
            </Switch>
          </ErrorBoundary>
        </div>
      </>
      )
    </>
  );
}

function TestComponent1(props: {testList: number[], addNumToList: () => void}) {

  return (
    <>
      <h1>This is TestRoute1</h1>
      <TestComponent4/>
      <TestComponent2 addNumToList={props.addNumToList}/>
      <TestComponent3 testList={props.testList}/>
    </>
  );
}

function TestComponent2(props: {addNumToList: () => void}) {
  console.log('rendering TestComponent2');

  return (
    <>
      <h2>TestRoute2 doesn't use our test list, but modifies it.</h2>
      <button onClick={() => props.addNumToList()}>Add number to list</button>
    </>
  );

}

function TestComponent3(props: {testList: number[]}) {
  console.log('rendering TestComponent3');

  return (
    <>
      <h2>Here is my number list</h2>
      <ul>
        {props.testList.map((num) => {
          return <li key={num}>item: {num}</li>;
        })};
      </ul>
    </>
  );
}

function TestComponent4() {
  return <h2>I dont have anything to do with the number list</h2>;
}

