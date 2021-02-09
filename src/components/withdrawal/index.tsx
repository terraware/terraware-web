import DayJSUtils from '@date-io/dayjs';
import { Chip, Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Accession, AccessionWithdrawal } from '../../api/types/accessions';
import Divisor from '../common/Divisor';
import Note from '../common/Note';
import SummaryBox from '../common/SummaryBox';
import Table from '../common/table';
import { descendingComparator } from '../common/table/sort';
import { TableColumnType } from '../common/table/types';
import NewWithdrawal from './NewWithdrawal';
import WithdrawalCellRenderer from './TableCellRenderer';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
    right: {
      marginLeft: 'auto',
    },
    greenChip: {
      color: theme.palette.common.white,
    },
  })
);

const newWithdrawalChipStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
  },
}));

interface Props {
  accession: Accession;
  onSubmit: (record: Accession) => void;
}

export default function WithdrawalView({
  accession,
  onSubmit,
}: Props): JSX.Element {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [
    selectedRecord,
    setSelectedRecord,
  ] = React.useState<AccessionWithdrawal>();

  const seedsTotal =
    accession.seedsCounted ?? accession.estimatedSeedCount ?? 0;
  const seedsWithdrawn =
    accession.withdrawals?.reduce((acum, value) => {
      acum = acum + (value?.seedsWithdrawn ?? 0);
      return acum;
    }, 0) ?? 0;
  const seedsAvailable = seedsTotal - seedsWithdrawn;

  const allowWithdrawalInGrams = Boolean(accession.estimatedSeedCount);

  const onEdit = (row: AccessionWithdrawal) => {
    setSelectedRecord(row);
    setOpen(true);
  };

  const onNewWithdrawal = () => {
    setSelectedRecord(undefined);
    setOpen(true);
  };

  const onCloseModal = (value?: AccessionWithdrawal) => {
    if (value) {
      const newWithdrawals = !accession.withdrawals
        ? []
        : [...accession.withdrawals];
      newWithdrawals.push(value);
      accession.withdrawals = newWithdrawals;
      onSubmit(accession);
    }
    setOpen(false);
  };

  const onDelete = (value: AccessionWithdrawal) => {
    const newWithdrawals =
      accession?.withdrawals?.filter((withdrawal) => withdrawal !== value) ??
      [];
    accession.withdrawals = newWithdrawals;
    onSubmit(accession);

    setOpen(false);
  };

  return (
    <main>
      <MuiPickersUtilsProvider utils={DayJSUtils}>
        <NewWithdrawal
          open={open}
          onClose={onCloseModal}
          onDelete={onDelete}
          seedsAvailable={seedsAvailable}
          value={selectedRecord}
          allowWithdrawalInGrams={allowWithdrawalInGrams}
        />
        <Paper className={classes.paper}>
          <Typography variant='h6' className={classes.bold}>
            Withdrawal
          </Typography>
          <Typography component='p'>Description</Typography>
          <Divisor />

          {seedsAvailable === 0 && (
            <>
              <Note>
                All seeds were withdrawn so new withdrawals are disable and the
                accession is automatically marked as Withdrawn and set to
                Inactive.
              </Note>
              <Divisor />
            </>
          )}

          <Grid container spacing={4}>
            <Grid item xs={4}>
              <SummaryBox
                title='Total seeds'
                value={seedsTotal}
                variant='default'
              />
            </Grid>
            <Grid item xs={4}>
              <SummaryBox
                title='Seeds withdrawn'
                value={seedsWithdrawn}
                variant='default'
              />
            </Grid>
            <Grid item xs={4}>
              <SummaryBox
                title='Seeds available'
                value={seedsAvailable}
                variant={seedsAvailable <= 0 ? 'zero' : 'available'}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                columns={COLUMNS}
                rows={accession.withdrawals ?? []}
                defaultSort='date'
                Renderer={WithdrawalCellRenderer}
                onSelect={onEdit}
                sorting={sortComparator}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item className={classes.right}>
              <Chip
                id='submit'
                className={classes.greenChip}
                label='New withdrawal'
                clickable
                deleteIcon={<AddIcon classes={newWithdrawalChipStyles()} />}
                color={seedsAvailable !== 0 ? 'primary' : undefined}
                onClick={onNewWithdrawal}
                onDelete={onNewWithdrawal}
              />
            </Grid>
          </Grid>
        </Paper>
      </MuiPickersUtilsProvider>
    </main>
  );
}

const COLUMNS: TableColumnType[] = [
  { key: 'date', name: 'Date', type: 'date' },
  { key: 'quantity', name: 'Quantity', type: 'string' },
  { key: 'destination', name: 'Destination', type: 'string' },
  { key: 'purpose', name: 'Purpose', type: 'string' },
  { key: 'staffResponsible', name: 'Staff', type: 'string' },
  { key: 'notes', name: 'Notes', type: 'notes' },
  { key: 'edit', name: '', type: 'edit' },
];

function sortComparator(
  a: AccessionWithdrawal,
  b: AccessionWithdrawal,
  orderBy: any
): 1 | -1 | 0 {
  if (orderBy === 'quantity') {
    const aValue = a.gramsWithdrawn
      ? `g ${a.gramsWithdrawn}g`
      : `s ${a.seedsWithdrawn} seeds`;
    const bValue = b.gramsWithdrawn
      ? `g ${b.gramsWithdrawn}g`
      : `s ${b.seedsWithdrawn} seeds`;

    if (bValue < aValue) {
      return -1;
    }
    if (bValue > aValue) {
      return 1;
    }
    return 0;
  }

  return descendingComparator(a, b, orderBy);
}
