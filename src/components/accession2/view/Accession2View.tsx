import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  useTheme,
  Box,
  IconButton,
  Link as LinkMUI,
  Menu,
  Tab,
  Theme,
  Typography,
  Grid,
  MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Icon } from '@terraware/web-components';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
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
import { getSeedBank, isContributor } from 'src/utils/organization';
import _ from 'lodash';
import PageHeaderWrapper from '../../common/PageHeaderWrapper';
import { APP_PATHS } from 'src/constants';

interface StyleProps {
  isMobile?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  iconStyle: {
    fill: theme.palette.TwClrIcn,
  },
  editIcon: {
    display: 'none',
    fill: theme.palette.TwClrIcn,
  },
  fullSizeButton: {
    width: '100%',
  },
  actionMenuButton: {
    marginLeft: theme.spacing(1),
  },
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: theme.spacing(1),
  },
  addIconEnabled: {
    fill: theme.palette.TwClrIcnBrand,
    height: '20px',
    width: '20px',
  },
  addIconDisabled: {
    fill: theme.palette.TwClrBaseGray300,
    height: '20px',
    width: '20px',
  },
  backToAccessions: {
    fontSize: '20px',
    display: 'flex',
    textDecoration: 'none',
    color: theme.palette.TwClrTxtBrand,
    alignItems: 'center',
    marginLeft: (props: StyleProps) => (props.isMobile ? 0 : theme.spacing(3)),
    marginTop: theme.spacing(2),
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
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openActionMenu = Boolean(actionMenuAnchorEl);
  const [selectedTest, setSelectedTest] = useState<ViabilityTest>();
  const [age, setAge] = useState({ value: '', unit: '' });
  const { organization, user } = props;
  const userCanEdit = !isContributor(organization);
  const { isMobile, isTablet } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const snackbar = useSnackbar();
  const themeObj = useTheme();
  const contentRef = useRef(null);

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
      color: themeObj.palette.TwClrTxt as string,
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
        background: themeObj.palette.TwClrIcnDanger as string,
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
    color: themeObj.palette.TwClrTxtBrand,
    fontWeight: 500,
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
          <Typography sx={overviewItemContentProps}>
            {accession.remainingQuantity.quantity} {strings.CT}
          </Typography>
        );
      } else {
        return (
          <Typography sx={overviewItemContentProps}>
            {accession.remainingQuantity.grams} {strings.GRAMS}
          </Typography>
        );
      }
    }
  };

  const getStylesForState = () => {
    switch (accession?.state) {
      case 'Awaiting Check-In':
        return {
          background: themeObj.palette.TwClrBasePink050,
          border: `1px solid ${themeObj.palette.TwClrBasePink200}`,
          color: themeObj.palette.TwClrBasePink500,
        };

      case 'Awaiting Processing':
        return {
          background: themeObj.palette.TwClrBaseRed050,
          border: `1px solid ${themeObj.palette.TwClrBaseRed200}`,
          color: themeObj.palette.TwClrTxtDanger,
        };
      case 'Processing':
        return {
          background: themeObj.palette.TwClrBaseOrange050,
          border: `1px solid ${themeObj.palette.TwClrBaseOrange200}`,
          color: themeObj.palette.TwClrBaseOrange500,
        };
      case 'Drying':
        return {
          background: themeObj.palette.TwClrBaseYellow050,
          border: `1px solid ${themeObj.palette.TwClrBaseOrange200}`,
          color: themeObj.palette.TwClrBaseYellow500,
        };
      case 'In Storage': {
        return {
          background: themeObj.palette.TwClrBaseGreen050,
          border: `1px solid ${themeObj.palette.TwClrBaseGreen200}`,
          color: themeObj.palette.TwClrTxtSuccess,
        };
      }
      default: {
        return {
          background: themeObj.palette.TwClrBgSecondary,
          border: `1px solid ${themeObj.palette.TwClrBaseGray200}`,
          color: themeObj.palette.TwClrTxtSecondary,
        };
      }
    }
  };

  const getEstimatedQuantity = () => {
    if (accession?.remainingQuantity?.units === 'Seeds') {
      if (accession.estimatedWeight?.grams) {
        return (
          <Typography sx={overviewItemContentProps}>
            (~{accession.estimatedWeight?.grams} {strings.GRAMS})
          </Typography>
        );
      }
    } else {
      if (accession?.estimatedCount) {
        return (
          <Typography sx={overviewItemContentProps}>
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

  const renderActionMenuButton = () => {
    return (
      <>
        <Button
          className={classes.actionMenuButton}
          onClick={(ev) => ev && setActionMenuAnchorEl(ev.currentTarget)}
          icon='menuVertical'
          priority='secondary'
        />
        <Menu anchorEl={actionMenuAnchorEl} open={openActionMenu} onClose={() => setActionMenuAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              setActionMenuAnchorEl(null);
              setOpenDeleteAccession(true);
            }}
          >
            Delete
          </MenuItem>
        </Menu>
      </>
    );
  };

  const iconProps = {
    position: 'absolute',
  };

  const readOnlyProps = {
    display: 'flex',
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
    width: '100%',
  };

  const editableProps = {
    ...readOnlyProps,
    cursor: 'pointer',
  };

  const overviewItemProps = {
    backgroundColor: `${themeObj.palette.TwClrBg}`,
    display: 'flex',
    flexDirection: 'column',
    padding: themeObj.spacing(3),
    borderRadius: '16px',
    height: '100%',
  };

  const overviewItemLabelProps = {
    color: themeObj.palette.TwClrTxtSecondary,
    fontSize: '14px',
    fontWeight: 400,
    marginBottom: themeObj.spacing(1),
  };

  const overviewItemContentProps = {
    color: themeObj.palette.TwClrTxt,
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
  };

  const tabHeaderProps = {
    borderBottom: 1,
    borderColor: 'divider',
    margin: isMobile ? 0 : themeObj.spacing(0, 4),
  };

  const tabPanelProps = {
    borderRadius: isMobile ? '0 0 16px 16px' : '32px',
    backgroundColor: themeObj.palette.TwClrBg,
  };

  const overviewItemCount =
    (accession?.state ? 1 : 0) +
    (accession?.state === 'Awaiting Check-In' && accession?.bagNumbers !== undefined ? 1 : 0) +
    (accession?.facilityId !== undefined ? 1 : 0) +
    (accession?.state === 'Drying' ? 1 : 0) +
    3;

  const getOverviewGridSize = (row: number) => {
    if (isMobile) {
      return 12;
    } else if (isTablet) {
      if (overviewItemCount < 6 && row === 2) {
        return 6;
      }
      return 4;
    }
    return 1;
  };

  const spaceFiller = () => <Box sx={{ marginLeft: 1, height: '24px', width: 2 }} />;

  const quantityEditable = userCanEdit && (accession?.state === 'Drying' || accession?.state === 'In Storage');
  const viabilityEditable = userCanEdit && accession?.state !== 'Used Up';
  const isAwaitingCheckin = accession?.state === 'Awaiting Check-In';

  return (
    <TfMain>
      {accession && (
        <>
          {selectedTest && (
            <ViewViabilityTestModal
              open={openViewViabilityTestModal}
              accession={accession}
              isEditable={userCanEdit}
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
      <PageHeaderWrapper nextElement={contentRef.current}>
        <>
          <Box>
            <Link id='back' to={APP_PATHS.ACCESSIONS} className={classes.backToAccessions}>
              <Icon name='caretLeft' className={classes.backIcon} />
              {strings.ACCESSIONS}
            </Link>
          </Box>
          <Box padding={isMobile ? themeObj.spacing(3, 0) : 3}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography>{accession?.accessionNumber}</Typography>
              {!isMobile && userCanEdit && (
                <Box display='flex' alignItems='center'>
                  {accession && isAwaitingCheckin ? (
                    <Button onClick={() => checkInAccession()} label={strings.CHECK_IN} size='medium' />
                  ) : (
                    renderWithdrawalButton()
                  )}
                  {renderActionMenuButton()}
                </Box>
              )}
            </Box>
            <Typography color={themeObj.palette.TwClrTxt} fontSize='24px' fontStyle='italic' fontWeight={500}>
              {accession?.speciesScientificName}
            </Typography>
            <Typography color={themeObj.palette.TwClrTxtSecondary}>{accession?.speciesCommonName}</Typography>
            {isMobile && userCanEdit && (
              <Box display='flex' alignItems='center' paddingRight={2} marginBottom={4} marginTop={2}>
                <Box paddingLeft={2} width='100%'>
                  {accession && isAwaitingCheckin ? (
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
                {renderActionMenuButton()}
              </Box>
            )}
            <PageSnackbar />
          </Box>
        </>
      </PageHeaderWrapper>

      <Grid
        container
        ref={contentRef}
        spacing={themeObj.spacing(3)}
        columns={!isMobile && !isTablet ? overviewItemCount : 12}
      >
        {accession?.state && (
          <Grid item xs={getOverviewGridSize(1)}>
            <Box sx={overviewItemProps}>
              <Typography sx={overviewItemLabelProps}>{strings.STATUS}</Typography>
              <Box
                sx={isAwaitingCheckin || !userCanEdit ? readOnlyProps : editableProps}
                onClick={() => !isAwaitingCheckin && userCanEdit && setOpenEditStateModal(true)}
              >
                <Typography
                  paddingLeft={1}
                  sx={{
                    ...getStylesForState(),
                    padding: themeObj.spacing(0.5, 1),
                    borderRadius: '8px',
                    fontSize: '14px',
                    marginTop: isMobile ? -0.5 : 0,
                  }}
                >
                  {accession.state}
                </Typography>
                {!isAwaitingCheckin && userCanEdit ? (
                  <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
                    <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
                  </IconButton>
                ) : (
                  spaceFiller()
                )}
              </Box>
            </Box>
          </Grid>
        )}
        {isAwaitingCheckin && accession?.bagNumbers !== undefined && (
          <Grid item xs={getOverviewGridSize(1)}>
            <Box sx={overviewItemProps}>
              <Typography sx={overviewItemLabelProps}> {strings.BAG_ID}: </Typography>
              <Typography sx={overviewItemContentProps}> {accession.bagNumbers.join(', ')} </Typography>
            </Box>
          </Grid>
        )}
        {accession?.facilityId !== undefined && (
          <Grid item xs={getOverviewGridSize(1)}>
            <Box sx={overviewItemProps}>
              <Typography sx={overviewItemLabelProps}>{strings.LOCATION}</Typography>
              <Box
                sx={userCanEdit ? editableProps : readOnlyProps}
                onClick={() => userCanEdit && setOpenEditLocationModal(true)}
              >
                <Typography sx={overviewItemContentProps}>
                  {getSeedBank(organization, accession.facilityId)?.name}
                  {accession.storageLocation ? ` / ${accession.storageLocation}` : ''}
                </Typography>
                {userCanEdit ? (
                  <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
                    <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
                  </IconButton>
                ) : (
                  spaceFiller()
                )}
              </Box>
            </Box>
          </Grid>
        )}
        {accession?.state === 'Drying' && (
          <Grid item xs={getOverviewGridSize(1)}>
            <Box sx={overviewItemProps}>
              <Typography sx={overviewItemLabelProps}>{strings.END_DRYING_REMINDER}</Typography>
              <Box
                sx={userCanEdit ? editableProps : readOnlyProps}
                onClick={() => userCanEdit && setOpenEndDryingReminderModal(true)}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={overviewItemContentProps}>
                    {accession?.dryingEndDate
                      ? `${moment(accession.dryingEndDate).fromNow()}`
                      : strings.END_DRYING_REMINDER_OFF}
                  </Typography>
                  <Typography sx={overviewItemContentProps}>
                    {accession?.dryingEndDate ? ` (${accession.dryingEndDate})` : null}
                  </Typography>
                </Box>
                {userCanEdit ? (
                  <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
                    <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
                  </IconButton>
                ) : (
                  spaceFiller()
                )}
              </Box>
            </Box>
          </Grid>
        )}
        <Grid item xs={getOverviewGridSize(1)}>
          <Box sx={overviewItemProps}>
            <Typography sx={overviewItemLabelProps}>{strings.QUANTITY}</Typography>
            {accession?.remainingQuantity?.quantity !== undefined ? (
              <Box
                sx={quantityEditable ? editableProps : readOnlyProps}
                onClick={() => quantityEditable && setOpenQuantityModal(true)}
              >
                <Box display='flex' flexDirection='column'>
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
              <LinkMUI sx={{ ...linkStyle, fontSize: '14px' }} onClick={() => setOpenQuantityModal(true)}>
                <Box display='flex' alignItems='center'>
                  <Icon name='iconAdd' className={classes.addIconEnabled} />
                  &nbsp;{strings.ADD}
                </Box>
              </LinkMUI>
            ) : (
              <Typography color={themeObj.palette.TwClrTxtTertiary} sx={{ pointerEvents: 'none', fontSize: '14px' }}>
                <Box display='flex' alignItems='center'>
                  <Icon name='iconAdd' className={classes.addIconDisabled} />
                  &nbsp;{strings.ADD}
                </Box>
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={getOverviewGridSize(2)}>
          <Box sx={overviewItemProps}>
            <Typography sx={overviewItemLabelProps}>{strings.AGE}</Typography>
            {accession?.collectedDate ? (
              <Typography sx={overviewItemContentProps}>
                {age.value} {age.unit}
              </Typography>
            ) : null}
          </Box>
        </Grid>
        <Grid item xs={getOverviewGridSize(2)}>
          <Box sx={overviewItemProps}>
            <Typography sx={overviewItemLabelProps}>{strings.VIABILITY}</Typography>
            {accession?.viabilityPercent ? (
              <Box
                sx={viabilityEditable ? editableProps : readOnlyProps}
                onClick={() => viabilityEditable && setOpenViabilityModal(true)}
              >
                <Typography sx={overviewItemContentProps}>{accession?.viabilityPercent}%</Typography>
                {viabilityEditable ? (
                  <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
                    <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
                  </IconButton>
                ) : (
                  spaceFiller()
                )}
              </Box>
            ) : viabilityEditable ? (
              <LinkMUI sx={{ ...linkStyle, fontSize: '14px' }} onClick={() => setOpenViabilityModal(true)}>
                <Box display='flex' alignItems='center'>
                  <Icon name='iconAdd' className={classes.addIconEnabled} />
                  &nbsp;{strings.ADD}
                </Box>
              </LinkMUI>
            ) : (
              <Typography color={themeObj.palette.TwClrTxtTertiary} sx={{ pointerEvents: 'none', fontSize: '14px' }}>
                <Box display='flex' alignItems='center'>
                  <Icon name='iconAdd' className={classes.addIconDisabled} />
                  &nbsp;{strings.ADD}
                </Box>
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ width: '100%' }}>
        <TabContext value={selectedTab}>
          <Box sx={tabHeaderProps}>
            <TabList onChange={(unused, value) => handleChange(value)}>
              <Tab
                label={isMobile || isTablet ? strings.DETAILS : strings.ACCESSION_DETAILS}
                value='detail'
                sx={tabStyles}
              />
              <Tab label={strings.HISTORY} value='history' sx={tabStyles} />
              <Tab label={strings.VIABILITY_TESTS} value='viabilityTesting' sx={viabilityTestingStyle()} />
            </TabList>
          </Box>
          <TabPanel value='detail' sx={tabPanelProps}>
            <DetailPanel accession={accession} organization={organization} reload={reloadData} />
          </TabPanel>
          <TabPanel value='history' sx={tabPanelProps}>
            {accession && <Accession2History accession={accession} />}
          </TabPanel>
          <TabPanel value='viabilityTesting' sx={tabPanelProps}>
            {accession && (
              <ViabilityTestingPanel
                accession={accession}
                reload={reloadData}
                canAddTest={userCanEdit}
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
