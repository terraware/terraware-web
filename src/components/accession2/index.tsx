import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import strings from 'src/strings';
import TfMain from '../common/TfMain';

export default function Accession2(): JSX.Element {
  const { accessionId } = useParams<{ accessionId: string }>();
  const [selectedTab, setSelectedTab] = useState('detail');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  return (
    <TfMain>
      <Box>
        <Typography>{accessionId}</Typography>
      </Box>
      <Box sx={{ width: '100%' }}>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange}>
              <Tab label={strings.DETAIL} value='detail' />
              <Tab label={strings.HISTORY} value='history' />
              <Tab label={strings.VIABILITY_TESTING} value='viabilityTesting' />
            </TabList>
          </Box>
          <TabPanel value='detail'>{strings.DETAIL}</TabPanel>
          <TabPanel value='history'>{strings.HISTORY}</TabPanel>
          <TabPanel value='viabilityTesting'>{strings.VIABILITY_TESTING}</TabPanel>
        </TabContext>
      </Box>
    </TfMain>
  );
}
