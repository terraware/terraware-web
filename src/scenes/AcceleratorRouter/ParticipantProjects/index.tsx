import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ScoringProvider from '../Scoring/ScoringProvider';
import VotingProvider from '../Voting/VotingProvider';
import EditView from './EditView';
import ParticipantProjectProvider from './ParticipantProjectProvider';
import SingleView from './SingleView';

const ParticipantProjectsRouter = () => {
  return (
    <ProjectProvider>
      <VotingProvider>
        <ScoringProvider>
          <ParticipantProjectProvider>
            <Switch>
              <Route exact path={APP_PATHS.ACCELERATOR_PROJECT_VIEW}>
                <SingleView />
              </Route>
              <Route exact path={APP_PATHS.ACCELERATOR_PROJECT_EDIT}>
                <EditView />
              </Route>
              <Route path={'*'}>
                <Redirect to={APP_PATHS.ACCELERATOR_OVERVIEW} />
              </Route>
            </Switch>
          </ParticipantProjectProvider>
        </ScoringProvider>
      </VotingProvider>
    </ProjectProvider>
  );
};

export default ParticipantProjectsRouter;
