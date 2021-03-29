import DayJSUtils from '@date-io/dayjs';
import { Chip, Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Accession, AccessionWithdrawal } from '../../api/types/accessions';
import strings from '../../strings';
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
    grayChip: {
      backgroundColor: theme.palette.neutral[500],
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

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const seedsTotal = accession.effectiveSeedCount ?? 0;
  const seedsWithdrawn =
    accession.withdrawals?.reduce((acum, value) => {
      acum = acum + (value?.seedsWithdrawn ?? 0);
      return acum;
    }, 0) ?? 0;
  const seedsAvailable = accession.seedsRemaining ?? 0;

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

      if (selectedRecord) {
        const index = newWithdrawals.findIndex(
          (withdrawal) => withdrawal.id === selectedRecord.id
        );
        newWithdrawals.splice(index, 1, value);
      } else {
        newWithdrawals.push(value);
      }

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
            {strings.WITHDRAWAL}
          </Typography>
          <Typography component='p'>
            {strings.WITHDRAWAL_DESCRIPTION}
          </Typography>
          <Divisor />

          {seedsAvailable === 0 && (
            <>
              <Note>{strings.ALL_SEEDS_WITHDRAWN_MSG}</Note>
              <Divisor />
            </>
          )}

          <Grid container spacing={4}>
            <Grid item xs={4}>
              <SummaryBox
                id='total-seeds'
                title={strings.TOTAL_SEEDS}
                value={seedsTotal}
                variant='default'
              />
            </Grid>
            <Grid item xs={4}>
              <SummaryBox
                id='seeds-withdrawn'
                title={strings.SEEDS_WITHDRAWN}
                value={seedsWithdrawn}
                variant='default'
              />
            </Grid>
            <Grid item xs={4}>
              <SummaryBox
                id='seeds-available'
                title={strings.SEEDS_AVAILABLE}
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
                orderBy='date'
                Renderer={WithdrawalCellRenderer}
                onSelect={onEdit}
                sortComparator={sortComparator}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item className={classes.right}>
              <Chip
                id='new-withdrawal-button'
                className={
                  seedsAvailable > 0 ? classes.greenChip : classes.grayChip
                }
                label={strings.NEW_WITHDRAWAL}
                clickable={seedsAvailable > 0}
                deleteIcon={<AddIcon classes={newWithdrawalChipStyles()} />}
                color={seedsAvailable > 0 ? 'primary' : undefined}
                onClick={seedsAvailable > 0 ? onNewWithdrawal : undefined}
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
  { key: 'date', name: strings.DATE, type: 'date' },
  { key: 'quantity', name: strings.QUANTITY, type: 'string' },
  { key: 'destination', name: strings.DESTINATION, type: 'string' },
  { key: 'purpose', name: strings.PURPOSE, type: 'string' },
  { key: 'staffResponsible', name: strings.STAFF, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'notes' },
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
