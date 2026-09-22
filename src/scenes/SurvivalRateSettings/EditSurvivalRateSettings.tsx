import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import UnsavedChangesBadge from 'src/components/common/UnsavedChangesBadge';
import { APP_PATHS } from 'src/constants';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useGetT0SiteDataQuery, useGetT0SpeciesForPlantingSiteQuery } from 'src/queries/generated/t0';
import { useGetPlotsWithObservationsQuery } from 'src/queries/search/t0';
import useStickyTabs from 'src/utils/useStickyTabs';

import ChangeTabWarningModal from './ChangeTabWarningModal';
import EditPermanentPlotsTab from './EditPermanentPlotsTab';
import EditTemporaryPlotsTab from './EditTemporaryPlotsTab';
import SurvivalRateInstructions from './SurvivalRateInstructions';

export type SurvivalRateFormRegistration = {
  isDirty: boolean;
  saving: boolean;
  save: () => void;
};

const EditSurvivalRateSettings = () => {
  const { strings } = useLocalization();
  const [showChangeTabWarning, setShowChangeTabWarning] = useState(false);
  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);
  const skipPlantingSite = useMemo(
    () => plantingSiteId === undefined || isNaN(plantingSiteId) || plantingSiteId === -1,
    [plantingSiteId]
  );
  const { plantingSite } = usePlantingSite(plantingSiteId);
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

  const [formState, setFormState] = useState<{ isDirty: boolean; saving: boolean }>({
    isDirty: false,
    saving: false,
  });

  const saveRef = useRef<(() => void) | undefined>(undefined);

  const registerFormState = useCallback(({ isDirty, saving, save }: SurvivalRateFormRegistration) => {
    saveRef.current = save;
    setFormState((prev) => (prev.isDirty === isDirty && prev.saving === saving ? prev : { isDirty, saving }));
  }, []);

  const goToViewSettings = useCallback(() => {
    navigate(APP_PATHS.SURVIVAL_RATE_SETTINGS_V2.replace(':plantingSiteId', plantingSiteId.toString()));
  }, [navigate, plantingSiteId]);

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
            onRegister={registerFormState}
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
            strata={t0SiteData?.strata}
            withdrawnSpeciesPlots={withdrawnSpeciesPlots}
            alreadyIncluding={t0SiteData?.survivalRateIncludesTempPlots}
            onRegister={registerFormState}
          />
        ),
      });
    }

    return _tabs;
  }, [
    activeLocale,
    permanentPlots,
    plantingSiteId,
    registerFormState,
    strings.PERMANENT_PLOTS,
    strings.TEMPORARY_PLOTS,
    t0SiteData?.plots,
    t0SiteData?.strata,
    t0SiteData?.survivalRateIncludesTempPlots,
    temporaryPlots,
    withdrawnSpeciesPlots,
  ]);

  const { activeTab } = useStickyTabs({
    defaultTab: 'permanent',
    tabs,
    viewIdentifier: 'edit-survival-rate-settings',
  });

  const continueChangeTab = useCallback(() => {
    setShowChangeTabWarning(false);
    const baseUrl = APP_PATHS.SURVIVAL_RATE_SETTINGS_V2;

    navigate({
      pathname: baseUrl.replace(':plantingSiteId', plantingSiteId.toString()),
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

  const title = (
    <Box
      alignItems='center'
      display='flex'
      flexWrap='wrap'
      gap={theme.spacing(1.5)}
      sx={{ paddingLeft: theme.spacing(3) }}
    >
      <Typography fontSize='24px' fontWeight={600}>
        {strings.formatString(strings.EDIT_SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.name || '')}
      </Typography>
      {formState.isDirty && <UnsavedChangesBadge />}
    </Box>
  );

  const rightComponent = (
    <Box alignItems='center' display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
      <Button
        disabled={formState.saving}
        id='cancelSettings'
        label={strings.CANCEL}
        onClick={goToViewSettings}
        priority='secondary'
        size='medium'
        type='passive'
      />
      <Button
        disabled={!formState.isDirty || formState.saving}
        id='saveSettings'
        label={strings.SAVE}
        onClick={() => saveRef.current?.()}
        size='medium'
      />
    </Box>
  );

  return (
    <Page rightComponent={rightComponent} stickyHeader stickyHeaderElevated={formState.isDirty} title={title}>
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
