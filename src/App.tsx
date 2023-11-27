/* eslint-disable import/no-webpack-loader-syntax */
import { CssBaseline, Slide, StyledEngineProvider, Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Navigate, Route, Routes } from 'react-router-dom';
import useStateLocation from './utils/useStateLocation';
import { DEFAULT_SEED_SEARCH_FILTERS, DEFAULT_SEED_SEARCH_SORT_ORDER } from 'src/services/SeedBankService';
import { SearchSortOrder, SearchCriteria } from 'src/types/Search';
import ContactUs from 'src/components/ContactUs';
import EditOrganization from 'src/components/EditOrganization';
import Home from 'src/components/Home';
import NoOrgLandingPage from 'src/components/emptyStatePages/NoOrgLandingPage';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import NavBar from 'src/components/NavBar';
import NewPerson from 'src/components/Person/NewPerson';
import Organization from 'src/components/Organization';
import People from 'src/components/People';
import PersonDetails from 'src/components/Person';
import SpeciesList from 'src/components/Species';
import CheckIn from 'src/components/seeds/checkin';
import Database from 'src/components/seeds/database';
import { defaultPreset as DefaultColumns } from 'src/components/seeds/database/columns';
import SeedSummary from 'src/components/seeds/summary';
import ToastSnackbar from 'src/components/ToastSnackbar';
import TopBar from 'src/components/TopBar/TopBar';
import TopBarContent from 'src/components/TopBar/TopBarContent';
import { APP_PATHS } from 'src/constants';
import ErrorBoundary from 'src/ErrorBoundary';
import { FacilityType } from 'src/types/Facility';
import { Species } from './types/Species';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { selectHasObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import MyAccount from './components/MyAccount';
import Monitoring from './components/Monitoring';
import SeedBanks from './components/SeedBanks';
import NewSeedBank from './components/NewSeedBank';
import SeedBankDetails from './components/SeedBank';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useEnvironment from 'src/utils/useEnvironment';
import { Accession2Create, Accession2View } from './components/accession2';
import OptInFeatures from './components/OptInFeatures';
import Nurseries from './components/Nurseries';
import NewNursery from './components/NewNursery';
import Inventory from './components/Inventory';
import InventoryV2 from './components/InventoryV2';
import NurseryDetails from './components/Nursery';
import InventoryCreate from './components/Inventory/InventoryCreate';
import InventoryView from './components/Inventory/InventoryView';
import InventoryViewV2 from './components/InventoryV2/InventoryView';
import InventoryViewForNursery from './components/InventoryV2/InventoryViewForNursery';
import InventoryBatch from './components/InventoryV2/InventoryBatch';
import {
  BatchBulkWithdrawWrapperComponent,
  SpeciesBulkWithdrawWrapperComponent,
} from './components/Inventory/withdraw';
import { NurseryWithdrawals, NurseryWithdrawalsDetails, NurseryReassignment } from './components/NurseryWithdrawals';
import { SpeciesService } from 'src/services';
import { PlantingSite } from 'src/types/Tracking';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import { defaultSelectedOrg } from 'src/providers/contexts';
import AppBootstrap from './AppBootstrap';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useAppVersion } from './hooks/useAppVersion';
import { ReportList, ReportView, ReportEdit } from './components/Reports';
import Observations from 'src/components/Observations';
import { getRgbaFromHex } from 'src/utils/color';
import PlantsDashboard from 'src/components/Plants';
import PlantingSites from 'src/components/PlantingSites';
import isEnabled from 'src/features';

