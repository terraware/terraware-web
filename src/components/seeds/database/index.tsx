import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, CircularProgress, Container, Grid, useTheme } from '@mui/material';
import { DropdownItem, Message, Tabs } from '@terraware/web-components';

import PageHeader from 'src/components/PageHeader';
import EmptyMessage from 'src/components/common/EmptyMessage';
import { downloadCsvTemplateHandler } from 'src/components/common/ImportModal';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useProjects } from 'src/hooks/useProjects';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization, useUser } from 'src/providers/hooks';
import { useLazyGetAccessionsListUploadTemplateQuery } from 'src/queries/generated/accessionsV2';
import { useLazyGetPendingAccessionsQuery, useLazySearchAccessionsQuery } from 'src/queries/search/accessions';
import SelectSeedBankModal from 'src/scenes/SeedBanksRouter/SelectSeedBankModal';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { SearchResponseElementWithId } from 'src/types/Search';
import { isAdmin } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStickyTabs from 'src/utils/useStickyTabs';

import AccessionsBySpeciesTable from './AccessionsBySpeciesTable';
import AccessionsTable from './AccessionsTable';
import ImportAccessionsModal from './ImportAccessionsModal';

const PREF_DISMISSED_CHECKIN_IDS = 'dismissedCheckInAccessionIds';

const ALL_ACCESSION_FIELDS = [
  'id',
  'accessionNumber',
  'state',
  'facility_name',
  'subLocation_name',
  'speciesName',
  'species_id',
  'project_name',
  'species_commonName',
  'species_familyName',
  'collectedTime',
  'receivedDate',
  'collectionSiteName',
  'collectionSiteLandowner',
  'collectionSiteNotes',
  'ageMonths(raw)',
  'ageYears(raw)',
  'totalWithdrawnCount(raw)',
  'totalWithdrawnWeightMilligrams(raw)',
  'totalWithdrawnWeightGrams(raw)',
  'totalWithdrawnWeightKilograms(raw)',
  'totalWithdrawnWeightOunces(raw)',
  'totalWithdrawnWeightPounds(raw)',
  'totalViabilityPercent(raw)',
  'estimatedWeightMilligrams(raw)',
  'estimatedWeightGrams(raw)',
  'estimatedWeightKilograms(raw)',
  'estimatedWeightOunces(raw)',
  'estimatedWeightPounds(raw)',
  'estimatedCount(raw)',
  'geolocations.coordinates',
  'plantId',
];

type DatabaseProps = {
  hasSeedBanks: boolean;
  hasSpecies: boolean;
  reloadData?: () => void;
};

