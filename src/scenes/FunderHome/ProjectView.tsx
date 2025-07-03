import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { SelectT, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import TfMain from 'src/components/common/TfMain';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { PublishedReport } from 'src/types/AcceleratorReport';
import { FunderProjectDetails } from 'src/types/FunderProject';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useStickyTabs from 'src/utils/useStickyTabs';

import ProjectProfileView from '../AcceleratorRouter/ParticipantProjects/ProjectProfileView';
import FunderReportView from '../FunderReport/FunderReportView';

const DEAL_NAME_COUNTRY_CODE_REGEX = /^[A-Z]{3}_/;

type ProjectViewProps = {
  projectDetails: FunderProjectDetails;
  includeCrumbs: boolean;
  goToAllProjects: () => void;
  publishedReports: PublishedReport[];
};

const ProjectView = ({ projectDetails, includeCrumbs, goToAllProjects, publishedReports }: ProjectViewProps) => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { strings } = useLocalization();
  const query = useQuery();
  const location = useStateLocation();
  const navigate = useSyncNavigate();

  const [selectedReport, setSelectedReport] = useState<PublishedReport>();

  useEffect(() => {
    if (!selectedReport && publishedReports?.length) {
      if (query.get('reportId')) {
        const found = publishedReports?.find((r) => r.reportId.toString() === query.get('reportId'));
        setSelectedReport(found || publishedReports[0]);
        query.delete('reportId');
        navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      } else {
        setSelectedReport(publishedReports[0]);
      }
    }
  }, [location, navigate, query, publishedReports, selectedReport]);

  const strippedDealName = useMemo(() => {
    if (projectDetails?.dealName?.match(DEAL_NAME_COUNTRY_CODE_REGEX)) {
      return projectDetails?.dealName?.replace(DEAL_NAME_COUNTRY_CODE_REGEX, '');
    } else {
      return projectDetails?.dealName;
    }
  }, [projectDetails?.dealName]);

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
        children: <FunderReportView selectedProjectId={projectDetails.projectId} selectedReport={selectedReport} />,
      },
    ];
  }, [strings, projectDetails, publishedReports, selectedReport]);

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
      <>{crumbs && <BreadCrumbs crumbs={crumbs} />}</>
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
            {activeTab === 'report' && (publishedReports?.length ?? 0) > 0 && (
              <SelectT<PublishedReport>
                id='report'
                label={''}
                placeholder={strings.SELECT}
                options={publishedReports}
                onChange={(_report: PublishedReport) => {
                  setSelectedReport(_report);
                }}
                selectedValue={selectedReport}
                isEqual={(a: PublishedReport, b: PublishedReport) => a.reportId === b.reportId}
                renderOption={(_report: PublishedReport) => `${_report?.startDate?.split('-')[0]} ${_report?.quarter}`}
                displayLabel={(_report: PublishedReport) => `${_report?.startDate?.split('-')[0]} ${_report?.quarter}`}
                toT={(name: string) => ({ name }) as unknown as PublishedReport}
                selectStyles={{ inputContainer: { 'margin-top': isMobile ? theme.spacing(2) : 0 } }}
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
