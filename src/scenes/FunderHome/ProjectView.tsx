import React, { useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner, Dropdown, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import ActivitiesListView from 'src/components/ActivityLog/ActivitiesListView';
import ActivityHighlightsContent, { QuarterDropdownData } from 'src/components/ActivityLog/ActivityHighlightsContent';
import { TypedActivity } from 'src/components/ActivityLog/types';
import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import TfMain from 'src/components/common/TfMain';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useFunderListActivitiesQuery } from 'src/queries/generated/funderActivities';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { FunderProjectDetails } from 'src/types/FunderProject';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useStickyTabs from 'src/utils/useStickyTabs';

import ProjectProfileView from '../AcceleratorRouter/AcceleratorProjects/ProjectProfileView';
import FunderReportTabV2 from '../FunderReport/FunderReportTabV2';

const DEAL_NAME_COUNTRY_CODE_REGEX = /^[A-Z]{3}_/;

type ProjectViewProps = {
  projectDetails: FunderProjectDetails;
  includeCrumbs: boolean;
  goToAllProjects: () => void;
  publishedReports: PublishedReportPayload[];
};

const ProjectView = ({ projectDetails, includeCrumbs, goToAllProjects, publishedReports }: ProjectViewProps) => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { strings } = useLocalization();
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const { currentData: funderActivitiesData, isFetching } = useFunderListActivitiesQuery({
    projectId: projectDetails.projectId,
    includeMedia: true,
  });

  const activities = useMemo<TypedActivity[]>(
    () => funderActivitiesData?.activities?.map((payload) => ({ type: 'funder', payload })) ?? [],
    [funderActivitiesData]
  );

  const [quarterDropdownData, setQuarterDropdownData] = useState<QuarterDropdownData | undefined>(undefined);

  const hasHighlights = activities.length > 0;

  const goToQuarterlyHighlights = useCallback(
    (quarter?: string) => {
      const params = new URLSearchParams(location.search);
      params.set('tab', 'quarterlyHighlights');

      if (quarter) {
        params.set('highlightsQuarter', quarter);
      }

      navigate(getLocation(location.pathname, location, `?${params.toString()}`));
    },
    [location, navigate]
  );

  const projectDetailsDealName = projectDetails?.dealName;

  const strippedDealName = useMemo(() => {
    if (projectDetailsDealName?.match(DEAL_NAME_COUNTRY_CODE_REGEX)) {
      return projectDetailsDealName?.replace(DEAL_NAME_COUNTRY_CODE_REGEX, '');
    } else {
      return projectDetailsDealName;
    }
  }, [projectDetailsDealName]);

  const tabs = useMemo(() => {
    return [
      {
        id: 'projectProfile',
        label: strings.PROJECT_PROFILE,
        children: (
          <ProjectProfileView funderView={true} projectDetails={projectDetails} publishedReports={publishedReports} />
        ),
      },
      {
        id: 'report',
        label: strings.REPORT,
        children: (
          <FunderReportTabV2
            onViewQuarterlyHighlights={hasHighlights ? goToQuarterlyHighlights : undefined}
            selectedProjectId={projectDetails.projectId}
          />
        ),
      },
      ...(hasHighlights
        ? [
            {
              id: 'quarterlyHighlights',
              label: strings.QUARTERLY_HIGHLIGHTS,
              children: (
                <ActivityHighlightsContent
                  activities={activities}
                  busy={false}
                  projectId={projectDetails.projectId}
                  showDropdownInline={false}
                  onDropdownDataReady={setQuarterDropdownData}
                />
              ),
            },
            {
              id: 'activities',
              label: strings.PROJECT_ACTIVITY,
              children: <ActivitiesListView projectId={projectDetails.projectId} />,
            },
          ]
        : []),
    ];
  }, [activities, goToQuarterlyHighlights, hasHighlights, projectDetails, publishedReports, strings]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'projectProfile',
    tabs,
    viewIdentifier: 'funder-home',
  });

  const crumbs: Crumb[] = useMemo(
    () =>
      includeCrumbs
        ? [
            {
              name: strings.ALL_PROJECTS,
              onClick: goToAllProjects,
            },
          ]
        : [],
    [strings, includeCrumbs, goToAllProjects]
  );

  return (
    <TfMain>
      {crumbs && <BreadCrumbs crumbs={crumbs} />}
      {isFetching && <BusySpinner />}
      <Box
        component='main'
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box>
          <Box
            margin={theme.spacing(3)}
            display={isMobile ? 'block' : 'flex'}
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography fontWeight={600} lineHeight={'40px'} fontSize={'24px'}>
              {strippedDealName}
            </Typography>
            {activeTab === 'quarterlyHighlights' &&
              quarterDropdownData &&
              quarterDropdownData.dropdownOptions.length > 0 && (
                <Dropdown
                  label=''
                  onChange={quarterDropdownData.onChangeQuarter}
                  options={quarterDropdownData.dropdownOptions}
                  selectedValue={quarterDropdownData.selectedQuarter}
                />
              )}
          </Box>
          <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
        </Box>
      </Box>
    </TfMain>
  );
};

export default ProjectView;
