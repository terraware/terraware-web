import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, IconButton, Link, Tab, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Accession2, getAccession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from '../common/TfMain';
import DetailPanel from './DetailPanel';
import EditLocationModal from './EditLocationModal';
import EditStateModal from './EditStateModal';

const useStyles = makeStyles(() => ({
  iconStyle: {
    fill: '#3A4445',
  },
  editIcon: {
    display: 'none',
    fill: '#3A4445',
  },
}));
interface Accession2ViewProps {
  organization?: ServerOrganization;
}

export default function Accession2View(props: Accession2ViewProps): JSX.Element {
  const { accessionId } = useParams<{ accessionId: string }>();
  const [selectedTab, setSelectedTab] = useState('detail');
  const [accession, setAccession] = useState<Accession2>();
  const [openEditLocationModal, setOpenEditLocationModal] = useState(false);
  const [openEditStateModal, setOpenEditStateModal] = useState(false);
  const { organization } = props;
  const classes = useStyles();

  const reloadData = useCallback(() => {
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

  useEffect(() => {
    reloadData();
  }, [accessionId, reloadData]);

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
      {organization && (
        <>
          <EditLocationModal
            open={openEditLocationModal}
            onClose={() => setOpenEditLocationModal(false)}
            accession={accession}
            organization={organization}
            reload={reloadData}
          />
          <EditStateModal
            open={openEditStateModal}
            onClose={() => setOpenEditStateModal(false)}
            accession={accession}
            reload={reloadData}
          />
        </>
      )}
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
            <Box
              display='flex'
              sx={{
                '&:hover .edit-icon': {
                  display: 'block',
                },
              }}
            >
              <Typography paddingLeft={1}>{accession.state}</Typography>
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditStateModal(true)}>
                <Icon name='plus' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
          </Box>
        )}
        {accession?.storageLocation && (
          <Box display='flex' padding={(theme) => theme.spacing(0, 2)}>
            <Icon name='info' className={classes.iconStyle} />
            <Box
              display='flex'
              sx={{
                '&:hover .edit-icon': {
                  display: 'block',
                },
              }}
            >
              <Typography paddingLeft={1}>{accession.storageLocation}</Typography>
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditLocationModal(true)}>
                <Icon name='plus' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
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
