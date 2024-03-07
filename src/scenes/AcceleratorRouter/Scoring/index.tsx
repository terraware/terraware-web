import { useParams } from 'react-router-dom';

import Page from 'src/components/Page';

const Scoring = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  return <Page title={`Scoring for project ${projectId}`} />;
};

export default Scoring;
