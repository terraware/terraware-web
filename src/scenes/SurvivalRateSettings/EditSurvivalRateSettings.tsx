import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useGetT0SiteDataQuery, useGetT0SpeciesForPlantingSiteQuery } from 'src/queries/generated/t0';
import { useGetPlotsWithObservationsQuery } from 'src/queries/search/t0';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import ChangeTabWarningModal from './ChangeTabWarningModal';
import EditPermanentPlotsTab from './EditPermanentPlotsTab';
import EditTemporaryPlotsTab from './EditTemporaryPlotsTab';
import SurvivalRateInstructions from './SurvivalRateInstructions';

const EditSurvivalRateSettings = () => {
  const [showChangeTabWarning, setShowChangeTabWarning] = useState(false);
  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const skipPlantingSite = useMemo(
    () => plantingSiteId === undefined || isNaN(plantingSiteId) || plantingSiteId === -1,
    [plantingSiteId]
  );
  const { data: plantingSite } = useGetPlantingSiteQuery(plantingSiteId, { skip: skipPlantingSite });
  const { data: t0SiteResponse } = useGetT0SiteDataQuery(plantingSiteId, { skip: skipPlantingSite });
  const t0SiteData = useMemo(() => t0SiteResponse?.data, [t0SiteResponse]);
  const { data: withdrawnSpeciesResponse } = useGetT0SpeciesForPlantingSiteQuery(plantingSiteId, {
    skip: skipPlantingSite,
  });
  const withdrawnSpeciesPlots = useMemo(() => withdrawnSpeciesResponse?.plots, [withdrawnSpeciesResponse]);
  const { data: plotsWithObservations } = useGetPlotsWithObservationsQuery(plantingSiteId, {
    skip: skipPlantingSite,
  });

  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();

  const permanentPlots = useMemo(() => {
    return plotsWithObservations?.filter(
      (p) => !!p.permanentIndex && p.observationPlots.some((op) => op.isPermanent === 'true')
    );
  }, [plotsWithObservations]);

  const temporaryPlots = useMemo(() => {
    return plotsWithObservations?.filter(
      (p) => !p.permanentIndex && p.observationPlots.some((op) => op.isPermanent === 'false')
    );
  }, [plotsWithObservations]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    const _tabs = [
      {
        id: 'permanent',
        label: strings.PERMANENT_PLOTS,
        children: (
          <EditPermanentPlotsTab
            plantingSiteId={plantingSiteId}
            plotsWithObservations={permanentPlots}
            t0Plots={t0SiteData?.plots}
            withdrawnSpeciesPlots={withdrawnSpeciesPlots}
          />
        ),
      },
    ];

    if ((temporaryPlots?.length || 0) > 0) {
      _tabs.push({
        id: 'temporary',
        label: strings.TEMPORARY_PLOTS,
        children: (
          <EditTemporaryPlotsTab
            plantingSiteId={plantingSiteId}
            temporaryPlotsWithObservations={temporaryPlots}
            zones={t0SiteData?.strata}
            withdrawnSpeciesPlots={withdrawnSpeciesPlots}
            alreadyIncluding={t0SiteData?.survivalRateIncludesTempPlots}
          />
        ),
      });
    }

    return _tabs;
  }, [activeLocale, permanentPlots, plantingSiteId, t0SiteData, temporaryPlots, withdrawnSpeciesPlots]);

  const { activeTab } = useStickyTabs({
    defaultTab: 'permanent',
    tabs,
    viewIdentifier: 'edit-survival-rate-settings',
  });

  const continueChangeTab = useCallback(() => {
    setShowChangeTabWarning(false);

    navigate({
      pathname: APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()),
      search: `tab=${activeTab === 'permanent' ? 'temporary' : 'permanent'}`,
    });
  }, [activeTab, navigate, plantingSiteId]);

  const onChangeTabHandler = useCallback(
    (newTab: string) => {
      if (newTab !== activeTab) {
        setShowChangeTabWarning(true);
      }
    },
    [activeTab]
  );

  const closeChangeTabWarning = useCallback(() => {
    setShowChangeTabWarning(false);
  }, []);

  return (
    <Page title={strings.formatString(strings.EDIT_SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.site?.name || '')}>
      {showChangeTabWarning && (
        <ChangeTabWarningModal
          onClose={closeChangeTabWarning}
          onExit={continueChangeTab}
          type={activeTab ?? 'permanent'}
        />
      )}
      <Card radius='8px' flushMobile>
        <Box marginBottom={theme.spacing(4)}>
          <SurvivalRateInstructions />
        </Box>
        <Tabs
          activeTab={activeTab}
          onChangeTab={onChangeTabHandler}
          tabs={tabs}
          headerBorder={true}
          sx={{
            '& .tab-header': {
              margin: 0,
            },
          }}
        />
      </Card>
    </Page>
  );
};

export default EditSurvivalRateSettings;
