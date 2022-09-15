import { Box, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useState } from 'react';
import { Accession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import NewTestModal from './NewTestModal';

type ViabilityTestingPanelProps = {
  accession: Accession2;
  reload: () => void;
};
export default function ViabilityTestingPanel(props: ViabilityTestingPanelProps): JSX.Element {
  const { accession, reload } = props;

  const [newTestOpened, setNewTestOpened] = useState(false);

  return (
    <>
      <NewTestModal
        open={newTestOpened}
        reload={reload}
        accession={accession}
        onClose={() => setNewTestOpened(false)}
      />
      {accession?.viabilityTests ? (
        <Box>Viability Testing</Box>
      ) : (
        <Box width={'420px'} textAlign='center' sx={{ margin: '0 auto', paddingTop: 4 }}>
          <Typography>{strings.VIABILITY_TESTING_EMPTY_MESSAGE}</Typography>
          <Box sx={{ marginTop: 4 }}>
            <Button priority='secondary' label={strings.START_TESTING} onClick={() => setNewTestOpened(true)} />
          </Box>
        </Box>
      )}
    </>
  );
}
