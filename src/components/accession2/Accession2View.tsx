import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Link, Tab, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Accession2, getAccession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import TfMain from '../common/TfMain';
import DetailPanel from './DetailPanel';

const useStyles = makeStyles(() => ({
  iconStyle: {
    fill: '#3A4445',
  },
}));

export default function Accession2View(): JSX.Element {
  const { accessionId } = useParams<{ accessionId: string }>();
  const [selectedTab, setSelectedTab] = useState('detail');
  const [accession, setAccession] = useState<Accession2>();

  const classes = useStyles();

  useEffect(() => {
    const populateAccession = async () => {
      const response = await getAccession2(parseInt(accessionId, 10));
      setAccession(response);
    };

    if (accessionId !== undefined) {
      populateAccession();
    } else {
      setAccession(undefined);
    }
  }, [accessionId]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  const tabStyles = {
    textTransform: 'capitalize',
    '&.Mui-selected': {
      color: '#3A4445',
      fontWeight: 600,
    },
  };

  const linkStyle = {
    textDecoration: 'none',
  };

  return (
    <TfMain>
      <Box padding={3}>
        <Typography>{accession?.accessionNumber}</Typography>
        <Typography color='#343A40' fontSize='24px' fontStyle='italic' fontWeight={500}>
          {accession?.speciesScientificName}
        </Typography>
        <Typography color='#708284'>{accession?.speciesCommonName}</Typography>
      </Box>

      <Box display='flex'>
        {accession?.state && (
          <Box display='flex' padding={(theme) => theme.spacing(0, 3)}>
            <Icon name='seedbankNav' className={classes.iconStyle} />
            <Typography paddingLeft={1}>{accession.state}</Typography>
          </Box>
        )}
        {accession?.storageLocation && (
          <Box display='flex' padding={(theme) => theme.spacing(0, 2)}>
            <Icon name='info' className={classes.iconStyle} />
            <Typography paddingLeft={1}>{accession.storageLocation}</Typography>
          </Box>
        )}
        <Box display='flex' padding={(theme) => theme.spacing(0, 2)}>
          <Icon name='notification' className={classes.iconStyle} />
          <Typography paddingLeft={1}>Notification</Typography>
        </Box>
      </Box>

      <Box display='flex'>
        <Box padding={4}>
          <Typography>{strings.QUANTITY} </Typography>
          <Link sx={linkStyle} onClick={() => true}>
            + {strings.ADD}
          </Link>
        </Box>
        <Box padding={4}>
          <Typography>{strings.AGE}</Typography>
          <Link sx={linkStyle} onClick={() => true}>
            + {strings.ADD}
          </Link>
        </Box>
        <Box padding={4}>
          <Typography>{strings.VIABILITY}</Typography>
          <Link sx={linkStyle} onClick={() => true}>
            + {strings.ADD}
          </Link>
        </Box>
      </Box>
      <Box sx={{ width: '100%' }}>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange}>
              <Tab label={strings.DETAIL} value='detail' sx={tabStyles} />
              <Tab label={strings.HISTORY} value='history' sx={tabStyles} />
              <Tab label={strings.VIABILITY_TESTING} value='viabilityTesting' sx={tabStyles} />
            </TabList>
          </Box>
          <TabPanel value='detail'>
            <DetailPanel accession={accession} />
          </TabPanel>
          <TabPanel value='history'>{strings.HISTORY}</TabPanel>
          <TabPanel value='viabilityTesting'>{strings.VIABILITY_TESTING}</TabPanel>
        </TabContext>
      </Box>
    </TfMain>
  );
}
