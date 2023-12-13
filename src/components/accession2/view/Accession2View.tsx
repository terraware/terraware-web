import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useTheme, Box, Link as LinkMUI, Tab, Theme, Typography, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DropdownItem, Icon } from '@terraware/web-components';
import { useHistory, useParams } from 'react-router-dom';
import { Accession } from 'src/types/Accession';
import { AccessionService, FacilityService } from 'src/services';
import strings from 'src/strings';
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
import { ViabilityTest } from 'src/types/Accession';
import ViewViabilityTestModal from '../viabilityTesting/ViewViabilityTestModal';
import { getSeedBank, isContributor } from 'src/utils/organization';
import _ from 'lodash';
import PageHeaderWrapper from '../../common/PageHeaderWrapper';
import { APP_PATHS } from 'src/constants';
import OverviewItemCard from '../../common/OverviewItemCard';
import BackToLink from 'src/components/common/BackToLink';
import { useLocalization, useUser } from 'src/providers';
import { useOrganization } from 'src/providers/hooks';
import { stateName } from 'src/types/Accession';
import { getUnitName, isUnitInPreferredSystem } from 'src/units';
import ConvertedValue from 'src/components/ConvertedValue';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import OptionsMenu from 'src/components/common/OptionsMenu';
import isEnabled from 'src/features';

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
    marginLeft: 0,
    marginTop: theme.spacing(2),
  },
}));

const TABS = ['detail', 'history', 'viabilityTesting'];

