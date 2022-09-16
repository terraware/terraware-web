import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useTheme, Box, IconButton, Link, Tab, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Icon } from '@terraware/web-components';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Accession2, getAccession2 } from 'src/api/accessions2/accession';
import { checkIn } from 'src/api/seeds/accession';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import TfMain from 'src/components/common/TfMain';
import DeleteAccessionModal from '../edit/DeleteAccessionModal';
import DetailPanel from './DetailPanel';
import EditLocationModal from '../edit/EditLocationModal';
import EditStateModal from '../edit/EditStateModal';
import QuantityModal from '../edit/QuantityModal';
import WithdrawModal from '../withdraw/WithdrawModal';
import CheckedInConfirmationModal from '../edit/CheckedInConfirmationModal';
import Accession2History from '../history/Accession2History';
import ViabilityTestingPanel from '../viabilityTesting/ViabilityTestingPanel';
import useSnackbar from 'src/utils/useSnackbar';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles(() => ({
  iconStyle: {
    fill: '#3A4445',
  },
  editIcon: {
    display: 'none',
    fill: '#3A4445',
  },
}));

const TABS = ['detail', 'history', 'viabilityTesting'];

interface Accession2ViewProps {
  organization: ServerOrganization;
  user: User;
}

export default function Accession2View(props: Accession2ViewProps): JSX.Element {
  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();
  const tab = (query.get('tab') || '').toLowerCase();
  const preselectedTab = TABS.indexOf(tab) === -1 ? 'detail' : tab;
  const { accessionId } = useParams<{ accessionId: string }>();
  const [selectedTab, setSelectedTab] = useState(preselectedTab);
  const [accession, setAccession] = useState<Accession2>();
  const [openEditLocationModal, setOpenEditLocationModal] = useState(false);
  const [openEditStateModal, setOpenEditStateModal] = useState(false);
  const [openDeleteAccession, setOpenDeleteAccession] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [quantityModalOpened, setQuantityModalOpened] = useState(false);
  const [checkInConfirmationModalOpened, setCheckInConfirmationModalOpened] = useState(false);
  const [age, setAge] = useState('');
  const { organization, user } = props;
  const classes = useStyles();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const themeObj = useTheme();

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

  useEffect(() => {
    setSelectedTab((query.get('tab') || 'detail') as string);
  }, [query]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    query.set('tab', newValue);
    history.push(getLocation(location.pathname, location, query.toString()));
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
      try {
        await checkIn(accession.id);
        reloadData();
        setCheckInConfirmationModalOpened(true);
      } catch (e) {
        // swallow error?
        snackbar.toastError();
      }
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

  const renderWithdrawalButton = () => {
    if (accession?.remainingQuantity?.quantity) {
      return <Button onClick={() => setOpenWithdrawModal(true)} label={strings.WITHDRAW} />;
    }
    return null;
  };

  const iconProps = {
    position: 'absolute',
    right: isMobile ? 0 : `-${themeObj.spacing(1)}`,
  };

  const editableProps = {
    display: 'flex',
    whiteSpace: 'pre',
    '&:hover .edit-icon': {
      display: 'block',
      ...iconProps,
    },
    '.edit-icon': {
      display: isMobile ? 'block' : 'none',
      ...iconProps,
    },
    alignItems: 'center',
    justifyContent: isMobile ? 'space-between' : 'normal',
    width: isMobile ? '100%' : 'auto',
  };

  const editableParentProps = {
    display: 'flex',
    padding: themeObj.spacing(0, 2, isMobile ? 3 : 0),
    alignItems: 'center',
    width: isMobile ? '100%' : 'auto',
  };

  const editableDynamicValuesProps = {
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    padding: isMobile ? 1 : 4,
    width: isMobile ? '100%' : 'auto',
  };

  return (
    <TfMain>
      {accession && (
        <>
          <CheckedInConfirmationModal
            open={checkInConfirmationModalOpened}
            onClose={() => setCheckInConfirmationModalOpened(false)}
            accession={accession}
          />
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
              renderWithdrawalButton()
            )}
          </Box>
        </Box>
        <Typography color='#343A40' fontSize='24px' fontStyle='italic' fontWeight={500}>
          {accession?.speciesScientificName}
        </Typography>
        <Typography color='#708284'>{accession?.speciesCommonName}</Typography>
      </Box>

      <Box
        display='flex'
        alignItems={isMobile ? 'flex-start' : 'center'}
        flexDirection={isMobile ? 'column' : 'row'}
        padding={(theme) => theme.spacing(0, 1)}
      >
        {accession?.state && (
          <Box sx={editableParentProps}>
            <Icon name='seedbankNav' className={classes.iconStyle} />
            <Box sx={editableProps}>
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
          <Box sx={editableParentProps}>
            <Icon name='iconMyLocation' className={classes.iconStyle} />
            <Box sx={editableProps}>
              <Typography paddingLeft={1}>{accession.storageLocation}</Typography>
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenEditLocationModal(true)}>
                <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
          </Box>
        )}
        <Box
          display='flex'
          padding={(theme) => theme.spacing(0, 2)}
          alignItems='center'
          width={isMobile ? '100%' : 'auto'}
        >
          <Icon name='notification' className={classes.iconStyle} />
          <Typography paddingLeft={1}>Notification</Typography>
        </Box>
      </Box>

      <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} padding={isMobile ? 2 : 0}>
        <Box sx={editableDynamicValuesProps}>
          <Typography minWidth={isMobile ? '100px' : 0}>{strings.QUANTITY} </Typography>
          {accession?.remainingQuantity?.quantity ? (
            <Box sx={editableProps}>
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
        <Box sx={editableDynamicValuesProps}>
          <Typography minWidth={isMobile ? '100px' : 0}>{strings.AGE}</Typography>
          {accession?.collectedDate ? <Typography> {age} </Typography> : null}
        </Box>
        <Box sx={editableDynamicValuesProps}>
          <Typography minWidth={isMobile ? '100px' : 0}>{strings.VIABILITY}</Typography>
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
          <TabPanel value='history'>{accession && <Accession2History accession={accession} />}</TabPanel>
          <TabPanel value='viabilityTesting'>
            {accession && (
              <ViabilityTestingPanel
                accession={accession}
                reload={reloadData}
                organization={organization}
                user={user}
              />
            )}
          </TabPanel>
        </TabContext>
      </Box>
    </TfMain>
  );
}
