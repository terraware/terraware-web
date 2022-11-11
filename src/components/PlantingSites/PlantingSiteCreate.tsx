import { ServerOrganization } from 'src/types/Organization';
import TfMain from 'src/components/common/TfMain';

type CreatePlantingSiteProps = {
  organization: ServerOrganization;
};

export default function CreatePlantingSite(props: CreatePlantingSiteProps): JSX.Element {
  return <TfMain />;
}
