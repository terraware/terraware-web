import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import {
  selectPlantingSiteT0,
  selectPlantingSiteT0Species,
  selectPlotsWithObservations,
} from 'src/redux/features/tracking/trackingSelectors';
import {
  PlotsWithObservationsSearchResult,
  requestGetPlantingSiteT0Species,
  requestPermanentPlotsWithObservations,
  requestPlantingSiteT0,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SiteT0Data, SpeciesPlot } from 'src/types/Tracking';
import useStickyTabs from 'src/utils/useStickyTabs';

import ChangeTabWarningModal from './ChangeTabWarningModal';
import EditPermanentPlotsTab from './EditPermanentPlotsTab';
import EditTemporaryPlotsTab from './EditTemporaryPlotsTab';
import SurvivalRateInstructions from './SurvivalRateInstructions';

type EditSurvivalRateSettingsProps = {
  reloadObservations: () => void;
};

const EditSurvivalRateSettings = ({ reloadObservations }: EditSurvivalRateSettingsProps) => {
  const { plantingSite, setSelectedPlantingSite } = usePlantingSiteData();
  const [requestId, setRequestId] = useState('');
  const plantingSiteT0Response = useAppSelector(selectPlantingSiteT0(requestId));
  const [plotsRequestId, setPlotsRequestId] = useState('');
  const plotsWithObservationsResponse = useAppSelector(selectPlotsWithObservations(plotsRequestId));
  const [speciesRequestId, setSpeciesRequestId] = useState('');
  const withdrawnSpeciesResponse = useAppSelector(selectPlantingSiteT0Species(speciesRequestId));
  const [plotsWithObservations, setPlotsWithObservations] = useState<PlotsWithObservationsSearchResult[]>();
  const [withdrawnSpeciesPlots, setWithdrawnSpeciesPlots] = useState<SpeciesPlot[]>();
  const [showChangeTabWarning, setShowChangeTabWarning] = useState(false);
  const dispatch = useAppDispatch();
  const [t0SiteData, setT0SiteData] = useState<SiteT0Data>();
  const params = useParams<{
    plantingSiteId: string;
  }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();

  useEffect(() => {
    setSelectedPlantingSite(plantingSiteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  const reload = useCallback(() => {
    if (plantingSite && plantingSite.id !== -1) {
      reloadObservations();
      const request = dispatch(requestPlantingSiteT0(plantingSite.id));
      setRequestId(request.requestId);
      const requestPlots = dispatch(requestPermanentPlotsWithObservations(plantingSite.id));
      setPlotsRequestId(requestPlots.requestId);
      const requestSpeciesPlots = dispatch(requestGetPlantingSiteT0Species(plantingSite.id));
      setSpeciesRequestId(requestSpeciesPlots.requestId);
    }
  }, [dispatch, plantingSite, reloadObservations]);

  useEffect(() => {
    if (plantingSite) {
      reload();
    }
  }, [dispatch, plantingSite, reload]);

  useEffect(() => {
    if (withdrawnSpeciesResponse?.status === 'success') {
      setWithdrawnSpeciesPlots(withdrawnSpeciesResponse.data);
    }
  }, [withdrawnSpeciesResponse]);

  useEffect(() => {
    if (plantingSiteT0Response?.status === 'success') {
      setT0SiteData(plantingSiteT0Response.data);
    }
  }, [plantingSiteT0Response]);

  useEffect(() => {
    if (plotsWithObservationsResponse?.status === 'success') {
      setPlotsWithObservations(plotsWithObservationsResponse.data);
    }
  }, [plotsWithObservationsResponse]);

  const permanentPlots = useMemo(() => {
    return plotsWithObservations?.filter((p) => !!p.permanentIndex);
  }, [plotsWithObservations]);

  const temporaryPlots = useMemo(() => {
    return plotsWithObservations?.filter((p) => !p.permanentIndex);
  }, [plotsWithObservations]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return (temporaryPlots?.length || 0) > 0
      ? [
          {
            id: 'permanent',
            label: strings.PERMANENT_PLOTS,
            children: (
              <EditPermanentPlotsTab
                plantingSiteId={plantingSiteId}
                plotsWithObservations={permanentPlots}
                t0Plots={t0SiteData?.plots}
                reload={reload}
                withdrawnSpeciesPlots={withdrawnSpeciesPlots}
              />
            ),
          },
          {
            id: 'temporary',
            label: strings.TEMPORARY_PLOTS,
            children: (
              <EditTemporaryPlotsTab
                plantingSiteId={plantingSiteId}
                temporaryPlotsWithObservations={temporaryPlots}
                zones={t0SiteData?.zones}
                withdrawnSpeciesPlots={withdrawnSpeciesPlots}
                reload={reload}
                alreadyIncluding={t0SiteData?.survivalRateIncludesTempPlots}
              />
            ),
          },
        ]
      : [
          {
            id: 'permanent',
            label: strings.PERMANENT_PLOTS,
            children: (
              <EditPermanentPlotsTab
                plantingSiteId={plantingSiteId}
                plotsWithObservations={permanentPlots}
                t0Plots={t0SiteData?.plots}
                reload={reload}
                withdrawnSpeciesPlots={withdrawnSpeciesPlots}
              />
            ),
          },
        ];
  }, [activeLocale, permanentPlots, plantingSiteId, reload, t0SiteData, temporaryPlots, withdrawnSpeciesPlots]);

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
    <Page title={strings.formatString(strings.EDIT_SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.name || '')}>
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
