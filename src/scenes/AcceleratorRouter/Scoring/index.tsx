import { useParams } from 'react-router-dom';

import Page from 'src/components/Page';

import useScoreList from './useScoreList';

const Scoring = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const scores = useScoreList(projectId);
  // This goes away when the view is implemented
  // tslint:disable:no-console
  console.log(scores);

  return <Page title={`Scoring for project ${projectId}`} />;
};

export default Scoring;
