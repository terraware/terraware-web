import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import Card from 'src/components/common/Card';
import { useUserFundingEntity } from 'src/providers';
import { requestListFunderReports } from 'src/redux/features/funder/fundingEntitiesAsyncThunks';
import { selectListFunderReports } from 'src/redux/features/funder/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport, PublishedReport, PublishedReportMetric } from 'src/types/AcceleratorReport';

import MetricBox from './MetricBox';

const FunderReportView = () => {
  const theme = useTheme();
  const { userFundingEntity } = useUserFundingEntity();
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const dispatch = useAppDispatch();
  const reportsResponse = useAppSelector(selectListFunderReports(selectedProjectId?.toString() ?? ''));
  const [reports, setReports] = useState<PublishedReport[]>();
  const [selectedReport, setSelectedReport] = useState<PublishedReport>();

  useEffect(() => {
    if ((userFundingEntity?.projects?.length ?? 0) > 0) {
      setSelectedProjectId(userFundingEntity?.projects?.[0].projectId);
    }
  }, [userFundingEntity]);

  useEffect(() => {
    if (selectedProjectId) {
      dispatch(requestListFunderReports(selectedProjectId));
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (reportsResponse?.status === 'success') {
      setReports(reportsResponse.data);
    }
  }, [reportsResponse]);

  useEffect(() => {
    if (!selectedReport && reports?.length) {
      setSelectedReport(reports[0]);
    }
  }, [reports, selectedReport]);

  const report = {
    id: 213,
    projectId: 28,
    frequency: 'Quarterly',
    quarter: 'Q1',
    status: 'Submitted',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    highlights:
      "The headphones were on. They had been utilized on purpose. She could hear her mom yelling in the background, but couldn't make out exactly what the yelling was about. That was exactly why she had put them on. She knew her mom would enter her room at any minute, and she could pretend that she hadn't heard any of the previous yelling.\nBenny was tired. Not the normal every day tired from a hard day o work. The exhausted type of tired where you're surprised your body can even move. All he wanted to do was sit in front of the TV, put his feet up on the coffee table, and drink a beer. The only issue was that he had forgotten where he lived.\nThe alarm went off and Jake rose awake. Rising early had become a daily ritual, one that he could not fully explain. From the outside, it was a wonder that he was able to get up so early each morning for someone who had absolutely no plans to be productive during the entire day.",
    achievements: [
      "The headphones were on. They had been utilized on purpose. She could hear her mom yelling in the background, but couldn't make out exactly what the yelling was about. That was exactly why she had put them on. She knew her mom would enter her room at any minute, and she could pretend that she hadn't heard any of the previous yelling.\nBenny was tired. Not the normal every day tired from a hard day o work. The exhausted type of tired where you're surprised your body can even move. All he wanted to do was sit in front of the TV, put his feet up on the coffee table, and drink a beer. The only issue was that he had forgotten where he lived.\nThe alarm went off and Jake rose awake. Rising early had become a daily ritual, one that he could not fully explain. From the outside, it was a wonder that he was able to get up so early each morning for someone who had absolutely no plans to be productive during the entire day.\nLorem ipsum odor amet, consectetuer adipiscing elit. Diam tempor neque nibh; placerat lacus libero facilisi primis platea. Quam adipiscing nisl ultricies vulputate diam. Nullam quisque sodales fermentum per vel per. Lobortis lobortis quisque sit est, sapien accumsan est. Augue duis bibendum gravida praesent vehicula nullam venenatis volutpat. Turpis vivamus metus sit rutrum volutpat nec. Dolor faucibus curae ridiculus ultricies congue. Velit arcu ad; adipiscing sollicitudin velit efficitur tempor. Luctus cras efficitur mattis, fringilla magna integer mattis inceptos gravida. Vel mauris velit urna habitasse id; a taciti? Ante habitasse praesent pulvinar felis aenean a cubilia. Himenaeos senectus aptent mollis; fringilla dui velit consectetur. Et natoque fringilla ultricies lacus porttitor dictum. Arcu nec pretium orci ac diam cras habitasse bibendum. ",
      "The headphones were on. They had been utilized on purpose. She could hear her mom yelling in the background, but couldn't make out exactly what the yelling was about. That was exactly why she had put them on. She knew her mom would enter her room at any minute, and she could pretend that she hadn't heard any of the previous yelling.\nBenny was tired. Not the normal every day tired from a hard day o work. The exhausted type of tired where you're surprised your body can even move. All he wanted to do was sit in front of the TV, put his feet up on the coffee table, and drink a beer. The only issue was that he had forgotten where he lived.\nThe alarm went off and Jake rose awake. Rising early had become a daily ritual, one that he could not fully explain. From the outside, it was a wonder that he was able to get up so early each morning for someone who had absolutely no plans to be productive during the entire day.",
      "The headphones were on. They had been utilized on purpose. She could hear her mom yelling in the background, but couldn't make out exactly what the yelling was about. That was exactly why she had put them on. She knew her mom would enter her room at any minute, and she could pretend that she hadn't heard any of the previous yelling.\nBenny was tired. Not the normal every day tired from a hard day o work. The exhausted type of tired where you're surprised your body can even move. All he wanted to do was sit in front of the TV, put his feet up on the coffee table, and drink a beer. The only issue was that he had forgotten where he lived.\nThe alarm went off and Jake rose awake. Rising early had become a daily ritual, one that he could not fully explain. From the outside, it was a wonder that he was able to get up so early each morning for someone who had absolutely no plans to be productive during the entire day.",
      "The headphones were on. They had been utilized on purpose. She could hear her mom yelling in the background, but couldn't make out exactly what the yelling was about. That was exactly why she had put them on. She knew her mom would enter her room at any minute, and she could pretend that she hadn't heard any of the previous yelling.\nBenny was tired. Not the normal every day tired from a hard day o work. The exhausted type of tired where you're surprised your body can even move. All he wanted to do was sit in front of the TV, put his feet up on the coffee table, and drink a beer. The only issue was that he had forgotten where he lived.\nThe alarm went off and Jake rose awake. Rising early had become a daily ritual, one that he could not fully explain. From the outside, it was a wonder that he was able to get up so early each morning for someone who had absolutely no plans to be productive during the entire day.",
    ],
    challenges: [
      {
        challenge:
          'Given the election period, the Ghana Forestry Commission (FC) is unable to sign the document requested by the Carbon Market Office (CMO). Obtaining formal commitments from the government during the election period is typically challenging. It has been recommended to wait for the electoral cycle to stabilize, and then to repeat our request with the new administration in place in Q1 2025. \nConsidering the bureaucratic nature of government engagement in Ghana, coupled with the need for the new administration to familiarize itself with the processes, we believe we are able to obtain this letter by Q3 2025.\n',
        mitigationPlan:
          "The Carbon Market Office (CMO) requested a letter from the Forestry Commission (FC) showing that the lands of the ReDAW project are not engaged in another carbon project (“exclusivity letter”). The project lands are privately owned, thus the decision makers to commit these lands to a project are the clans/families that own them (not the State). Having said that, the Climate Change Unit of the FC confirmed verbally to us that the lands are not engaged in another carbon project. Our main strategy is to speed up the administrative process.\n\nThe ReDAW project is recognized by Ghana's Ministry of Lands and Natural Resources and its affiliated agency, the FC. The Wildlife Division's regional office has expressed strong support for the project, and all relevant project communities have been engaged as part of our risk mitigation strategy. Additionally, the CMO is informed of potential delays in securing the FC’s letter of exclusivity.\n\nWe are closely monitoring developments within the FC, especially considering potential regime changes after the December 7 elections. All necessary requirements for the letter of exclusivity have been fulfilled, and the relevant documentation has been submitted to the FC’s Climate Change Unit, which has been the bottleneck for progress in recent months. As soon as the new administration is nominated, we will organize in person meetings to continue the process. We remain committed to securing the letter by the third quarter of 2025. Yes.",
      },
      {
        challenge:
          'Lorem ipsum odor amet, consectetuer adipiscing elit. Diam tempor neque nibh; placerat lacus libero facilisi primis platea. Quam adipiscing nisl ultricies vulputate diam. Nullam quisque sodales fermentum per vel per. Lobortis lobortis quisque sit est, sapien accumsan est. Augue duis bibendum gravida praesent vehicula nullam venenatis volutpat.\nljdfghldjkfgh\nThingsEtc',
        mitigationPlan:
          'Turpis vivamus metus sit rutrum volutpat nec. Dolor faucibus curae ridiculus ultricies congue. Velit arcu ad; adipiscing sollicitudin velit efficitur tempor. Luctus cras efficitur mattis, fringilla magna integer mattis inceptos gravida. Vel mauris velit urna habitasse id; a taciti? Ante habitasse praesent pulvinar felis aenean a cubilia. Himenaeos senectus aptent mollis; fringilla dui velit consectetur. Et natoque fringilla ultricies lacus porttitor dictum. Arcu nec pretium orci ac diam cras habitasse bibendum. asdfasdf',
      },
      {
        challenge:
          "The headphones were on. They had been utilized on purpose. She could hear her mom yelling in the background, but couldn't make out exactly what the yelling was about. That was exactly why she had put them on. She knew her mom would enter her room at any minute, and she could pretend that she hadn't heard any of the previous yelling.\nBenny was tired. Not the normal every day tired from a hard day o work. The exhausted type of tired where you're surprised your body can even move. All he wanted to do was sit in front of the TV, put his feet up on the coffee table, and drink a beer. The only issue was that he had forgotten where he lived.\nThe alarm went off and Jake rose awake. Rising early had become a daily ritual, one that he could not fully explain. From the outside, it was a wonder that he was able to get up so early each morning for someone who had absolutely no plans to be productive during the entire day.",
        mitigationPlan:
          "The headphones were on. They had been utilized on purpose. She could hear her mom yelling in the background, but couldn't make out exactly what the yelling was about. That was exactly why she had put them on. She knew her mom would enter her room at any minute, and she could pretend that she hadn't heard any of the previous yelling.\nBenny was tired. Not the normal every day tired from a hard day o work. The exhausted type of tired where you're surprised your body can even move. All he wanted to do was sit in front of the TV, put his feet up on the coffee table, and drink a beer. The only issue was that he had forgotten where he lived.\nThe alarm went off and Jake rose awake. Rising early had become a daily ritual, one that he could not fully explain. From the outside, it was a wonder that he was able to get up so early each morning for someone who had absolutely no plans to be productive during the entire day.",
      },
    ],
    modifiedBy: 324,
    modifiedTime: '2025-04-09T20:20:24.313071Z',
    submittedBy: 88,
    submittedTime: '2025-04-09T20:42:50.679148Z',
    projectMetrics: [
      {
        id: 7,
        name: 'Bird species',
        description: 'some description',
        component: 'Biodiversity',
        type: 'Impact',
        reference: '1.2',
        isPublishable: false,
      },
      {
        id: 8,
        name: 'Ponds created',
        description: 'total number',
        component: 'Biodiversity',
        type: 'Activity',
        reference: '2.4',
        isPublishable: false,
      },
    ],
    standardMetrics: [],
    systemMetrics: [
      {
        metric: 'Seeds Collected',
        description: 'Total seed count checked-into accessions.',
        component: 'Climate',
        type: 'Output',
        reference: '1.1',
        isPublishable: false,
        systemValue: 0,
        systemTime: '2025-04-09T20:42:50.682598Z',
        status: 'On-Track',
        underperformanceJustification:
          "The headphones were on. They had been utilized on purpose. She could hear her mom yelling in the background, but couldn't make out exactly what the yelling was about. That was exactly why she had put them on. She knew her mom would enter her room at any minute, and she could pretend that she hadn't heard any of the previous yelling.\nBenny was tired. Not the normal every day tired from a hard day o work. The exhausted type of tired where you're surprised your body can even move. All he wanted to do was sit in front of the TV, put his feet up on the coffee table, and drink a beer. The only issue was that he had forgotten where he lived.\nThe alarm went off and Jake rose awake. Rising early had become a daily ritual, one that he could not fully explain. From the outside, it was a wonder that he was able to get up so early each morning for someone who had absolutely no plans to be productive during the entire day.",
        progressNotes: 'asdff',
      },
      {
        metric: 'Seedlings',
        description:
          'Plants in the nursery, including those provided by partners, where available. Not applicable for mangrove projects (input 0).',
        component: 'Climate',
        type: 'Output',
        reference: '1.2',
        isPublishable: true,
        systemValue: 75,
        systemTime: '2025-04-09T20:42:50.682598Z',
        underperformanceJustification: 'Test 9',
      },
      {
        metric: 'Trees Planted',
        description: 'Total trees (and plants) planted in the field.',
        component: 'Climate',
        type: 'Output',
        reference: '1.3',
        isPublishable: true,
        systemValue: 0,
        systemTime: '2025-04-09T20:42:50.682598Z',
      },
      {
        metric: 'Species Planted',
        description: 'Total species of the plants/trees planted.',
        component: 'Climate',
        type: 'Output',
        reference: '1.4',
        isPublishable: true,
        systemValue: 0,
        systemTime: '2025-04-09T20:42:50.682598Z',
      },
      {
        metric: 'Mortality Rate',
        description: 'Mortality rate of plantings.',
        component: 'Climate',
        type: 'Outcome',
        reference: '2',
        isPublishable: true,
        systemValue: 0,
        systemTime: '2025-04-09T20:42:50.682598Z',
      },
    ],
  } as AcceleratorReport;

  const year = useMemo(() => {
    return report?.startDate?.split('-')[0];
  }, [report]);

  const reportName = report?.frequency === 'Annual' ? year : report?.quarter ? `${year}-${report?.quarter}` : '';

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

  return (
    <Box>
      <Box
        sx={{ background: theme.palette.TwClrBgSecondary }}
        padding={3.5}
        borderRadius={'8px'}
        display={'flex'}
        justifyContent='space-between'
      >
        <Typography fontSize='24px' fontWeight={600}>{`${strings.REPORT} (${reportName})`}</Typography>
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
          />
        )}
      </Box>
      <Box display='flex' marginTop={3}>
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
          <Typography marginTop={3}>{report.highlights}</Typography>
        </Card>
        <Card
          style={{
            borderRadius: '8px',
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
      {climateMetrics.length > 0 && (
        <Box width='100%'>
          <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
            {strings.CLIMATE}
          </Typography>

          <Card style={{ borderRadius: '8px' }}>
            <Box display='flex' flexWrap='wrap'>
              {climateMetrics?.map((metric, index) => (
                <MetricBox metric={metric} index={index} year={year} quarter={report.quarter} key={index} />
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

          <Card style={{ borderRadius: '8px' }}>
            <Box display='flex' flexWrap='wrap'>
              {biodiversityMetrics?.map((metric, index) => (
                <MetricBox metric={metric} index={index} year={year} quarter={report.quarter} key={index} />
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

          <Card style={{ borderRadius: '8px' }}>
            <Box display='flex' flexWrap='wrap'>
              {communityMetrics?.map((metric, index) => (
                <MetricBox metric={metric} index={index} year={year} quarter={report.quarter} key={index} />
              ))}
            </Box>
          </Card>
        </Box>
      )}
      <Box width='100%'>
        <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.ACHIEVEMENTS}
        </Typography>
        <Card
          style={{
            borderRadius: '8px',
          }}
        >
          <AchievementsBox report={report} projectId={'28'} noTitle />
        </Card>
      </Box>
      <Box width='100%'>
        <Typography fontSize={'20px'} fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.CHALLENGES_AND_MITIGATION_PLAN}
        </Typography>
        <Card
          style={{
            borderRadius: '8px',
          }}
        >
          <ChallengesMitigationBox report={report} projectId={'28'} noTitle />
        </Card>
      </Box>
    </Box>
  );
};

export default FunderReportView;
