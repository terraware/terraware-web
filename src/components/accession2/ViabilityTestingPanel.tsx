import { Box, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useState } from 'react';
import { Accession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import NewViabilityTestModal from './NewTestModal';

type ViabilityTestingPanelProps = {
  accession: Accession2;
  reload: () => void;
};
export default function ViabilityTestingPanel(props: ViabilityTestingPanelProps): JSX.Element {
  const { accession, reload } = props;
  const { isMobile } = useDeviceInfo();

  const [newViabilityTestOpened, setNewViabilityTestOpened] = useState(false);

  return (
    <>
      <NewViabilityTestModal
        open={newViabilityTestOpened}
        reload={reload}
        accession={accession}
        onClose={() => setNewViabilityTestOpened(false)}
      />
      {accession?.viabilityTests ? (
        <Box>Viability Testing</Box>
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
