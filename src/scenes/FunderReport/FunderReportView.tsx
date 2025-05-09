import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import Card from 'src/components/common/Card';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import strings from 'src/strings';
import { PublishedReport, PublishedReportMetric } from 'src/types/AcceleratorReport';
import { FundingEntity } from 'src/types/FundingEntity';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import MetricBox from './MetricBox';

type FunderReportViewProps = {
  selectedProjectId?: number;
  reports?: PublishedReport[];
  userFundingEntity?: FundingEntity;
};

const FunderReportView = ({ selectedProjectId, reports, userFundingEntity }: FunderReportViewProps) => {
  const theme = useTheme();
  const [selectedReport, setSelectedReport] = useState<PublishedReport>();
  const query = useQuery();
  const location = useStateLocation();
  const navigate = useSyncNavigate();
  const { isDesktop, isMobile } = useDeviceInfo();

  useEffect(() => {
    if (!selectedReport && reports?.length) {
      if (query.get('reportId')) {
        const found = reports?.find((r) => r.reportId.toString() === query.get('reportId'));
        setSelectedReport(found || reports[0]);
        query.delete('reportId');
        navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
      } else {
        setSelectedReport(reports[0]);
      }
    }
  }, [reports, selectedReport, query.get('reportId')]);

  const year = useMemo(() => {
    return selectedReport?.startDate?.split('-')[0];
  }, [selectedReport]);

  const projectName = userFundingEntity?.projects?.[0]?.dealName || '';

  const allMetrics: PublishedReportMetric[] = [];

  ['system', 'project', 'standard'].map((type) => {
    const metrics =
      type === 'system'
        ? selectedReport?.systemMetrics
        : type === 'project'
          ? selectedReport?.projectMetrics
          : selectedReport?.standardMetrics;
    if (metrics) {
      allMetrics.push(...metrics);
    }
  });

  const climateMetrics = allMetrics.filter((m) => m.component === 'Climate');
  const biodiversityMetrics = allMetrics.filter((m) => m.component === 'Biodiversity');
  const communityMetrics = allMetrics.filter((m) => m.component === 'Community');

  const metricBoxStyle = { borderRadius: '8px', paddingTop: 0, display: 'flex' };

  return (
    <Box>
      <Box
        sx={{ background: theme.palette.TwClrBgSecondary }}
        padding={3.5}
        borderRadius={'8px'}
        display={isMobile ? 'block' : 'flex'}
        justifyContent='space-between'
      >
        <Typography fontSize='24px' fontWeight={600}>
          {projectName}
        </Typography>
        {(reports?.length ?? 0) > 0 && (
          <SelectT<PublishedReport>
            id='report'
            label={''}
            placeholder={strings.SELECT}
            options={reports}
            onChange={(_report: PublishedReport) => {
              setSelectedReport(_report);
            }}
            selectedValue={selectedReport}
            isEqual={(a: PublishedReport, b: PublishedReport) => a.reportId === b.reportId}
            renderOption={(_report: PublishedReport) => `${_report?.startDate?.split('-')[0]} ${_report?.quarter}`}
            displayLabel={(_report: PublishedReport) => `${_report?.startDate?.split('-')[0]} ${_report?.quarter}`}
            toT={(name: string) => ({ name }) as unknown as PublishedReport}
            selectStyles={{ inputContainer: { 'margin-top': isMobile ? theme.spacing(4) : 0 } }}
          />
        )}
      </Box>
      <Box display={isDesktop ? 'flex' : 'block'} marginTop={3}>
        <Card
          style={{
            width: '100%',
            borderRadius: '8px',
            marginRight: 3,
          }}
        >
          <Typography fontSize={20} fontWeight={600}>
            {strings.HIGHLIGHTS}
          </Typography>
          <Typography marginTop={3} whiteSpace={'pre-line'}>
            {selectedReport?.highlights}
          </Typography>
        </Card>
        <Card
          style={{
            borderRadius: '8px',
            marginTop: isDesktop ? 0 : 3,
          }}
        >
          <Typography fontSize={20} fontWeight={600}>
            {strings.LEGEND}
          </Typography>
          <Box>
            <Box display='flex' marginTop={2}>
              <Box flexBasis={'81px'} flexShrink={0} marginRight={1}>
                <MetricStatusBadge status='Achieved' />
              </Box>
              <Typography>{strings.METRIC_STATUS_DESCRIPTION_ARCHIVED}</Typography>
            </Box>
            <Box display='flex' marginTop={3}>
              <Box flexBasis={'81px'} flexShrink={0} marginRight={1}>
                <MetricStatusBadge status='On-Track' />
              </Box>
              <Typography>{strings.METRIC_STATUS_DESCRIPTION_ON_TRACK}</Typography>
            </Box>
            <Box display='flex' marginTop={3}>
              <Box flexBasis={'81px'} flexShrink={0} marginRight={1}>
                <MetricStatusBadge status='Unlikely' />
              </Box>
              <Typography>{strings.METRIC_STATUS_DESCRIPTION_UNLIKELY}</Typography>
            </Box>
          </Box>
        </Card>
      </Box>
      {year && (
        <>
          {climateMetrics.length > 0 && (
            <Box width='100%'>
              <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
                {strings.CLIMATE}
              </Typography>

              <Card style={metricBoxStyle}>
                <Box display={isDesktop ? 'flex' : 'block'} flexWrap='wrap'>
                  {climateMetrics?.map((metric, index) => (
                    <MetricBox
                      metric={metric}
                      index={index}
                      year={year}
                      quarter={selectedReport?.quarter}
                      key={index}
                      lastIndex={index === climateMetrics.length - 1}
                    />
                  ))}
                </Box>
              </Card>
            </Box>
          )}
          {biodiversityMetrics.length > 0 && (
            <Box width='100%'>
              <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
                {strings.BIODIVERSITY}
              </Typography>

              <Card style={metricBoxStyle}>
                <Box display={isDesktop ? 'flex' : 'block'} flexWrap='wrap'>
                  {biodiversityMetrics?.map((metric, index) => (
                    <MetricBox
                      metric={metric}
                      index={index}
                      year={year}
                      quarter={selectedReport?.quarter}
                      key={index}
                      lastIndex={index === biodiversityMetrics.length - 1}
                    />
                  ))}
                </Box>
              </Card>
            </Box>
          )}
          {communityMetrics.length > 0 && (
            <Box width='100%'>
              <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
                {strings.COMMUNITY}
              </Typography>

              <Card style={metricBoxStyle}>
                <Box display={isDesktop ? 'flex' : 'block'} flexWrap='wrap'>
                  {communityMetrics?.map((metric, index) => (
                    <MetricBox
                      metric={metric}
                      index={index}
                      year={year}
                      quarter={selectedReport?.quarter}
                      key={index}
                      lastIndex={index === communityMetrics.length - 1}
                    />
                  ))}
                </Box>
              </Card>
            </Box>
          )}
        </>
      )}
      {selectedProjectId && selectedReport?.achievements && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.ACHIEVEMENTS}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <AchievementsBox report={selectedReport} projectId={selectedProjectId.toString()} noTitle />
          </Card>
        </Box>
      )}
      {selectedProjectId && selectedReport?.challenges && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.CHALLENGES_AND_MITIGATION_PLAN}
          </Typography>
          <Card
            style={{
              borderRadius: '8px',
            }}
          >
            <ChallengesMitigationBox report={selectedReport} projectId={selectedProjectId.toString()} noTitle />
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default FunderReportView;
