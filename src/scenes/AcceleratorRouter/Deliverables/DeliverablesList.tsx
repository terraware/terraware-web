import React, { useMemo, useRef, useState } from 'react';

import { Grid, Typography } from '@mui/material';
import { Separator, TableColumnType } from '@terraware/web-components';

import DeliverablesTable from 'src/components/DeliverablesTable';
import PageHeader from 'src/components/PageHeader';
import ParticipantsDropdown from 'src/components/ParticipantsDropdown';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { useParticipants } from 'src/hooks/useParticipants';
import { useLocalization } from 'src/providers';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
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
          key: 'numDocuments',
          name: strings.DOCUMENTS,
          type: 'number',
        },
        {
          key: 'category',
          name: strings.CATEGORY,
          type: 'string',
        },
        {
          key: 'projectName',
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
  const contentRef = useRef(null);

  const [participantFilter, setParticipantFilter] = useState<{ participantId?: number }>({ participantId: undefined });

  const extraTableFilters: SearchNodePayload[] = useMemo(
    () =>
      participantFilter.participantId
        ? [
            {
              operation: 'field',
              field: 'participantId',
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
    <AcceleratorMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <PageHeader title={strings.DELIVERABLES} leftComponent={PageHeaderLeftComponent} />
      </PageHeaderWrapper>

      {/* -1 for "non-organization scoped search" IE admin search */}
      <DeliverablesTable
        columns={columns}
        extraTableFilters={extraTableFilters}
        isAcceleratorRoute={true}
        organizationId={-1}
        tableId={'acceleratorDeliverablesTable'}
      />
    </AcceleratorMain>
  );
};

export default DeliverablesList;