export default function Accession2View(): JSX.Element {
  const { user } = useUser();
  const { selectedOrganization } = useOrganization();
  const { userPreferences } = useUser();
  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();
  const tab = (query.get('tab') || '').toLowerCase();
  const preselectedTab = TABS.indexOf(tab) === -1 ? 'detail' : tab;
  const { accessionId } = useParams<{ accessionId: string }>();
  const [selectedTab, setSelectedTab] = useState(preselectedTab);
  const [accession, setAccession] = useState<Accession>();
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
  const [age, setAge] = useState<string | null>(null);
  const [dryingRelativeDate, setDryingRelativeDate] = useState<string | null>(null);
  const snackbar = useSnackbar();
  const userCanEdit = !isContributor(selectedOrganization);
  const { isMobile, isTablet } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const themeObj = useTheme();
  const contentRef = useRef(null);
  const { activeLocale } = useLocalization();
  const locationTimeZone = useLocationTimeZone();
  const featureFlagProjects = isEnabled('Projects');

  const seedBankTimeZone = useMemo(() => {
    const facility = accession?.facilityId
      ? FacilityService.getFacility({
          organization: selectedOrganization,
          facilityId: accession.facilityId,
          type: 'Seed Bank',
        })
      : undefined;
    const tz = locationTimeZone.get(facility);
    return tz.id;
  }, [accession?.facilityId, selectedOrganization, locationTimeZone]);

  const reloadData = useCallback(() => {
    const populateAccession = async () => {
      const response = await AccessionService.getAccession(parseInt(accessionId, 10));
      if (response.requestSucceeded) {
        if (!_.isEqual(response.accession, accession)) {
          setAccession(response.accession);
          setHasPendingTests(
            response.accession?.viabilityTests?.some((test) => test.testType !== 'Cut' && !test.endDate) || false
          );
        }
      } else {
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
    if (activeLocale) {
      const today = DateTime.local().setZone(seedBankTimeZone);
      const seedCollectionDate = accession?.collectedDate
        ? DateTime.fromFormat(`${accession.collectedDate} ${seedBankTimeZone}`, 'yyyy-MM-dd z')
        : undefined;
      const accessionAgeDuration = seedCollectionDate ? today.diff(seedCollectionDate, 'months') : undefined;
      const accessionAge =
        accessionAgeDuration?.months !== undefined ? Math.trunc(accessionAgeDuration?.months) : undefined;
      if (accessionAge === undefined) {
        setAge(null);
      } else if (accessionAge < 1) {
        setAge(strings.AGE_VALUE_LESS_THAN_1_MONTH);
      } else if (accessionAge === 1) {
        setAge(strings.AGE_VALUE_1_MONTH);
      } else {
        setAge(strings.formatString(strings.AGE_VALUE_MONTHS, accessionAge) as string);
      }
    }
  }, [accession, activeLocale, seedBankTimeZone]);

  useEffect(() => {
    if (activeLocale) {
      if (accession?.dryingEndDate) {
        // luxon has no pseudo locales, use Korean for gibberish.
        const dateLocale = activeLocale === 'gx' ? 'ko' : activeLocale;
        const dryingDate = DateTime.fromFormat(
          `${accession.dryingEndDate} ${seedBankTimeZone}`,
          'yyyy-MM-dd z'
        ).setLocale(dateLocale);
        setDryingRelativeDate(dryingDate.toRelative());
      } else {
        setDryingRelativeDate(null);
      }
    }
  }, [accession, activeLocale, seedBankTimeZone]);

  useEffect(() => {
    setSelectedTab((query.get('tab') || 'detail') as string);
  }, [query]);

  const handleChange = (newValue: string) => {
    query.set('tab', newValue);
    history.push(getLocation(location.pathname, location, query.toString()));
  };

  const tabStyles = {
    fontSize: '14px',
    padding: themeObj.spacing(1, 2),
    minHeight: themeObj.spacing(4.5),
    textTransform: 'capitalize',
    '&.Mui-selected': {
      color: themeObj.palette.TwClrTxtBrand as string,
      fontWeight: 500,
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
        await AccessionService.checkInAccession(accession.id);
        reloadData();
        setOpenCheckInConfirmationModal(true);
      } catch (e) {
        // swallow error?
        snackbar.toastError();
      }
    }
  };

  const showValueAndConversion = (quantity: number, unit: string, isEstimated?: boolean) => {
    if (!isUnitInPreferredSystem(unit, userPreferences.preferredWeightSystem as string)) {
      return (
        <Box marginBottom={1}>
          {isEstimated && '~'} {quantity} {getUnitName(unit)}
          <ConvertedValue quantity={quantity} unit={unit} isEstimated={isEstimated} />
        </Box>
      );
    } else {
      return `${quantity} ${getUnitName(unit)}`;
    }
  };

  const getAbsoluteQuantity = () => {
    if (accession && accession.remainingQuantity) {
      if (accession.remainingQuantity.units === 'Seeds') {
        return `${accession.remainingQuantity.quantity} ${strings.CT}`;
      } else {
        return showValueAndConversion(accession.remainingQuantity.quantity, accession.remainingQuantity.units);
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
        return showValueAndConversion(accession.estimatedWeight.quantity, accession.estimatedWeight.units, true);
      }
    } else {
      if (accession?.estimatedCount) {
        return `~${accession?.estimatedCount} ${strings.CT}`;
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
          size='small'
          className={fullSize ? classes.fullSizeButton : ''}
        />
      );
    }
    return null;
  };

  const renderActionMenuButton = () => (
    <OptionsMenu
      size='small'
      onOptionItemClick={(item: DropdownItem) => {
        if (item.value === 'delete-accession') {
          setOpenDeleteAccession(true);
        }
      }}
      optionItems={[{ label: strings.DELETE, value: 'delete-accession', type: 'destructive' }]}
    />
  );

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
    4;

  const overviewGridSize = isMobile ? '100%' : isTablet ? '50%' : overviewItemCount <= 6 ? '33%' : '25%';

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

          {user && (
            <NewViabilityTestModal
              open={openNewViabilityTest}
              reload={reloadData}
              accession={accession}
              onClose={() => {
                setOpenNewViabilityTest(false);
                setSelectedTest(undefined);
              }}
              user={user}
              viabilityTest={selectedTest}
            />
          )}

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
              reload={reloadData}
            />
          )}
          {openEditStateModal && (
            <EditStateModal
              open={openEditStateModal}
              onClose={() => setOpenEditStateModal(false)}
              accession={accession}
              reload={reloadData}
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
          {user && openWithdrawModal && (
            <WithdrawModal
              open={openWithdrawModal}
              onClose={() => setOpenWithdrawModal(false)}
              accession={accession}
              reload={reloadData}
              user={user}
            />
          )}
          <QuantityModal
            open={openQuantityModal}
            onClose={() => setOpenQuantityModal(false)}
            accession={accession}
            reload={reloadData}
            title={accession?.remainingQuantity?.quantity !== undefined ? strings.EDIT_QUANTITY : strings.ADD_QUANTITY}
          />
          {openViabilityModal && (
            <ViabilityModal
              open={openViabilityModal}
              onClose={() => setOpenViabilityModal(false)}
              accession={accession}
              reload={reloadData}
              setNewViabilityTestOpened={setOpenNewViabilityTest}
              changeTab={handleChange}
              title={accession?.viabilityPercent?.toString() ? strings.EDIT_VIABILITY : strings.ADD_VIABILITY}
            />
          )}
        </>
      )}
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <>
          <Box>
            <BackToLink
              id='back'
              to={APP_PATHS.ACCESSIONS}
              className={classes.backToAccessions}
              name={strings.ACCESSIONS}
            />
          </Box>
          <Box padding={isMobile ? themeObj.spacing(3, 0, 4, 0) : themeObj.spacing(3, 3, 4, 3)}>
            <Typography color={themeObj.palette.TwClrTxt} fontSize='14px'>
              {accession?.accessionNumber}
            </Typography>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Typography color={themeObj.palette.TwClrTxt} fontSize='20px' fontStyle='italic' fontWeight={600}>
                {accession?.speciesScientificName}
              </Typography>
              {!isMobile && userCanEdit && (
                <Box display='flex' alignItems='center'>
                  {accession && isAwaitingCheckin ? (
                    <Button onClick={() => checkInAccession()} label={strings.CHECK_IN} size='small' />
                  ) : (
                    renderWithdrawalButton()
                  )}
                  {renderActionMenuButton()}
                </Box>
              )}
            </Box>
            <Typography color={themeObj.palette.TwClrTxt} fontSize='14px'>
              {accession?.speciesCommonName}
            </Typography>
            {isMobile && userCanEdit && (
              <Box display='flex' alignItems='center' paddingRight={2} marginTop={2}>
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
        marginBottom={themeObj.spacing(3)}
        alignItems={'stretch'}
      >
        {accession?.state && (
          <Grid item flexBasis={overviewGridSize} flexGrow={1}>
            <OverviewItemCard
              isEditable={!(isAwaitingCheckin || !userCanEdit)}
              handleEdit={() => setOpenEditStateModal(true)}
              title={strings.STATUS}
              contents={
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
                  {stateName(accession.state)}
                </Typography>
              }
            />
          </Grid>
        )}

        {accession?.facilityId !== undefined && (
          <Grid item flexBasis={overviewGridSize} flexGrow={1}>
            <OverviewItemCard
              isEditable={userCanEdit}
              handleEdit={() => setOpenEditLocationModal(true)}
              title={strings.LOCATION}
              contents={
                <Box>
                  {getSeedBank(selectedOrganization, accession.facilityId)?.name}
                  {accession.subLocation ? ` / ${accession.subLocation}` : ''}
                </Box>
              }
            />
          </Grid>
        )}

        {accession?.state === 'Drying' && (
          <Grid item flexBasis={overviewGridSize} flexGrow={1}>
            <OverviewItemCard
              isEditable={userCanEdit}
              handleEdit={() => setOpenEndDryingReminderModal(true)}
              title={strings.END_DRYING_REMINDER}
              contents={
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box>{dryingRelativeDate || strings.END_DRYING_REMINDER_OFF}</Box>
                  <Box>{accession?.dryingEndDate ? ` (${accession.dryingEndDate})` : null}</Box>
                </Box>
              }
            />
          </Grid>
        )}

        {featureFlagProjects && (
          <Grid item flexBasis={overviewGridSize} flexGrow={1}>
            <OverviewItemCard isEditable={false} title={strings.PROJECT} contents={'TODO projects dropdown'} />
          </Grid>
        )}

        {isAwaitingCheckin && accession?.bagNumbers !== undefined && (
          <Grid item flexBasis={overviewGridSize} flexGrow={1}>
            <OverviewItemCard isEditable={false} title={strings.BAG_ID} contents={accession.bagNumbers.join(', ')} />
          </Grid>
        )}

        <Grid item flexBasis={overviewGridSize} flexGrow={1}>
          <OverviewItemCard
            isEditable={quantityEditable}
            handleEdit={() => setOpenQuantityModal(true)}
            hideEditIcon={accession?.remainingQuantity?.quantity === undefined && !isMobile}
            title={strings.QUANTITY}
            titleInfoTooltip={!quantityEditable && strings.EDIT_QUANTITY_DISABLED}
            contents={
              accession?.remainingQuantity?.quantity !== undefined ? (
                <Box display='flex' flexDirection='column'>
                  <Box>{getAbsoluteQuantity()}</Box>
                  <Box>{getEstimatedQuantity()}</Box>
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
              )
            }
          />
        </Grid>

        <Grid item flexBasis={overviewGridSize} flexGrow={1}>
          <OverviewItemCard isEditable={false} title={strings.AGE} contents={age} />
        </Grid>

        <Grid item flexBasis={overviewGridSize} flexGrow={1}>
          <OverviewItemCard
            isEditable={viabilityEditable}
            handleEdit={() => setOpenViabilityModal(true)}
            hideEditIcon={!accession?.viabilityPercent?.toString()}
            title={strings.VIABILITY}
            contents={
              accession?.viabilityPercent?.toString() ? (
                `${accession?.viabilityPercent}%`
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
              )
            }
          />
        </Grid>
      </Grid>

      <Box sx={{ width: '100%' }}>
        <TabContext value={selectedTab}>
          <Box sx={tabHeaderProps}>
            <TabList
              sx={{ minHeight: themeObj.spacing(4.5) }}
              onChange={(unused, value) => handleChange(value)}
              TabIndicatorProps={{
                style: {
                  background: themeObj.palette.TwClrBgBrand,
                  height: '4px',
                  borderRadius: '4px 4px 0 0',
                },
              }}
            >
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
            <DetailPanel accession={accession} reload={reloadData} />
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
