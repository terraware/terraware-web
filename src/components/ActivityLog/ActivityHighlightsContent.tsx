import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, IconButton, Typography } from '@mui/material';
import { Dropdown, Icon } from '@terraware/web-components';

import useFunderPortal from 'src/hooks/useFunderPortal';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { PublishedReportPayload, useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import { AcceleratorReportPayload, useListAcceleratorReportsQuery } from 'src/queries/generated/reports';
import { groupActivitiesByQuarter } from 'src/utils/activityUtils';
import useQuery from 'src/utils/useQuery';
import { getLocation } from 'src/utils/useStateLocation';
import useStateLocation from 'src/utils/useStateLocation';

import ActivityHighlightsView from './ActivityHighlightsView';
import { TypedActivity } from './types';

export type QuarterDropdownData = {
  dropdownOptions: { label: string; value: string }[];
  selectedQuarter: string | undefined;
  onChangeQuarter: (value: string | undefined) => void;
};

type ActivityHighlightsContentProps = {
  activities: TypedActivity[];
  busy: boolean;
  projectId: number;
  showCloseButton?: boolean;
  onClose?: () => void;
  title?: string;
  showDropdownInline?: boolean;
  onDropdownDataReady?: (data: QuarterDropdownData) => void;
};

const ActivityHighlightsContent = ({
  activities,
  busy,
  projectId,
  showCloseButton = false,
  onClose,
  title = '',
  showDropdownInline = true,
  onDropdownDataReady,
}: ActivityHighlightsContentProps) => {
  const { activeLocale, strings } = useLocalization();
  const query = useQuery();
  const location = useStateLocation();
  const navigate = useSyncNavigate();

  const { isFunderRoute } = useFunderPortal();
  const listReportsResponse = useListAcceleratorReportsQuery({ projectId }, { skip: isFunderRoute });
  const listPublishedReportsResponse = useListPublishedReportsQuery(projectId, { skip: !isFunderRoute });
  const isLoadingReports = useMemo(
    () => listReportsResponse.isLoading || listPublishedReportsResponse.isLoading,
    [listPublishedReportsResponse.isLoading, listReportsResponse.isLoading]
  );

  const acceleratorReports = useMemo(
    () => listReportsResponse.data?.reports ?? [],
    [listReportsResponse.data?.reports]
  );
  const publishedReports = useMemo(
    () => listPublishedReportsResponse.data?.reports ?? [],
    [listPublishedReportsResponse.data?.reports]
  );

  const [selectedQuarter, setSelectedQuarter] = useState<string | undefined>(undefined);
  const highlightedActivities = useMemo(
    () => activities.filter((activity) => activity.payload.isHighlight),
    [activities]
  );

  const groupedActivities = useMemo(
    () => groupActivitiesByQuarter(highlightedActivities, strings),
    [highlightedActivities, strings]
  );

  const selectedGroup = useMemo(() => {
    return groupedActivities.find((group) => group.quarter === selectedQuarter);
  }, [groupedActivities, selectedQuarter]);

  const dropdownOptions = useMemo(() => {
    return groupedActivities
      .map((group) => ({
        label: group.quarter,
        value: group.quarter,
      }))
      .sort((a, b) => b.label.localeCompare(a.label, activeLocale || undefined));
  }, [activeLocale, groupedActivities]);

  const handleClose = useCallback(() => {
    query.delete('highlightActivityId');
    navigate(getLocation(location.pathname, location, query.toString()));
    onClose?.();
  }, [location, navigate, onClose, query]);

  const onChangeActivityQuarter = useCallback((value: string | undefined) => {
    setSelectedQuarter(value);
  }, []);

  const getLatestReportQuarter = useCallback(
    (reports: AcceleratorReportPayload[] | PublishedReportPayload[]) => {
      if (reports.length === 0) {
        return undefined;
      }

      const sorted = [...reports].sort((a, b) => b.endDate.localeCompare(a.endDate, activeLocale || undefined));
      const latestReport = sorted[0];
      const year = latestReport.endDate.split('-')[0];
      const latestReportQuarter = `${latestReport.quarter} ${year}`;

      // only use it if it exists in the dropdown options
      if (dropdownOptions && !dropdownOptions.some((option) => option.value === latestReportQuarter)) {
        return undefined;
      }

      return latestReportQuarter;
    },
    [activeLocale, dropdownOptions]
  );

  // set initial selected quarter when data has loaded
  useEffect(() => {
    if (dropdownOptions.length > 0 && !selectedQuarter && !busy && !isLoadingReports) {
      let defaultQuarter = dropdownOptions[0].value;
      let latestReportQuarter: string | undefined;

      // try to find the quarter of the latest submitted report
      if (acceleratorReports.length > 0) {
        const submittedReports = acceleratorReports.filter((report) => report.status === 'Submitted');
        latestReportQuarter = getLatestReportQuarter(submittedReports);
      } else if (publishedReports && (publishedReports?.length || 0) > 0) {
        latestReportQuarter = getLatestReportQuarter(publishedReports);
      }

      if (latestReportQuarter) {
        defaultQuarter = latestReportQuarter;
      }

      setSelectedQuarter(defaultQuarter);
    }
  }, [
    acceleratorReports,
    busy,
    dropdownOptions,
    getLatestReportQuarter,
    isLoadingReports,
    publishedReports,
    selectedQuarter,
  ]);

  // Notify parent component with dropdown data when it's ready
  useEffect(() => {
    if (onDropdownDataReady && dropdownOptions.length > 0 && selectedQuarter !== undefined) {
      onDropdownDataReady({
        dropdownOptions,
        selectedQuarter,
        onChangeQuarter: onChangeActivityQuarter,
      });
    }
  }, [dropdownOptions, selectedQuarter, onChangeActivityQuarter, onDropdownDataReady]);

  return (
    <>
      {(title || showDropdownInline || showCloseButton) && (
        <Box
          alignItems='flex-start'
          display='flex'
          flexDirection='row'
          justifyContent='space-between'
          marginBottom='24px'
          width='100%'
        >
          <Box
            display='flex'
            sx={{
              flexDirection: { xs: 'column', md: 'row' },
              // z-index is necessary to ensure dropdown options appear above map components
              '& .select .options-container': { zIndex: 1000 },
            }}
          >
            {title && (
              <Typography fontSize='24px' fontWeight={600} paddingRight='24px' sx={{ whiteSpace: 'nowrap' }}>
                {title}
              </Typography>
            )}

            {showDropdownInline && dropdownOptions.length > 0 && (
              <Dropdown
                label=''
                onChange={onChangeActivityQuarter}
                options={dropdownOptions}
                selectedValue={selectedQuarter}
              />
            )}
          </Box>
          {showCloseButton && (
            <IconButton onClick={handleClose}>
              <Icon name='close' size='medium' />
            </IconButton>
          )}
        </Box>
      )}
      {busy || isLoadingReports ? (
        <img alt={strings.LOADING} height='24px' src='/assets/loading.gif' style={{ margin: '24px 0' }} width='24px' />
      ) : (selectedGroup?.activities || []).length === 0 ? (
        <Box sx={{ alignItems: 'center', display: 'flex', height: '50vh', justifyContent: 'center', width: '100%' }}>
          <Typography>{strings.NO_HIGHLIGHTS_YET}</Typography>
        </Box>
      ) : (
        <ActivityHighlightsView
          activities={selectedGroup?.activities || []}
          projectId={projectId}
          selectedQuarter={selectedQuarter}
        />
      )}
    </>
  );
};

export default ActivityHighlightsContent;
