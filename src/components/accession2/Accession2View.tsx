import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, IconButton, Link, Tab, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Icon } from '@terraware/web-components';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Accession2, getAccession2 } from 'src/api/accessions2/accession';
import { checkIn } from 'src/api/seeds/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import TfMain from '../common/TfMain';
import DeleteAccessionModal from './DeleteAccessionModal';
import DetailPanel from './DetailPanel';
import EditLocationModal from './EditLocationModal';
import EditStateModal from './EditStateModal';
import QuantityModal from './QuantityModal';
import WithdrawModal from './WithdrawModal';

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
  organization: ServerOrganization;
  user: User;
}

export default function Accession2View(props: Accession2ViewProps): JSX.Element {
  const { accessionId } = useParams<{ accessionId: string }>();
  const [selectedTab, setSelectedTab] = useState('detail');
  const [accession, setAccession] = useState<Accession2>();
  const [openEditLocationModal, setOpenEditLocationModal] = useState(false);
  const [openEditStateModal, setOpenEditStateModal] = useState(false);
  const [openDeleteAccession, setOpenDeleteAccession] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [quantityModalOpened, setQuantityModalOpened] = useState(false);
  const [age, setAge] = useState('');
  const { organization, user } = props;
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

  useEffect(() => {
    const today = moment();
    const seedCollectionDate = accession?.collectedDate ? moment(accession?.collectedDate, 'YYYY-MM-DD') : undefined;
    const accessionAge = seedCollectionDate ? today.diff(seedCollectionDate, 'months') : undefined;
    if (accessionAge === undefined) {
      setAge('');
    } else if (accessionAge < 1) {
      setAge(strings.LESS_THAN_A_MONTH);
    } else {
      setAge(`${accessionAge} ${strings.MONTHS}`);
    }
  }, [accession]);

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
    cursor: 'pointer',
  };

  const checkInAccession = async () => {
    if (accession) {
      await checkIn(accession.id);
      reloadData();
    }
  };

  const getAbsoluteQuantity = () => {
    if (accession && accession.remainingQuantity) {
      if (accession.remainingQuantity.units === 'Seeds') {
        return (
          <Typography display='flex' sx={{ marginRight: '5px' }}>
            <Typography sx={{ fontWeight: 600, marginRight: '5px' }}>{accession.remainingQuantity.quantity}</Typography>
            <Typography>{strings.CT}</Typography>
          </Typography>
        );
      } else {
        return (
          <Typography display='flex' sx={{ marginRight: '5px' }}>
            <Typography sx={{ fontWeight: 600, marginRight: '5px' }}>{accession.remainingQuantity.grams}</Typography>
            <Typography>{strings.GRAMS}</Typography>
          </Typography>
        );
      }
    }
  };

  const getStylesForState = () => {
    switch (accession?.state) {
      case 'Awaiting Check-In':
        return {
          background: '#FFF1F4',
          border: '1px solid #FFBFD0',
          color: '#CD0069',
        };

      case 'Awaiting Processing':
        return {
          background: '#FFF1F1',
          border: '1px solid #FFC1C1',
          color: '#D40002',
        };
      case 'Processing':
        return {
          background: '#FEF2EE',
          border: '1px solid #FAC4B1',
          color: '#9A572B',
        };
      case 'Drying':
        return {
          background: '#FEF3E1',
          border: '1px solid #FBCA47',
          color: '#9A7B25',
        };
      case 'In Storage': {
        return {
          background: '#8CBA441A',
          border: '1px solid #8CBA4480',
          color: '#27764E',
        };
      }
      default: {
        return {
          background: '#F2F4F5',
          border: '1px solid #CAD2D3',
          color: '#5C6B6C',
        };
      }
    }
  };

  const getEstimatedQuantity = () => {
    if (accession?.remainingQuantity?.units === 'Seeds') {
      if (accession.estimatedWeight?.grams) {
        return (
          <Typography>
            (~{accession.estimatedWeight?.grams} {strings.GRAMS})
          </Typography>
        );
      }
    } else {
      if (accession?.estimatedCount) {
        return (
          <Typography>
            (~{accession?.estimatedCount} {strings.CT})
          </Typography>
        );
      }
    }
    return '';
  };

  return (
    <TfMain>
      {accession && (
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
          <DeleteAccessionModal
            open={openDeleteAccession}
            onClose={() => setOpenDeleteAccession(false)}
            accession={accession}
          />
          <WithdrawModal
            open={openWithdrawModal}
            onClose={() => setOpenWithdrawModal(false)}
            accession={accession}
            reload={reloadData}
            organization={organization}
            user={user}
          />
          <QuantityModal
            open={quantityModalOpened}
            onClose={() => setQuantityModalOpened(false)}
            accession={accession}
            organization={organization}
            reload={reloadData}
            setOpen={() => setQuantityModalOpened(true)}
          />
        </>
      )}
      <Box padding={3}>
        <Box display='flex' justifyContent='space-between'>
          <Typography>{accession?.accessionNumber}</Typography>
          <Box display='flex' alignItems='center'>
            <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenDeleteAccession(true)}>
              <Icon name='iconTrashCan' />
            </IconButton>
            {accession && accession.state === 'Awaiting Check-In' ? (
              <Button onClick={() => checkInAccession()} label={strings.CHECK_IN} />
            ) : (
              <Button onClick={() => setOpenWithdrawModal(true)} label={strings.WITHDRAW} />
            )}
          </Box>
        </Box>
        <Typography color='#343A40' fontSize='24px' fontStyle='italic' fontWeight={500}>
          {accession?.speciesScientificName}
        </Typography>
        <Typography color='#708284'>{accession?.speciesCommonName}</Typography>
      </Box>

      <Box display='flex' alignItems='center'>
        {accession?.state && (
          <Box display='flex' padding={(theme) => theme.spacing(0, 3)} alignItems='center'>
            <Icon name='seedbankNav' className={classes.iconStyle} />
            <Box
              display='flex'
              sx={{
                '&:hover .edit-icon': {
                  display: 'block',
                },
              }}
              alignItems='center'
            >
              <Typography
                paddingLeft={1}
                sx={{ ...getStylesForState(), padding: 1, borderRadius: '8px', fontSize: '14px', marginLeft: 1 }}
              >
                {accession.state}
              </Typography>
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditStateModal(true)}>
                <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
          </Box>
        )}
        {accession?.storageLocation && (
          <Box display='flex' padding={(theme) => theme.spacing(0, 2)} alignItems='center'>
            <Icon name='iconMyLocation' className={classes.iconStyle} />
            <Box
              display='flex'
              sx={{
                '&:hover .edit-icon': {
                  display: 'block',
                },
              }}
              alignItems='center'
            >
              <Typography paddingLeft={1}>{accession.storageLocation}</Typography>
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditLocationModal(true)}>
                <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
          </Box>
        )}
        <Box display='flex' padding={(theme) => theme.spacing(0, 2)} alignItems='center'>
          <Icon name='notification' className={classes.iconStyle} />
          <Typography paddingLeft={1}>Notification</Typography>
        </Box>
      </Box>

      <Box display='flex'>
        <Box padding={4}>
          <Typography>{strings.QUANTITY} </Typography>
          {accession?.remainingQuantity?.quantity ? (
            <Box
              display='flex'
              sx={{
                '&:hover .edit-icon': {
                  display: 'block',
                },
              }}
            >
              <Box display='flex'>
                {getAbsoluteQuantity()} {getEstimatedQuantity()}
              </Box>
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setQuantityModalOpened(true)}>
                <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
          ) : (
            <Link sx={linkStyle} onClick={() => setQuantityModalOpened(true)}>
              + {strings.ADD}
            </Link>
          )}
        </Box>
        <Box padding={4}>
          <Typography>{strings.AGE}</Typography>
          {accession?.collectedDate ? <Typography> {age} </Typography> : null}
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
            <DetailPanel accession={accession} organization={organization} reload={reloadData} />
          </TabPanel>
          <TabPanel value='history'>{strings.HISTORY}</TabPanel>
          <TabPanel value='viabilityTesting'>{strings.VIABILITY_TESTING}</TabPanel>
        </TabContext>
      </Box>
    </TfMain>
  );
}