interface StyleProps {
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.palette.TwClrBaseGray025,
    backgroundImage:
      'linear-gradient(180deg,' +
      `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
      `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`,
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    '& .navbar': {
      backgroundColor: (props: StyleProps) =>
        props.isDesktop ? theme.palette.TwClrBaseGray025 : theme.palette.TwClrBaseWhite,
      backgroundImage: (props: StyleProps) =>
        props.isDesktop
          ? 'linear-gradient(180deg,' +
            `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0)} 0%,` +
            `${getRgbaFromHex(theme.palette.TwClrBaseGreen050 as string, 0.4)} 100%)`
          : null,
      backgroundAttachment: 'fixed',
      paddingRight: (props: StyleProps) => (props.isDesktop ? '8px' : undefined),
      marginTop: (props: StyleProps) => (props.isDesktop ? '96px' : '0px'),
      paddingTop: (props: StyleProps) => (props.isDesktop ? '0px' : '24px'),
      overflowY: 'auto',
      width: (props: StyleProps) => (props.isDesktop ? '210px' : '300px'),
      zIndex: 1000,
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.TwClrBgGhostActive,
      },
      '& .nav-footer': {
        marginBottom: (props: StyleProps) => (props.isDesktop ? '128px' : '32px'),
      },
    },
  },
  content: {
    height: '100%',
    overflow: 'auto',
    '& > div, & > main': {
      paddingTop: '96px',
    },
  },
  contentWithNavBar: {
    '& > div, & > main': {
      paddingLeft: '220px',
    },
  },
  navBarOpened: {
    backdropFilter: 'blur(8px)',
    background: getRgbaFromHex(theme.palette.TwClrBgSecondary as string, 0.8),
    height: '100%',
    alignItems: 'center',
    position: 'fixed',
    zIndex: 1300,
    inset: '0px',
  },
}));

const MINIMAL_USER_ROUTES: string[] = [
  APP_PATHS.WELCOME,
  APP_PATHS.MY_ACCOUNT,
  APP_PATHS.MY_ACCOUNT_EDIT,
  APP_PATHS.OPT_IN,
];

const isPlaceholderOrg = (id: number) => id === defaultSelectedOrg.id;

function AppContent() {
  // manager hooks
  useAppVersion();

  const { isDesktop, type } = useDeviceInfo();
  const classes = useStyles({ isDesktop });
  const location = useStateLocation();
  const { organizations, selectedOrganization, reloadOrganizations, orgPreferences } = useOrganization();
  const [withdrawalCreated, setWithdrawalCreated] = useState<boolean>(false);
  const { isProduction } = useEnvironment();
  const { userPreferences, reloadUserPreferences: reloadPreferences } = useUser();
  const preferredWeightSystem = userPreferences.preferredWeightSystem as string;

  // seedSearchCriteria describes which criteria to apply when searching accession data.
  const [seedSearchCriteria, setSeedSearchCriteria] = useState<SearchCriteria>(DEFAULT_SEED_SEARCH_FILTERS);

  // seedSearchSort describes which sort criterion to apply when searching accession data.
  const [seedSearchSort, setSeedSearchSort] = useState<SearchSortOrder>(DEFAULT_SEED_SEARCH_SORT_ORDER);

  // seedSearchColumns describes which accession columns to request when searching accession data.
  const [seedSearchColumns, setSeedSearchColumns] = useState<string[]>(DefaultColumns(preferredWeightSystem).fields);

  /*
   * accessionsDisplayColumns describes which columns are displayed in the accessions list, and in which order.
   * Differs from seedSearchSelectedColumns because the order matters. Also, sometimes the two lists won't have
   * exactly the same columns. E.g. if the user adds the Withdrawal -> "Seeds Withdrawn" column,
   * then seedSearchSelectedColumns will contain withdrawalQuantity and withdrawalUnits but this list will only
   * contain withdrawalQuantity.
   */
  const [accessionsDisplayColumns, setAccessionsDisplayColumns] = useState<string[]>(
    DefaultColumns(preferredWeightSystem).fields
  );

  const navigate = useNavigate();
  const [species, setSpecies] = useState<Species[]>([]);
  const hasObservationsResults: boolean = useAppSelector(selectHasObservationsResults);
  const plantingSites: PlantingSite[] | undefined = useAppSelector(selectPlantingSites);
  const [plantingSubzoneNames, setPlantingSubzoneNames] = useState<Record<number, string>>({});
  const [showNavBar, setShowNavBar] = useState(true);
  const nurseryV2 = isEnabled('Nursery Updates');
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();

  const setDefaults = useCallback(() => {
    if (!isPlaceholderOrg(selectedOrganization.id)) {
      const savedColumns = orgPreferences.accessionsColumns ? (orgPreferences.accessionsColumns as string[]) : [];
      const defaultColumns = savedColumns.length ? savedColumns : DefaultColumns(preferredWeightSystem).fields;
      setAccessionsDisplayColumns(defaultColumns);
      setWithdrawalCreated(false);
    }
  }, [selectedOrganization.id, preferredWeightSystem, orgPreferences.accessionsColumns]);

  const reloadSpecies = useCallback(() => {
    const populateSpecies = async () => {
      if (!isPlaceholderOrg(selectedOrganization.id)) {
        const response = await SpeciesService.getAllSpecies(selectedOrganization.id);
        if (response.requestSucceeded && response.species) {
          setSpecies(response.species);
        }
      }
    };
    populateSpecies();
  }, [selectedOrganization]);

  const reloadTracking = useCallback(() => {
    const populatePlantingSites = () => {
      if (!isPlaceholderOrg(selectedOrganization.id)) {
        dispatch(requestPlantingSites(selectedOrganization.id, activeLocale || undefined));
      }
    };
    populatePlantingSites();
  }, [dispatch, selectedOrganization.id, activeLocale]);

  useEffect(() => {
    setDefaults();
  }, [setDefaults]);

  useEffect(() => {
    reloadSpecies();
  }, [reloadSpecies]);

  useEffect(() => {
    reloadTracking();
  }, [reloadTracking]);

  useEffect(() => {
    const subzones: Record<number, string> = {};
    for (const plantingSite of plantingSites ?? []) {
      for (const plantingZone of plantingSite.plantingZones ?? []) {
        for (const subzone of plantingZone.plantingSubzones ?? []) {
          subzones[subzone.id] = subzone.name;
        }
      }
    }

    setPlantingSubzoneNames(subzones);
  }, [plantingSites]);

  useEffect(() => {
    if (organizations?.length === 0 && MINIMAL_USER_ROUTES.indexOf(location.pathname) === -1) {
      navigate(APP_PATHS.WELCOME);
    }
  }, [organizations, location, navigate]);

  useEffect(() => {
    if (type === 'mobile' || type === 'tablet') {
      setShowNavBar(false);
    } else {
      setShowNavBar(true);
    }
  }, [type]);

  const selectedOrgHasSpecies = (): boolean => species.length > 0;

  const selectedOrgHasFacilityType = (facilityType: FacilityType): boolean => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrganization.facilities) {
      return selectedOrganization.facilities.some((facility: any) => {
        return facility.type === facilityType;
      });
    } else {
      return false;
    }
  };

  const selectedOrgHasSeedBanks = (): boolean => selectedOrgHasFacilityType('Seed Bank');

  const selectedOrgHasNurseries = (): boolean => selectedOrgHasFacilityType('Nursery');

  const selectedOrgHasPlantingSites = (): boolean => plantingSites !== undefined && plantingSites.length > 0;

  const getSeedBanksView = (): JSX.Element => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrgHasSeedBanks()) {
      return <SeedBanks organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'SeedBanks'} />;
  };

  const getNurseriesView = (): JSX.Element => {
    if (!isPlaceholderOrg(selectedOrganization.id) && selectedOrgHasNurseries()) {
      return <Nurseries organization={selectedOrganization} />;
    }
    return <EmptyStatePage pageName={'Nurseries'} />;
  };

  const viewHasBackgroundImage = (): boolean => {
    if (
      location.pathname.startsWith(APP_PATHS.HOME) ||
      (location.pathname.startsWith(APP_PATHS.SPECIES) && !selectedOrgHasSpecies()) ||
      (location.pathname.startsWith(APP_PATHS.ACCESSIONS) &&
        (!selectedOrgHasSeedBanks() || !selectedOrgHasSpecies())) ||
      (location.pathname.startsWith(APP_PATHS.MONITORING) && !selectedOrgHasSeedBanks()) ||
      (location.pathname.startsWith(APP_PATHS.INVENTORY) && (!selectedOrgHasNurseries() || !selectedOrgHasSpecies())) ||
      (location.pathname.startsWith(APP_PATHS.SEED_BANKS) && !selectedOrgHasSeedBanks()) ||
      (location.pathname.startsWith(APP_PATHS.NURSERIES) && !selectedOrgHasNurseries()) ||
      (location.pathname.startsWith(APP_PATHS.OBSERVATIONS) && !hasObservationsResults) ||
      (location.pathname.startsWith(APP_PATHS.PLANTING_SITES) && !selectedOrgHasPlantingSites())
    ) {
      return true;
    }

    return false;
  };

  const getOrphanedUserContent = () => {
    return (
      <>
        <Routes>
          <Route
            path={APP_PATHS.MY_ACCOUNT_EDIT}
            element={<MyAccount organizations={organizations} edit={true} reloadData={reloadOrganizations} />}
          />
          <Route path={APP_PATHS.MY_ACCOUNT} element={<MyAccount organizations={organizations} edit={false} />} />
          <Route path={APP_PATHS.WELCOME} element={<NoOrgLandingPage />} />
          {!isProduction && <Route path={APP_PATHS.OPT_IN} element={<OptInFeatures refresh={reloadPreferences} />} />}
          <Route path='*' element={<Navigate to={APP_PATHS.WELCOME} />} />
        </Routes>
      </>
    );
  };

  const getContent = () => (
    <>
      {type !== 'desktop' ? (
        <Slide direction='right' in={showNavBar} mountOnEnter unmountOnExit>
          <div className={classes.navBarOpened}>
            <NavBar
              setShowNavBar={setShowNavBar}
              withdrawalCreated={withdrawalCreated}
              hasPlantingSites={selectedOrgHasPlantingSites()}
            />
          </div>
        </Slide>
      ) : (
        <NavBar
          setShowNavBar={setShowNavBar}
          backgroundTransparent={viewHasBackgroundImage()}
          withdrawalCreated={withdrawalCreated}
          hasPlantingSites={selectedOrgHasPlantingSites()}
        />
      )}
      <div
        className={`${type === 'desktop' && showNavBar ? classes.contentWithNavBar : ''} ${
          classes.content
        } scrollable-content`}
      >
        <ErrorBoundary setShowNavBar={setShowNavBar}>
          <Routes>
            {/* Routes, in order of their appearance down the side NavBar */}
            <Route path={APP_PATHS.HOME} element={<Home />} />

            <Route path={APP_PATHS.SEEDS_DASHBOARD} element={<SeedSummary />} />

            <Route path={APP_PATHS.CHECKIN} element={<CheckIn />} />

            <Route
              path={APP_PATHS.ACCESSIONS}
              element={
                <Database
                  searchCriteria={seedSearchCriteria}
                  setSearchCriteria={setSeedSearchCriteria}
                  searchSortOrder={seedSearchSort}
                  setSearchSortOrder={setSeedSearchSort}
                  searchColumns={seedSearchColumns}
                  setSearchColumns={setSeedSearchColumns}
                  displayColumnNames={accessionsDisplayColumns}
                  setDisplayColumnNames={setAccessionsDisplayColumns}
                  hasSeedBanks={selectedOrgHasSeedBanks()}
                  hasSpecies={selectedOrgHasSpecies()}
                  reloadData={reloadOrganizations}
                />
              }
            />

            <Route path={APP_PATHS.ACCESSIONS2_NEW} element={<Accession2Create />} />

            <Route path={APP_PATHS.ACCESSIONS2_ITEM} element={<Accession2View />} />

            <Route
              path={APP_PATHS.MONITORING}
              element={<Monitoring hasSeedBanks={selectedOrgHasSeedBanks()} reloadData={reloadOrganizations} />}
            />

            <Route
              path={APP_PATHS.SEED_BANK_MONITORING}
              element={<Monitoring hasSeedBanks={selectedOrgHasSeedBanks()} reloadData={reloadOrganizations} />}
            />

            <Route
              path={APP_PATHS.SPECIES}
              element={
                selectedOrgHasSpecies() ? (
                  <SpeciesList reloadData={reloadSpecies} species={species} />
                ) : (
                  <EmptyStatePage pageName={'Species'} reloadData={reloadSpecies} />
                )
              }
            />

            <Route
              path={APP_PATHS.ORGANIZATION_EDIT}
              element={
                <EditOrganization organization={selectedOrganization} reloadOrganizationData={reloadOrganizations} />
              }
            />

            <Route path={APP_PATHS.ORGANIZATION} element={<Organization />} />

            <Route path={APP_PATHS.PEOPLE_NEW} element={<NewPerson />} />

            <Route path={APP_PATHS.PEOPLE_EDIT} element={<NewPerson />} />

            <Route path={APP_PATHS.PEOPLE_VIEW} element={<PersonDetails />} />

            <Route path={APP_PATHS.PEOPLE} element={<People />} />

            <Route path={APP_PATHS.SEED_BANKS_NEW} element={<NewSeedBank />} />

            <Route path={APP_PATHS.SEED_BANKS_EDIT} element={<NewSeedBank />} />

            <Route path={APP_PATHS.SEED_BANKS_VIEW} element={<SeedBankDetails />} />

            <Route path={APP_PATHS.SEED_BANKS} element={getSeedBanksView()} />
            <Route path={APP_PATHS.NURSERIES_NEW} element={<NewNursery />} />

            <Route path={APP_PATHS.NURSERIES_EDIT} element={<NewNursery />} />

            <Route path={APP_PATHS.PLANTS_DASHBOARD} element={<PlantsDashboard />} />

            <Route path={APP_PATHS.PLANTING_SITE_DASHBOARD} element={<PlantsDashboard />} />

            <Route path={APP_PATHS.NURSERIES_VIEW} element={<NurseryDetails />} />

            <Route path={APP_PATHS.NURSERIES} element={getNurseriesView()} />
            <Route
              path={APP_PATHS.INVENTORY}
              element={
                nurseryV2 ? (
                  <InventoryV2 hasNurseries={selectedOrgHasNurseries()} hasSpecies={selectedOrgHasSpecies()} />
                ) : (
                  <Inventory hasNurseries={selectedOrgHasNurseries()} hasSpecies={selectedOrgHasSpecies()} />
                )
              }
            />

            <Route path={APP_PATHS.INVENTORY_NEW} element={<InventoryCreate />} />

            <Route
              path={APP_PATHS.INVENTORY_WITHDRAW}
              element={
                <SpeciesBulkWithdrawWrapperComponent withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />
              }
            />

            {nurseryV2 && (
              <Route
                path={APP_PATHS.INVENTORY_BATCH}
                element={<InventoryBatch origin='Inventory' species={species} />}
              />
            )}
            {nurseryV2 && (
              <Route
                path={APP_PATHS.INVENTORY_BATCH_FOR_NURSERY}
                element={<InventoryBatch origin='Nursery' species={species} />}
              />
            )}
            {nurseryV2 && (
              <Route
                path={APP_PATHS.INVENTORY_BATCH_FOR_SPECIES}
                element={<InventoryBatch origin='Species' species={species} />}
              />
            )}
            {nurseryV2 && <Route path={APP_PATHS.INVENTORY_ITEM_FOR_NURSERY} element={<InventoryViewForNursery />} />}
            <Route
              path={APP_PATHS.INVENTORY_ITEM_FOR_SPECIES}
              element={nurseryV2 ? <InventoryViewV2 species={species} /> : <InventoryView species={species} />}
            />

            <Route
              path={APP_PATHS.BATCH_WITHDRAW}
              element={
                <BatchBulkWithdrawWrapperComponent withdrawalCreatedCallback={() => setWithdrawalCreated(true)} />
              }
            />

            <Route path={APP_PATHS.PLANTING_SITES} element={<PlantingSites reloadTracking={reloadTracking} />} />

            <Route
              path={APP_PATHS.NURSERY_WITHDRAWALS}
              element={<NurseryWithdrawals reloadTracking={reloadTracking} />}
            />

            <Route
              path={APP_PATHS.NURSERY_WITHDRAWALS_DETAILS}
              element={<NurseryWithdrawalsDetails species={species} plantingSubzoneNames={plantingSubzoneNames} />}
            />

            <Route path={APP_PATHS.NURSERY_REASSIGNMENT} element={<NurseryReassignment />} />

            <Route path={APP_PATHS.CONTACT_US} element={<ContactUs />} />

            <Route
              path={APP_PATHS.MY_ACCOUNT_EDIT}
              element={<MyAccount organizations={organizations} edit={true} reloadData={reloadOrganizations} />}
            />

            <Route path={APP_PATHS.MY_ACCOUNT} element={<MyAccount organizations={organizations} edit={false} />} />

            {selectedOrganization.canSubmitReports && <Route path={APP_PATHS.REPORTS} element={<ReportList />} />}
            {selectedOrganization.canSubmitReports && <Route path={APP_PATHS.REPORTS_EDIT} element={<ReportEdit />} />}
            {selectedOrganization.canSubmitReports && <Route path={APP_PATHS.REPORTS_VIEW} element={<ReportView />} />}

            <Route path={APP_PATHS.OBSERVATIONS} element={<Observations />} />

            {!isProduction && <Route path={APP_PATHS.OPT_IN} element={<OptInFeatures refresh={reloadPreferences} />} />}

            {/* Redirects. Invalid paths will redirect to the closest valid path. */}
            {/* In alphabetical order for easy reference with APP_PATHS, except for /home which must go last */}
            <Route path={APP_PATHS.ACCESSIONS + '/'} element={<Navigate to={APP_PATHS.ACCESSIONS} />} />

            <Route path={APP_PATHS.CHECKIN + '/'} element={<Navigate to={APP_PATHS.CHECKIN} />} />

            <Route path={APP_PATHS.CONTACT_US + '/'} element={<Navigate to={APP_PATHS.CONTACT_US} />} />

            <Route path={APP_PATHS.ORGANIZATION + '/'} element={<Navigate to={APP_PATHS.ORGANIZATION} />} />

            <Route path={APP_PATHS.PEOPLE + '/'} element={<Navigate to={APP_PATHS.PEOPLE} />} />

            <Route path={APP_PATHS.SEEDS_DASHBOARD + '/'} element={<Navigate to={APP_PATHS.SEEDS_DASHBOARD} />} />

            <Route path={APP_PATHS.SPECIES + '/'} element={<Navigate to={APP_PATHS.SPECIES} />} />

            <Route path='*' element={<Navigate to={APP_PATHS.HOME} />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );

  // Localized strings are stored outside of React's state, but there's a state change when they're
  // updated. Declare the dependency here so the app rerenders when the locale changes.
  useLocalization();

  return (
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <ToastSnackbar />
      <TopBar>
        <TopBarContent setShowNavBar={setShowNavBar} />
      </TopBar>
      <div className={classes.container}>{organizations.length === 0 ? getOrphanedUserContent() : getContent()}</div>
    </StyledEngineProvider>
  );
}

export default function App(): JSX.Element {
  return (
    <Provider store={store}>
      <AppBootstrap>
        <AppContent />
      </AppBootstrap>
    </Provider>
  );
}
