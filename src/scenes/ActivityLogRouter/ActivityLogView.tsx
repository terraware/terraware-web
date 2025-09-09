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
  date: string;
  description: string;
  imageCount: number;
  imageURL: string;
  statusChanged?: boolean;
  statusDoNotUse: boolean;
  statusPublished?: boolean;
  statusVerified: boolean;
  type: string;
};

export type MockActivityStatus = 'Changed' | 'Do Not Use' | 'Not Verified' | 'Published' | 'Verified';

const MOCK_ACTIVITIES: MockActivity[] = [
  {
    date: '2025-07-22',
    description:
      'Trees planted in the north zone over a 2 week period that will need to be continually monitored over the next month or so...',
    imageCount: 1,
    imageURL: '',
    statusDoNotUse: false,
    statusVerified: false,
    type: 'Nursery Work',
  },
  {
    date: '2025-07-22',
    description:
      'Trees planted in the north zone over a 2 week period that will need to be continually monitored over the next month or so... ',
    imageCount: 12,
    imageURL: '',
    statusDoNotUse: false,
    statusPublished: true,
    statusVerified: true,
    type: 'Planting',
  },
  {
    date: '2025-07-21',
    description: 'Trees planted in the north zone',
    imageCount: 0,
    imageURL: '',
    statusDoNotUse: false,
    statusPublished: true,
    statusVerified: true,
    type: 'Site Visit',
  },
  {
    date: '2025-07-20',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    statusDoNotUse: false,
    statusPublished: true,
    statusVerified: true,
    type: 'Community Impact',
  },
  {
    date: '2025-07-17',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    statusChanged: true,
    statusDoNotUse: false,
    statusPublished: true,
    statusVerified: true,
    type: 'Planting',
  },
  {
    date: '2025-07-06',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    statusDoNotUse: true,
    statusVerified: false,
    type: 'Site Visit',
  },
  {
    date: '2025-06-24',
    description: 'Trees planted in the north zone',
    imageCount: 0,
    imageURL: '',
    statusDoNotUse: false,
    statusVerified: true,
    type: 'Seed Collection',
  },
  {
    date: '2025-06-21',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    statusDoNotUse: false,
    statusPublished: true,
    statusVerified: true,
    type: 'Planting',
  },
  {
    date: '2025-06-19',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    statusDoNotUse: false,
    statusPublished: true,
    statusVerified: true,
    type: 'Planting',
  },
  {
    date: '2025-06-07',
    description: 'Trees planted in the north zone',
    imageCount: 1,
    imageURL: '',
    statusDoNotUse: false,
    statusVerified: false,
    type: 'Planting',
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
          {activity.type}
        </Typography>
        <Box>
          {activity.statusChanged && <ActivityStatusBadge status='Changed' />}
          <ActivityStatusBadge status={activity.statusVerified ? 'Verified' : 'Not Verified'} />
          {activity.statusDoNotUse && <ActivityStatusBadge status='Do Not Use' />}
          {activity.statusPublished && <ActivityStatusBadge status='Published' />}
        </Box>
        <Typography>{activity.description}</Typography>
        <Typography sx={{ display: { xs: 'block', sm: 'none' } }}>{activity.date}</Typography>
      </Grid>

      <Grid item xs='auto' sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Typography>{activity.date}</Typography>
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