export default function Database(props: DatabaseProps): JSX.Element {
  const { hasSeedBanks, hasSpecies, reloadData } = props;

  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const { userPreferences, updateUserPreferences } = useUser();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { goToNewAccession } = useNavigateTo();
  const { availableProjects: projects } = useProjects();
  const contentRef = useRef(null);

  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>();
  const [selectSeedBankForImportModalOpen, setSelectSeedBankForImportModalOpen] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);

  const [fetchAccessions, searchAccessionsResult] = useLazySearchAccessionsQuery();
  useEffect(() => {
    if (selectedOrganization) {
      void fetchAccessions({ organizationId: selectedOrganization.id, fields: ALL_ACCESSION_FIELDS });
    }
  }, [fetchAccessions, selectedOrganization]);
  const searchResults: SearchResponseElementWithId[] | null | undefined = searchAccessionsResult.isError
    ? null
    : (searchAccessionsResult.data as SearchResponseElementWithId[] | undefined);

  const [fetchPendingAccessions, pendingAccessionsResult] = useLazyGetPendingAccessionsQuery();
  useEffect(() => {
    if (selectedOrganization) {
      void fetchPendingAccessions(selectedOrganization.id);
    }
  }, [fetchPendingAccessions, selectedOrganization]);
  const pendingAccessions: SearchResponseElementWithId[] | null | undefined = pendingAccessionsResult.isError
    ? null
    : pendingAccessionsResult.data;

  const [fetchAccessionsListUploadTemplate] = useLazyGetAccessionsListUploadTemplateQuery();

  const isOnboarded = hasSeedBanks && hasSpecies;

  const handleViewCollections = () => {
    navigate(APP_PATHS.CHECKIN);
  };

  const dismissedCheckInIds = useMemo(
    () => (userPreferences[PREF_DISMISSED_CHECKIN_IDS] as string[] | undefined) ?? [],
    [userPreferences]
  );

  const hasNewPendingAccessions = useMemo(
    () => (pendingAccessions ?? []).some((a) => !dismissedCheckInIds.includes(a.id)),
    [dismissedCheckInIds, pendingAccessions]
  );

  const dismissCheckInBanner = useCallback(() => {
    const knownIds = new Set((searchResults ?? []).map((a) => a.id));
    const prunedExisting = dismissedCheckInIds.filter((id) => knownIds.has(id));
    const newIds = Array.from(new Set([...prunedExisting, ...(pendingAccessions ?? []).map((a) => a.id)]));
    void updateUserPreferences({ ...userPreferences, [PREF_DISMISSED_CHECKIN_IDS]: newIds });
  }, [dismissedCheckInIds, pendingAccessions, searchResults, updateUserPreferences, userPreferences]);

  const onSeedBankForImportSelected = (selectedFacilityOnModal: Facility | undefined) => {
    setSelectSeedBankForImportModalOpen(false);
    if (selectedFacilityOnModal) {
      setSelectedFacility(selectedFacilityOnModal);
      setOpenImportModal(true);
    }
  };

  const goTo = (appPath: string) => {
    navigate({ pathname: appPath });
  };

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'import') {
      setSelectSeedBankForImportModalOpen(true);
    } else if (optionItem.value === 'checkin') {
      handleViewCollections();
    }
  };

  const getEmptyState = () => {
    const emptyState = [];

    if (!hasSeedBanks) {
      emptyState.push({
        title: strings.ADD_SEED_BANKS,
        text: strings.ACCESSIONS_ONBOARDING_SEEDBANKS_MSG,
        buttonText: strings.GO_TO_SEED_BANKS,
        onClick: () => goTo(APP_PATHS.SEED_BANKS),
      });
    }

    if (!hasSpecies) {
      emptyState.push({
        title: strings.CREATE_SPECIES_LIST,
        text: strings.ACCESSIONS_ONBOARDING_SPECIES_MSG,
        buttonText: strings.GO_TO_SPECIES,
        onClick: () => goTo(APP_PATHS.SPECIES),
        disabled: !hasSeedBanks,
        altItem: {
          title: strings.IMPORT_ACCESSIONS_ALT_TITLE,
          text: strings.IMPORT_ACCESSIONS_WITH_TEMPLATE,
          linkText: strings.DOWNLOAD_THE_CSV_TEMPLATE,
          onLinkClick: () => downloadCsvTemplateHandler(() => fetchAccessionsListUploadTemplate().unwrap()),
          buttonText: strings.IMPORT_ACCESSIONS,
          onClick: () => setSelectSeedBankForImportModalOpen(true),
        },
      });
    }

    return emptyState;
  };

  const emptyStateSpacer = () => <Grid item xs={12} padding={theme.spacing(3)} />;

  const messageStyles = {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '48px',
    width: '800px',
  };

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }
    return [
      {
        id: 'byAccession',
        label: strings.BY_ACCESSION,
        children: <AccessionsTable searchResults={searchResults} projects={projects} />,
      },
      {
        id: 'bySpecies',
        label: strings.BY_SPECIES,
        children: <AccessionsBySpeciesTable searchResults={searchResults} />,
      },
    ];
  }, [activeLocale, searchResults, projects]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'byAccession',
    tabs,
    viewIdentifier: 'accessions-database',
  });

  return (
    <>
      {selectedFacility && (
        <ImportAccessionsModal
          open={openImportModal}
          onClose={() => setOpenImportModal(false)}
          facility={selectedFacility}
          reloadData={reloadData}
        />
      )}
      {selectedOrganization && (
        <SelectSeedBankModal open={selectSeedBankForImportModalOpen} onClose={onSeedBankForImportSelected} />
      )}
      <TfMain>
        <PageHeaderWrapper nextElement={contentRef.current}>
          <PageHeader
            title=''
            page={strings.ACCESSIONS}
            parentPage={strings.SEEDS}
            snackbarPageKey={'seeds'}
            rightComponent={
              isOnboarded ? (
                <>
                  {selectedOrganization &&
                    (isMobile ? (
                      <Button icon='plus' onClick={goToNewAccession} size='medium' id='newAccession' />
                    ) : (
                      <Button
                        label={strings.NEW_ACCESSION}
                        icon='plus'
                        onClick={goToNewAccession}
                        size='medium'
                        id='newAccession'
                      />
                    ))}
                  <OptionsMenu
                    onOptionItemClick={onOptionItemClick}
                    optionItems={[
                      { label: strings.CHECKIN_ACCESSIONS, value: 'checkin' },
                      { label: strings.IMPORT, value: 'import' },
                    ]}
                  />
                </>
              ) : undefined
            }
          >
            {null}
            {hasNewPendingAccessions && (
              <Grid item xs={12}>
                <Message
                  onClose={dismissCheckInBanner}
                  showCloseButton
                  type='page'
                  priority='info'
                  title={strings.CHECKIN_ACCESSIONS}
                  body={strings.formatString(strings.CHECK_IN_MESSAGE, (pendingAccessions ?? []).length).toString()}
                  pageButtons={[
                    <Button
                      key='1'
                      label={strings.VIEW}
                      onClick={handleViewCollections}
                      size='small'
                      priority='secondary'
                      type='passive'
                    />,
                  ]}
                />
              </Grid>
            )}
          </PageHeader>
        </PageHeaderWrapper>
        <Container ref={contentRef} maxWidth={false} sx={{ padding: 0 }}>
          {selectedOrganization ? (
            <>
              {isOnboarded ? (
                <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
              ) : isAdmin(selectedOrganization) ? (
                <Container maxWidth={false} sx={{ padding: '32px 0' }}>
                  {!isMobile && emptyStateSpacer()}
                  <EmptyMessage title={strings.ONBOARDING_ADMIN_TITLE} rowItems={getEmptyState()} sx={messageStyles} />
                </Container>
              ) : (
                <Container maxWidth={false} sx={{ padding: '32px 0' }}>
                  {!isMobile && emptyStateSpacer()}
                  <EmptyMessage
                    title={strings.REACH_OUT_TO_ADMIN_TITLE}
                    text={strings.NO_SEEDBANKS_NON_ADMIN_MSG}
                    sx={messageStyles}
                  />
                </Container>
              )}
            </>
          ) : (
            <Box
              sx={{
                position: 'fixed',
                top: '50%',
                left: 'calc(50% + 100px)',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Container>
      </TfMain>
    </>
  );
}
