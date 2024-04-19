import React from 'react';

import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { ViabilityTest } from 'src/types/Accession';

import ViabilityTestingDatabase from './ViabilityTestingDatabase';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    width: '180px',
    height: '115px',
    margin: `${theme.spacing(2)} 0`,
  },
}));

type ViabilityTestingPanelProps = {
  accession: Accession;
  canAddTest: boolean;
  reload: () => void;
  setNewViabilityTestOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTest: React.Dispatch<React.SetStateAction<ViabilityTest | undefined>>;
  setViewViabilityTestModalOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ViabilityTestingPanel(props: ViabilityTestingPanelProps): JSX.Element {
  const classes = useStyles();
  const { accession, canAddTest, setNewViabilityTestOpened, setSelectedTest, setViewViabilityTestModalOpened } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

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
            canAddTest={canAddTest}
            onNewViabilityTest={() => setNewViabilityTestOpened(true)}
            onSelectViabilityTest={onTestSelected}
          />
        </Box>
      ) : (
        <Box
          width={isMobile ? '100%' : '700px'}
          textAlign='center'
          sx={{ margin: '0 auto', padding: theme.spacing(9, 0) }}
        >
          <Typography>{strings.VIABILITY_TESTING_EMPTY_MESSAGE}</Typography>
          <Icon name='blobbyIconSeedBank' className={classes.icon} />
          {canAddTest ? (
            <Box>
              <Button priority='secondary' label={strings.ADD_TEST} onClick={() => setNewViabilityTestOpened(true)} />
            </Box>
          ) : null}
        </Box>
      )}
    </>
  );
}
