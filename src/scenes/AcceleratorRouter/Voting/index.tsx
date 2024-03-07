import { useParams } from 'react-router-dom';

import Page from 'src/components/Page';

const Voting = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  return <Page title={`Voting for project ${projectId}`} />;
};

export default Voting;
