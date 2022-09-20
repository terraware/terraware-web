import { Box, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { Accession2 } from 'src/api/accessions2/accession';
import { ViabilityTest } from 'src/api/types/accessions';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import ViabilityTestingDatabase from './ViabilityTestingDatabase';

type ViabilityTestingPanelProps = {
  accession: Accession2;
  reload: () => void;
  organization: ServerOrganization;
  user: User;
  setNewViabilityTestOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTest: React.Dispatch<React.SetStateAction<ViabilityTest | undefined>>;
  setViewViabilityTestModalOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ViabilityTestingPanel(props: ViabilityTestingPanelProps): JSX.Element {
  const { accession, setNewViabilityTestOpened, setSelectedTest, setViewViabilityTestModalOpened } = props;
  const { isMobile } = useDeviceInfo();

  const onTestSelected = (test: ViabilityTest) => {
    setSelectedTest(test);
    setViewViabilityTestModalOpened(true);
  };

  return (
    <>
      {accession?.viabilityTests ? (
        <Box>
          <ViabilityTestingDatabase
            accession={accession}
            onNewViabilityTest={() => setNewViabilityTestOpened(true)}
            onSelectViabilityTest={onTestSelected}
          />
        </Box>
      ) : (
        <Box width={isMobile ? '100%' : '420px'} textAlign='center' sx={{ margin: '0 auto', paddingTop: 4 }}>
          <Typography>{strings.VIABILITY_TESTING_EMPTY_MESSAGE}</Typography>
          <Box sx={{ marginTop: 4 }}>
            <Button
              priority='secondary'
              label={strings.START_TESTING}
              onClick={() => setNewViabilityTestOpened(true)}
            />
          </Box>
        </Box>
      )}
    </>
  );
}
