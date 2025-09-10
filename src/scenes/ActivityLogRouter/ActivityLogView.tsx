import React, { Fragment, useCallback, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Page from 'src/components/Page';
import PageHeaderProjectFilter from 'src/components/PageHeader/PageHeaderProjectFilter';
import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { Activity } from 'src/types/Activity';
import { SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ActivityLogMapSplitView from './ActivityLogMapSplitView';
import ActivityStatusBadge from './ActivityStatusBadge';
import DateRange from './FilterDateRange';

const MOCK_ACTIVITIES: Activity[] = [
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-22',
    description:
      'Trees planted in the north zone over a 2 week period that will need to be continually monitored over the next month or so...',
    id: 1,
    isHighlight: false,
    isVerified: false,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Nursery',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-22',
    description:
      'Trees planted in the north zone over a 2 week period that will need to be continually monitored over the next month or so... ',
    id: 2,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-21',
    description: 'Trees planted in the north zone',
    id: 3,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Site Visit',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-20',
    description: 'Trees planted in the north zone',
    id: 4,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-17',
    description: 'Trees planted in the north zone',
    id: 5,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-07-06',
    description: 'Trees planted in the north zone',
    id: 6,
    isHighlight: false,
    isVerified: false,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Site Visit',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-06-24',
    description: 'Trees planted in the north zone',
    id: 7,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Seed Collection',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-06-21',
    description: 'Trees planted in the north zone',
    id: 8,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-06-19',
    description: 'Trees planted in the north zone',
    id: 9,
    isHighlight: false,
    isVerified: true,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
    verifiedBy: 1,
    verifiedTime: '2025-07-22T10:00:00Z',
  },
  {
    createdBy: 1,
    createdTime: '2025-07-22T10:00:00Z',
    date: '2025-06-07',
    description: 'Trees planted in the north zone',
    id: 10,
    isHighlight: false,
    isVerified: false,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-07-22T10:00:00Z',
    type: 'Planting',
  },
];

const ActivityLogItem = ({ activity }: { activity: Activity }) => {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const coverPhoto = useMemo(() => activity.media.find((file) => file.isCoverPhoto), [activity.media]);

  const isChanged = useMemo(() => {
    return (
      activity.modifiedTime && activity.createdTime && new Date(activity.modifiedTime) > new Date(activity.createdTime)
    );
  }, [activity.modifiedTime, activity.createdTime]);

  return (
    <Grid
      container
      paddingY={theme.spacing(2)}
      sx={{ borderBottom: '1px solid', borderColor: theme.palette.TwClrBrdrTertiary }}
    >
      <Grid item paddingRight={theme.spacing(2)} xs='auto'>
        {/* TODO: add image src & alt text */}
        {coverPhoto ? (
          <img alt={coverPhoto.caption} src='https://placehold.co/100' />
        ) : (
          <img alt='' src='https://placehold.co/100' />
        )}
      </Grid>

      <Grid item xs={true}>
        <Typography color={theme.palette.TwClrTxtBrand} fontSize='20px' fontWeight='600' lineHeight='28px'>
          {activity.type}
        </Typography>

        <Box marginY={theme.spacing(1)}>
          {isChanged && <ActivityStatusBadge status='Changed' />}
          <ActivityStatusBadge status={activity.isVerified ? 'Verified' : 'Not Verified'} />
        </Box>

        <Typography>{activity.description}</Typography>
        {!isDesktop && <Typography>{activity.date}</Typography>}
      </Grid>

      {isDesktop && (
        <Grid item xs='auto'>
          <Typography>{activity.date}</Typography>
        </Grid>
      )}
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

  // group activities by quarter and year
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};

    MOCK_ACTIVITIES.forEach((activity) => {
      const date = new Date(activity.date);
      const year = date.getFullYear();
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      const quarterKey = strings.formatString(strings.QUARTER_YEAR, quarter, year)?.toString() || '';

      if (!groups[quarterKey]) {
        groups[quarterKey] = [];
      }
      groups[quarterKey].push(activity);
    });

    // sort quarters in descending order (most recent first)
    const sortedQuarters = Object.keys(groups).sort((a, b) => {
      const [aQuarter, aYear] = a.split(' ');
      const [bQuarter, bYear] = b.split(' ');

      if (aYear !== bYear) {
        return parseInt(bYear, 10) - parseInt(aYear, 10);
      }
      return parseInt(bQuarter.substring(1), 10) - parseInt(aQuarter.substring(1), 10);
    });

    // sort activities within each quarter by date (most recent first)
    sortedQuarters.forEach((quarterKey) => {
      groups[quarterKey].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return sortedQuarters.map((quarterKey) => ({
      quarter: quarterKey,
      activities: groups[quarterKey],
    }));
  }, [strings]);

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
          {groupedActivities.map(({ quarter, activities }) => (
            <Fragment key={quarter}>
              <Typography
                color={theme.palette.TwClrTxt}
                fontSize='20px'
                fontWeight={600}
                lineHeight='28px'
                marginY={theme.spacing(1)}
              >
                {quarter}
              </Typography>

              {activities.map((activity, index) => (
                <ActivityLogItem key={`${quarter}-${index}`} activity={activity} />
              ))}
            </Fragment>
          ))}
        </ActivityLogMapSplitView>
      </Card>
    </Page>
  );
}
