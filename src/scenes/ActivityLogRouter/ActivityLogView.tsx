import React, { useCallback, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Page from 'src/components/Page';
import PageHeaderProjectFilter from 'src/components/PageHeader/PageHeaderProjectFilter';
import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { SearchNodePayload } from 'src/types/Search';

import ActivityLogMapSplitView from './ActivityLogMapSplitView';
import ActivityStatusBadge from './ActivityStatusBadge';
import DateRange from './FilterDateRange';

type MockActivity = {
  activityDate: string;
  activityType: string;
  description: string;
  imageCount: number;
  imageURL: string;
  isChanged?: boolean;
  isDoNotUse?: boolean;
  isHighlight?: boolean;
  isPublished?: boolean;
  isVerified: boolean;
};

export type MockActivityStatus = 'Changed' | 'Do Not Use' | 'Not Verified' | 'Published' | 'Verified';

const MOCK_ACTIVITIES: MockActivity[] = [
  {
    activityDate: '2025-07-22',
    description:
      'Trees planted in the north zone over a 2 week period that will need to be continually monitored over the next month or so...',
    imageCount: 1,
    imageURL: '',
    isDoNotUse: false,
    isVerified: false,
    activityType: 'Nursery Work',
  },
  {
    activityDate: '2025-07-22',
    description:
      'Trees planted in the north zone over a 2 week period that will need to be continually monitored over the next month or so... ',
    imageCount: 12,
    imageURL: '',
    isDoNotUse: false,
    isPublished: true,
    isVerified: true,
    activityType: 'Planting',
  },
  {
    activityDate: '2025-07-21',
    description: 'Trees planted in the north zone',
    imageCount: 0,
    imageURL: '',
    isDoNotUse: false,
    isPublished: true,
    isVerified: true,
    activityType: 'Site Visit',
  },
  {
    activityDate: '2025-07-20',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    isDoNotUse: false,
    isPublished: true,
    isVerified: true,
    activityType: 'Community Impact',
  },
  {
    activityDate: '2025-07-17',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    isChanged: true,
    isDoNotUse: false,
    isPublished: true,
    isVerified: true,
    activityType: 'Planting',
  },
  {
    activityDate: '2025-07-06',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    isDoNotUse: true,
    isVerified: false,
    activityType: 'Site Visit',
  },
  {
    activityDate: '2025-06-24',
    description: 'Trees planted in the north zone',
    imageCount: 0,
    imageURL: '',
    isDoNotUse: false,
    isVerified: true,
    activityType: 'Seed Collection',
  },
  {
    activityDate: '2025-06-21',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    isDoNotUse: false,
    isPublished: true,
    isVerified: true,
    activityType: 'Planting',
  },
  {
    activityDate: '2025-06-19',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    isDoNotUse: false,
    isPublished: true,
    isVerified: true,
    activityType: 'Planting',
  },
  {
    activityDate: '2025-06-07',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    isDoNotUse: false,
    isVerified: false,
    activityType: 'Planting',
  },
];

const ActivityLogItem = ({ activity }: { activity: MockActivity }) => {
  const theme = useTheme();

  return (
    <Grid
      container
      paddingY={theme.spacing(2)}
      sx={{ borderBottom: '1px solid', borderColor: theme.palette.TwClrBrdrTertiary }}
    >
      <Grid item paddingRight={theme.spacing(2)} xs='auto'>
        {/* TODO: add image alt text & src */}
        <img alt='' src='https://placehold.co/100' />
      </Grid>

      <Grid item xs={true}>
        <Typography color={theme.palette.TwClrTxtBrand} fontSize='20px' fontWeight='600' lineHeight='28px'>
          {activity.activityType}
        </Typography>
        <Box>
          {activity.isChanged && <ActivityStatusBadge status='Changed' />}
          <ActivityStatusBadge status={activity.isVerified ? 'Verified' : 'Not Verified'} />
          {activity.isDoNotUse && <ActivityStatusBadge status='Do Not Use' />}
          {activity.isPublished && <ActivityStatusBadge status='Published' />}
        </Box>
        <Typography>{activity.description}</Typography>
        <Typography sx={{ display: { xs: 'block', sm: 'none' } }}>{activity.activityDate}</Typography>
      </Grid>

      <Grid item xs='auto' sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Typography>{activity.activityDate}</Typography>
      </Grid>
    </Grid>
  );
};

export default function ActivityLogView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { currentParticipantProject, allParticipantProjects, setCurrentParticipantProject } = useParticipantData();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});

  const onDeleteFilter = useCallback(
    (key: string) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    },
    [filters, setFilters]
  );

  const onFilterChange = useCallback(
    (key: string, filter: SearchNodePayload) => {
      if (filter.values.length) {
        setFilters({ ...filters, [key]: filter });
      } else {
        onDeleteFilter(key);
      }
    },
    [filters, onDeleteFilter, setFilters]
  );

  // const clearFilters = useCallback(() => setFilters({}), [setFilters]);

  const onChangeDateRange = useCallback(
    (filter: SearchNodePayload) => onFilterChange('dateRange', filter),
    [onFilterChange]
  );

  const onDeleteDateRange = useCallback(() => onDeleteFilter('dateRange'), [onDeleteFilter]);

  const handleAddActivity = useCallback(() => {
    // TODO: Implement add activity logic
  }, []);

  const PageHeaderLeftComponent = useMemo(
    () => (
      <PageHeaderProjectFilter
        allParticipantProjects={allParticipantProjects}
        currentParticipantProject={currentParticipantProject}
        projectFilter={projectFilter}
        setCurrentParticipantProject={setCurrentParticipantProject}
        setProjectFilter={setProjectFilter}
      />
    ),
    [allParticipantProjects, currentParticipantProject, projectFilter, setCurrentParticipantProject, setProjectFilter]
  );

  const PageHeaderRightComponent = useMemo(
    () => <Button icon='plus' label={strings.ADD_ACTIVITY} onClick={handleAddActivity} size='medium' />,
    [handleAddActivity, strings]
  );

  return (
    <Page
      hierarchicalCrumbs={false}
      leftComponent={PageHeaderLeftComponent}
      rightComponent={PageHeaderRightComponent}
      title={strings.ACTIVITY_LOG}
    >
      <Card
        style={{
          borderRadius: theme.spacing(1),
          padding: theme.spacing(2),
          width: '100%',
        }}
      >
        <ActivityLogMapSplitView
          topComponent={
            <DateRange
              field='dateRange'
              onChange={onChangeDateRange}
              onDelete={onDeleteDateRange}
              values={filters.dateRange?.values ?? []}
            />
          }
        >
          {MOCK_ACTIVITIES.map((activity, index) => (
            <ActivityLogItem key={index} activity={activity} />
          ))}
        </ActivityLogMapSplitView>
      </Card>
    </Page>
  );
}
