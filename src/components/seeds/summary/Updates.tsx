import { CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { AccessionState } from 'src/api/types/accessions';
import { FieldNodePayload } from 'src/api/types/search';
import { SeedbankSummary } from 'src/api/seeds/summary';
import { searchFilterAtom } from 'src/state/atoms/seeds/search';
import strings from 'src/strings';

const useStyles = makeStyles(() =>
  createStyles({
    state: {
      fontWeight: 500,
      color: 'inherit',
    },
    alertCell: {
      paddingLeft: 0,
    },
  })
);

interface Props {
  summaryResponse?: SeedbankSummary;
  loading: boolean;
  error: boolean;
}

export default function Updates({ summaryResponse, error, loading }: Props): JSX.Element {
  const classes = useStyles();
  const updates = summaryResponse ? generateUpdates(summaryResponse) : undefined;

  const setFilters = useSetRecoilState(searchFilterAtom);

  const onClick = (state: AccessionState) => {
    const filter: FieldNodePayload = {
      field: 'state',
      values: [state],
      type: 'Exact',
      operation: 'field',
    };

    switch (state) {
      case 'Pending': {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        setFilters({
          state: filter,
          receivedDate: {
            field: 'receivedDate',
            values: [null, date.toISOString().substr(0, 10)],
            type: 'Range',
            operation: 'field',
          },
        });
        break;
      }
      case 'Processed': {
        const date = new Date();
        date.setDate(date.getDate() - 14);
        setFilters({
          state: filter,
          processingStartDate: {
            field: 'processingStartDate',
            values: [null, date.toISOString().substr(0, 10)],
            type: 'Range',
            operation: 'field',
          },
        });
        break;
      }
      case 'Withdrawn': {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        setFilters({
          state: filter,
          withdrawalDate: {
            field: 'withdrawalDate',
            values: [date.toISOString().substr(0, 10), new Date().toISOString().substr(0, 10)],
            type: 'Range',
            operation: 'field',
          },
        });
        break;
      }
      default:
        setFilters({ state: filter });
        break;
    }
  };

  return (
    <Table size='small'>
      <TableHead>
        <TableRow>
          <TableCell colSpan={2} className={classes.alertCell}>
            {strings.MOST_RECENT_STAGE_UPDATES}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {error && (
          <TableRow>
            <TableCell>{strings.GENERIC_ERROR}</TableCell>
          </TableRow>
        )}
        {loading && (
          <TableRow>
            <TableCell>
              <CircularProgress id='spinner-updates' />
            </TableCell>
          </TableRow>
        )}
        {updates &&
          updates.map(({ state, description }) => (
            <TableRow id={`update-row-${state}`} key={state}>
              <TableCell className={classes.alertCell}>
                <Link onClick={() => onClick(state)} id={`update-${state}`} to='/accessions' className={classes.state}>
                  {state}
                </Link>
              </TableCell>
              <TableCell>{description}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

interface Update {
  state: AccessionState;
  description: string | string[];
}

function generateUpdates(summaryResponse: SeedbankSummary): Update[] {
  const updates: Update[] = [
    {
      state: 'Pending',
      description: strings.formatString(strings.PENDING_UPDATES, summaryResponse.overduePendingAccessions.toString()),
    },
    {
      state: 'Processed',
      description: strings.formatString(
        strings.PROCESSED_UPDATES,
        summaryResponse.overdueProcessedAccessions.toString()
      ),
    },
    {
      state: 'Dried',
      description: strings.formatString(strings.DRIED_UPDATES, summaryResponse.overdueDriedAccessions.toString()),
    },
    {
      state: 'Withdrawn',
      description: strings.formatString(
        strings.WITHDRAWN_UPDATES,
        summaryResponse.recentlyWithdrawnAccessions.toString()
      ),
    },
  ];

  return updates;
}
