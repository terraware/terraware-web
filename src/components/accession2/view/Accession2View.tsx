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
import EndDryingReminderModal from '../edit/EndDryingReminderModal';
import QuantityModal from '../edit/QuantityModal';
import WithdrawModal from '../withdraw/WithdrawModal';
import CheckedInConfirmationModal from '../edit/CheckedInConfirmationModal';
import Accession2History from '../history/Accession2History';
import ViabilityTestingPanel from '../viabilityTesting/ViabilityTestingPanel';
import useSnackbar from 'src/utils/useSnackbar';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import ViabilityModal from '../edit/ViabilityModal';
import NewViabilityTestModal from '../viabilityTesting/NewViabilityTestModal';
import { ViabilityTest } from 'src/api/types/accessions';
import ViewViabilityTestModal from '../viabilityTesting/ViewViabilityTestModal';
import { getSeedBank } from 'src/utils/organization';
import _ from 'lodash';

const useStyles = makeStyles(() => ({
  iconStyle: {
    fill: '#3A4445',
  },
  editIcon: {
    display: 'none',
    fill: '#3A4445',
  },
  fullSizeButton: {
    width: '100%',
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
  const [openEndDryingReminderModal, setOpenEndDryingReminderModal] = useState(false);
  const [openDeleteAccession, setOpenDeleteAccession] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [openQuantityModal, setOpenQuantityModal] = useState(false);
  const [openCheckInConfirmationModal, setOpenCheckInConfirmationModal] = useState(false);
  const [hasPendingTests, setHasPendingTests] = useState(false);
  const [openViabilityModal, setOpenViabilityModal] = useState(false);
  const [openNewViabilityTest, setOpenNewViabilityTest] = useState(false);
  const [openViewViabilityTestModal, setOpenViewViabilityTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ViabilityTest>();
  const [age, setAge] = useState({ value: '', unit: '' });
  const { organization, user } = props;
  const classes = useStyles();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();
  const themeObj = useTheme();

  const reloadData = useCallback(() => {
    const populateAccession = async () => {
      try {
        const response = await getAccession2(parseInt(accessionId, 10));
        if (!_.isEqual(response, accession)) {
          setAccession(response);
          setHasPendingTests(
            response?.viabilityTests?.some((test) => test.testType !== 'Cut' && !test.endDate) || false
          );
        }
      } catch {
        snackbar.toastError();
      }
    };

    if (accessionId !== undefined) {
      populateAccession();
    } else {
      setAccession(undefined);
    }
  }, [accessionId, accession, snackbar]);

  useEffect(() => {
    reloadData();
  }, [accessionId, reloadData]);

  useEffect(() => {
    const today = moment();
    const seedCollectionDate = accession?.collectedDate ? moment(accession?.collectedDate, 'YYYY-MM-DD') : undefined;
    const accessionAge = seedCollectionDate ? today.diff(seedCollectionDate, 'months') : undefined;
    if (accessionAge === undefined) {
      setAge({ value: '', unit: '' });
    } else if (accessionAge < 1) {
      setAge({ value: strings.LESS_THAN_ONE, unit: strings.MONTH.toLowerCase() });
    } else {
      setAge({ value: accessionAge.toString(), unit: strings.MONTHS });
    }
  }, [accession]);

  useEffect(() => {
    setSelectedTab((query.get('tab') || 'detail') as string);
  }, [query]);

  const handleChange = (newValue: string) => {
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

  const viabilityTestingStyle = () => {
    if (!hasPendingTests) {
      return tabStyles;
    }

    return {
      ...tabStyles,
      '::after': {
        background: '#D40002',
        content: '""',
        height: '10px',
        width: '10px',
        position: 'absolute',
        right: themeObj.spacing(1),
        top: themeObj.spacing(1),
        borderRadius: '5px',
      },
    };
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
        setOpenCheckInConfirmationModal(true);
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
          <Typography display='flex' sx={{ marginRight: '5px', alignItems: 'baseline' }}>
            <Typography sx={{ fontWeight: 600, marginRight: '5px', fontSize: '20px' }}>
              {accession.remainingQuantity.quantity}
            </Typography>
            <Typography fontSize='14px'>{strings.CT}</Typography>
          </Typography>
        );
      } else {
        return (
          <Typography display='flex' sx={{ marginRight: '5px', alignItems: 'baseline' }}>
            <Typography sx={{ fontWeight: 600, marginRight: '5px', fontSize: '20px' }}>
              {accession.remainingQuantity.grams}
            </Typography>
            <Typography fontSize='14px'>{strings.GRAMS}</Typography>
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
          <Typography fontSize='14px'>
            (~{accession.estimatedWeight?.grams} {strings.GRAMS})
          </Typography>
        );
      }
    } else {
      if (accession?.estimatedCount) {
        return (
          <Typography fontSize='14px'>
            (~{accession?.estimatedCount} {strings.CT})
          </Typography>
        );
      }
    }
    return '';
  };

  const renderWithdrawalButton = (fullSize?: boolean) => {
    if (accession?.remainingQuantity?.quantity) {
      return (
        <Button
          onClick={() => setOpenWithdrawModal(true)}
          label={strings.WITHDRAW}
          size='medium'
          className={fullSize ? classes.fullSizeButton : ''}
        />
      );
    }
    return null;
  };

  const iconProps = {
    position: 'absolute',
  };

  const readOnlyProps = {
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
    alignItems: isMobile ? 'flex-start' : 'center',
    justifyContent: isMobile ? 'space-between' : 'normal',
    width: isMobile ? '100%' : 'auto',
  };

  const editableProps = {
    ...readOnlyProps,
    cursor: 'pointer',
  };

  const editableParentProps = {
    display: 'flex',
    padding: themeObj.spacing(0, isMobile ? 0 : 2, isMobile ? 3 : 0, isMobile ? 0 : 2),
    alignItems: isMobile ? 'flex-start' : 'center',
    width: isMobile ? '100%' : 'auto',
  };

  const editableDynamicValuesProps = {
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    padding: isMobile ? themeObj.spacing(1, 0) : 4,
    width: isMobile ? '100%' : 'auto',
  };

  const spaceFiller = () => <Box sx={{ marginLeft: 1, height: '24px', width: 2 }} />;

  const quantityEditable = accession?.state === 'Drying' || accession?.state === 'In Storage';

  return (
    <TfMain>
      {accession && (
        <>
          {selectedTest && (
            <ViewViabilityTestModal
              open={openViewViabilityTestModal}
              accession={accession}
              viabilityTest={selectedTest}
              onClose={() => {
                setOpenViewViabilityTestModal(false);
                setSelectedTest(undefined);
              }}
              onEdit={() => setOpenNewViabilityTest(true)}
              reload={reloadData}
            />
          )}

          <NewViabilityTestModal
            open={openNewViabilityTest}
            reload={reloadData}
            accession={accession}
            onClose={() => {
              setOpenNewViabilityTest(false);
              setSelectedTest(undefined);
            }}
            organization={organization}
            user={user}
            viabilityTest={selectedTest}
          />

          <CheckedInConfirmationModal
            open={openCheckInConfirmationModal}
            onClose={() => setOpenCheckInConfirmationModal(false)}
            accession={accession}
          />
          {openEditLocationModal && (
            <EditLocationModal
              open={openEditLocationModal}
              onClose={() => setOpenEditLocationModal(false)}
              accession={accession}
              organization={organization}
              reload={reloadData}
            />
          )}
          {openEditStateModal && (
            <EditStateModal
              open={openEditStateModal}
              onClose={() => setOpenEditStateModal(false)}
              accession={accession}
              reload={reloadData}
              organization={organization}
            />
          )}
          {openEndDryingReminderModal && (
            <EndDryingReminderModal
              open={openEndDryingReminderModal}
              onClose={() => setOpenEndDryingReminderModal(false)}
              accession={accession}
              reload={reloadData}
            />
          )}
          {openDeleteAccession && (
            <DeleteAccessionModal
              open={openDeleteAccession}
              onClose={() => setOpenDeleteAccession(false)}
              accession={accession}
            />
          )}
          {openWithdrawModal && (
            <WithdrawModal
              open={openWithdrawModal}
              onClose={() => setOpenWithdrawModal(false)}
              accession={accession}
              reload={reloadData}
              organization={organization}
              user={user}
            />
          )}
          <QuantityModal
            open={openQuantityModal}
            onClose={() => setOpenQuantityModal(false)}
            accession={accession}
            organization={organization}
            reload={reloadData}
          />
          {openViabilityModal && (
            <ViabilityModal
              open={openViabilityModal}
              onClose={() => setOpenViabilityModal(false)}
              accession={accession}
              reload={reloadData}
              setNewViabilityTestOpened={setOpenNewViabilityTest}
              changeTab={handleChange}
            />
          )}
        </>
      )}
      <Box padding={isMobile ? themeObj.spacing(3, 0) : 3}>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography>{accession?.accessionNumber}</Typography>
          {!isMobile && (
            <Box display='flex' alignItems='center'>
              <IconButton sx={{ marginLeft: 3, height: '24px' }} onClick={() => setOpenDeleteAccession(true)}>
                <Icon name='iconTrashCan' />
              </IconButton>
              {accession && accession.state === 'Awaiting Check-In' ? (
                <Button onClick={() => checkInAccession()} label={strings.CHECK_IN} size='medium' />
              ) : (
                renderWithdrawalButton()
              )}
            </Box>
          )}
        </Box>
        <Typography color='#343A40' fontSize='24px' fontStyle='italic' fontWeight={500}>
          {accession?.speciesScientificName}
        </Typography>
        <Typography color='#708284'>{accession?.speciesCommonName}</Typography>
        <PageSnackbar />
      </Box>

      <Box
        display='flex'
        alignItems={isMobile ? 'flex-start' : 'center'}
        flexDirection={isMobile ? 'column' : 'row'}
        padding={(theme) => theme.spacing(0, isMobile ? 0 : 1)}
      >
        {accession?.state && (
          <Box sx={editableParentProps}>
            <Icon name='seedbankNav' className={classes.iconStyle} />
            <Box sx={editableProps} onClick={() => setOpenEditStateModal(true)}>
              <Typography
                paddingLeft={1}
                sx={{
                  ...getStylesForState(),
                  padding: themeObj.spacing(0.5, 1),
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginLeft: 1,
                  marginTop: isMobile ? -0.5 : 0,
                }}
              >
                {accession.state}
              </Typography>
              {accession.state !== 'Awaiting Check-In' ? (
                <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
                  <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
                </IconButton>
              ) : (
                spaceFiller()
              )}
            </Box>
          </Box>
        )}
        {accession?.bagNumbers !== undefined && (
          <Box display='flex' margin={isMobile ? themeObj.spacing(0, 0, 3, 6) : themeObj.spacing(0, 6, 0, 2)}>
            <Typography fontWeight={600}> {strings.BAG_ID}: </Typography>
            <Typography paddingLeft={1}> {accession.bagNumbers.join(', ')} </Typography>
          </Box>
        )}
        {accession?.facilityId !== undefined && (
          <Box sx={editableParentProps}>
            <Icon name='iconMyLocation' className={classes.iconStyle} />
            <Box sx={editableProps} onClick={() => setOpenEditLocationModal(true)}>
              <Typography paddingLeft={1} lineHeight={isMobile ? 1.2 : 1.5}>
                {getSeedBank(organization, accession.facilityId)?.name}
                {accession.storageLocation ? ` / ${accession.storageLocation}` : ''}
              </Typography>
              <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
                <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
          </Box>
        )}
        {accession?.state === 'Drying' && (
          <Box sx={editableParentProps}>
            <Icon name='notification' className={classes.iconStyle} />
            <Box sx={editableProps} onClick={() => setOpenEndDryingReminderModal(true)}>
              <Typography paddingLeft={1} lineHeight={isMobile ? 1.2 : 1.5}>
                {accession?.dryingEndDate
                  ? `${strings.END_DRYING_REMINDER} ${moment(accession.dryingEndDate).fromNow()}`
                  : strings.END_DRYING_REMINDER_OFF}
                {accession?.dryingEndDate ? (
                  <Typography
                    display={isMobile ? 'block' : 'inline-block'}
                    lineHeight={isMobile ? 1.2 : 1.5}
                    marginTop={isMobile ? 1 : 0}
                  >
                    {isMobile ? '' : ' '}({accession.dryingEndDate})
                  </Typography>
                ) : null}
              </Typography>
              <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
                <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} padding={isMobile ? themeObj.spacing(2, 0) : 0}>
        <Box sx={editableDynamicValuesProps}>
          <Typography minWidth={isMobile ? '100px' : 0} fontSize='14px' color='#708284'>
            {strings.QUANTITY}
          </Typography>
          {accession?.remainingQuantity?.quantity ? (
            <Box
              sx={quantityEditable ? editableProps : readOnlyProps}
              onClick={() => quantityEditable && setOpenQuantityModal(true)}
            >
              <Box display='flex' alignItems='baseline'>
                {getAbsoluteQuantity()} {getEstimatedQuantity()}
              </Box>
              {quantityEditable ? (
                <IconButton sx={{ marginLeft: 2, height: '24px', width: '24px' }}>
                  <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
                </IconButton>
              ) : (
                spaceFiller()
              )}
            </Box>
          ) : quantityEditable ? (
            <Link sx={linkStyle} onClick={() => setOpenQuantityModal(true)}>
              + {strings.ADD}
            </Link>
          ) : (
            <Typography color='#CAD2D3' sx={{ pointerEvents: 'none' }}>
              + {strings.ADD}
            </Typography>
          )}
        </Box>
        <Box sx={editableDynamicValuesProps}>
          <Typography minWidth={isMobile ? '100px' : 0} fontSize='14px' color='#708284'>
            {strings.AGE}
          </Typography>
          {accession?.collectedDate ? (
            <Box display='flex' alignItems='baseline'>
              <Typography fontSize='20px' fontWeight='600'>
                {age.value}
              </Typography>
              <Typography fontSize='14px' marginLeft={1}>
                {age.unit}
              </Typography>
            </Box>
          ) : null}
        </Box>
        <Box sx={editableDynamicValuesProps}>
          <Typography minWidth={isMobile ? '100px' : 0} fontSize='14px' color='#708284'>
            {strings.VIABILITY}
          </Typography>
          {accession?.viabilityPercent ? (
            <Box sx={editableProps} onClick={() => setOpenViabilityModal(true)}>
              <Box display='flex' fontSize='14px' alignItems='baseline'>
                <Typography fontWeight={500} fontSize='20px'>
                  {accession?.viabilityPercent}
                </Typography>
                %
              </Box>
              <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
                <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
              </IconButton>
            </Box>
          ) : (
            <Link sx={linkStyle} onClick={() => setOpenViabilityModal(true)}>
              + {strings.ADD}
            </Link>
          )}
        </Box>
      </Box>

      {isMobile && (
        <Box display='flex' alignItems='center' paddingRight={2} marginBottom={4} marginTop={2}>
          <IconButton sx={{ marginLeft: 3, height: '38px' }} onClick={() => setOpenDeleteAccession(true)}>
            <Icon name='iconTrashCan' />
          </IconButton>
          <Box paddingLeft={2} width='100%'>
            {accession && accession.state === 'Awaiting Check-In' ? (
              <Button
                onClick={() => checkInAccession()}
                label={strings.CHECK_IN}
                size='medium'
                className={classes.fullSizeButton}
              />
            ) : (
              renderWithdrawalButton(true)
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ width: '100%' }}>
        <TabContext value={selectedTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={(unused, value) => handleChange(value)}>
              <Tab label={strings.DETAIL} value='detail' sx={tabStyles} />
              <Tab label={strings.HISTORY} value='history' sx={tabStyles} />
              <Tab label={strings.VIABILITY_TESTING} value='viabilityTesting' sx={viabilityTestingStyle()} />
            </TabList>
          </Box>
          <TabPanel value='detail' sx={{ paddingX: isMobile ? 0 : 3 }}>
            <DetailPanel accession={accession} organization={organization} reload={reloadData} />
          </TabPanel>
          <TabPanel value='history' sx={{ paddingX: isMobile ? 0 : 3 }}>
            {accession && <Accession2History accession={accession} />}
          </TabPanel>
          <TabPanel value='viabilityTesting' sx={{ paddingX: isMobile ? 0 : 3 }}>
            {accession && (
              <ViabilityTestingPanel
                accession={accession}
                reload={reloadData}
                organization={organization}
                user={user}
                setNewViabilityTestOpened={setOpenNewViabilityTest}
                setViewViabilityTestModalOpened={setOpenViewViabilityTestModal}
                setSelectedTest={setSelectedTest}
              />
            )}
          </TabPanel>
        </TabContext>
      </Box>
    </TfMain>
  );
}
