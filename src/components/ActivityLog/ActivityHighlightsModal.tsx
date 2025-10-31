import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, IconButton, Typography } from '@mui/material';
import { Dropdown, Icon } from '@terraware/web-components';
import DialogBox, { DialogBoxSize } from '@terraware/web-components/components/DialogBox/DialogBox';
import { useDeviceInfo } from '@terraware/web-components/utils';

import useProjectReports from 'src/hooks/useProjectReports';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { Activity } from 'src/types/Activity';
import { groupActivitiesByQuarter } from 'src/utils/activityUtils';
import useQuery from 'src/utils/useQuery';
import { getLocation } from 'src/utils/useStateLocation';
import useStateLocation from 'src/utils/useStateLocation';

import ActivityHighlightsView from './ActivityHighlightsView';

const containerStyles = {
  '& .dialog-box': {
    minHeight: '90vh',
    minWidth: '96vw',
  },
  '& .dialog-box--header': {
    display: 'none',
  },
};

type ActivityHighlightsModalProps = {
  activities: Activity[];
  busy: boolean;
  onCancel?: () => void;
  open: boolean;
  projectId: number;
  setOpen: (open: boolean) => void;
  title?: string;
};

const ActivityHighlightsModal = ({
  activities,
  busy,
  open,
  setOpen,
  onCancel,
  projectId,
  title = '',
}: ActivityHighlightsModalProps) => {
  const { activeLocale, strings } = useLocalization();
  const { isMobile, isTablet } = useDeviceInfo();
  const query = useQuery();
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const { acceleratorReports, busy: isLoadingReports } = useProjectReports(projectId);

  const [selectedQuarter, setSelectedQuarter] = useState<string | undefined>(undefined);

  const highlightActivityId = useMemo(() => {
    const activityIdParam = query.get('highlightActivityId');
    return activityIdParam ? Number(activityIdParam) : undefined;
  }, [query]);

  const highlightedActivities = useMemo(() => activities.filter((activity) => activity.isHighlight), [activities]);

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

  const onClose = useCallback(() => {
    query.delete('highlightActivityId');
    navigate(getLocation(location.pathname, location, query.toString()));
    onCancel?.();
    setOpen(false);
  }, [location, navigate, onCancel, query, setOpen]);

  const dialogSize = useMemo((): DialogBoxSize => {
    if (isMobile) {
      return 'small';
    } else if (isTablet) {
      return 'large';
    } else {
      return 'xx-large';
    }
  }, [isMobile, isTablet]);

  const onChangeActivityQuarter = useCallback((value: string | undefined) => {
    setSelectedQuarter(value);
  }, []);

  // set initial selected quarter when modal opens and data has loaded
  useEffect(() => {
    if (open && dropdownOptions.length > 0 && !selectedQuarter && !busy && !isLoadingReports) {
      let defaultQuarter = dropdownOptions[0].value;

      // try to find the quarter of the latest submitted report
      if (acceleratorReports.length > 0) {
        const submittedReports = acceleratorReports.filter((report) => report.status === 'Submitted');
        if (submittedReports.length > 0) {
          const sorted = [...submittedReports].sort((a, b) =>
            b.endDate.localeCompare(a.endDate, activeLocale || undefined)
          );
          const latestReport = sorted[0];
          const year = latestReport.endDate.split('-')[0];
          const latestReportQuarter = `${latestReport.quarter} ${year}`;

          // only use it if it exists in the dropdown options
          if (dropdownOptions.some((option) => option.value === latestReportQuarter)) {
            defaultQuarter = latestReportQuarter;
          }
        }
      }

      setSelectedQuarter(defaultQuarter);
    }
  }, [acceleratorReports, activeLocale, busy, dropdownOptions, isLoadingReports, open, selectedQuarter]);

  return (
    <Box sx={containerStyles}>
      <DialogBox
        onClose={onClose}
        open={open}
        scrolled={highlightActivityId ? true : false}
        size={dialogSize}
        skrim
        title={title}
      >
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
            <Typography fontSize='24px' fontWeight={600} paddingRight='24px' sx={{ whiteSpace: 'nowrap' }}>
              {title}
            </Typography>

            {dropdownOptions.length > 0 && (
              <Dropdown
                label=''
                onChange={onChangeActivityQuarter}
                options={dropdownOptions}
                selectedValue={selectedQuarter}
              />
            )}
          </Box>

          <IconButton onClick={onClose}>
            <Icon name='close' size='medium' />
          </IconButton>
        </Box>

        {busy || isLoadingReports ? (
          <img
            alt={strings.LOADING}
            height='24px'
            src='/assets/loading.gif'
            style={{ margin: '24px 0' }}
            width='24px'
          />
        ) : (selectedGroup?.activities || []).length === 0 ? (
          <Box sx={{ height: '50vh', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <Typography>{strings.NO_HIGHLIGHTS_YET}</Typography>
          </Box>
        ) : (
          <ActivityHighlightsView
            activities={selectedGroup?.activities || []}
            projectId={projectId}
            selectedQuarter={selectedQuarter}
          />
        )}
      </DialogBox>
    </Box>
  );
};

export default ActivityHighlightsModal;
