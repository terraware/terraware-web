import React, { useMemo, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { Separator, TableColumnType } from '@terraware/web-components';

import DeliverablesTable from 'src/components/DeliverablesTable';
import Page from 'src/components/Page';
import PageHeader from 'src/components/PageHeader';
import ParticipantsDropdown from 'src/components/ParticipantsDropdown';
import { useParticipants } from 'src/hooks/useParticipants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import theme from 'src/theme';
import { SearchNodePayload } from 'src/types/Search';

const columns = (activeLocale: string | null): TableColumnType[] =>
  activeLocale
    ? [
        {
          key: 'name',
          name: strings.DELIVERABLE_NAME,
          type: 'string',
        },
        {
          key: 'type',
          name: strings.TYPE,
          type: 'string',
        },
        {
          key: 'documentCount',
          name: strings.DOCUMENTS,
          type: 'number',
        },
        {
          key: 'category',
          name: strings.CATEGORY,
          type: 'string',
        },
        {
          key: 'project_name',
          name: strings.PROJECT,
          type: 'string',
        },
        {
          key: 'status',
          name: strings.STATUS,
          type: 'string',
        },
      ]
    : [];

const DeliverablesList = () => {
  const { activeLocale } = useLocalization();
  const { availableParticipants } = useParticipants();

  const [participantFilter, setParticipantFilter] = useState<{ participantId?: number }>({ participantId: undefined });

  const extraTableFilters: SearchNodePayload[] = useMemo(
    () =>
      participantFilter.participantId
        ? [
            {
              operation: 'field',
              field: 'participant_id',
              type: 'Exact',
              values: [`${participantFilter.participantId}`],
            },
          ]
        : [],
    [participantFilter]
  );

  const PageHeaderLeftComponent = useMemo(
    () =>
      activeLocale ? (
        <>
          <Grid container sx={{ marginTop: theme.spacing(0.5) }}>
            <Grid item>
              <Separator height={'40px'} />
            </Grid>
            <Grid item>
              <Typography sx={{ lineHeight: '40px' }} component={'span'}>
                {strings.PARTICIPANT}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: theme.spacing(1.5) }}>
              <ParticipantsDropdown
                allowUnselect
                availableParticipants={availableParticipants}
                record={participantFilter}
                setRecord={setParticipantFilter}
                label={''}
              />
            </Grid>
          </Grid>
        </>
      ) : null,
    [activeLocale, availableParticipants, participantFilter]
  );

  return (
    <Page title={<PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />}>
      {/* -1 for "non-organization scoped search" IE admin search */}
      <DeliverablesTable columns={columns} extraTableFilters={extraTableFilters} organizationId={-1} />
    </Page>
  );
};

export default DeliverablesList;
