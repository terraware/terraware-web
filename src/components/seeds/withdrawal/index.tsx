import { Chip, Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { Accession, AccessionWithdrawal } from 'src/api/types/accessions';
import MainPaper from 'src/components/MainPaper';
import PanelTitle from 'src/components/PanelTitle';
import strings from 'src/strings';
import Divisor from '../../common/Divisor';
import Note from '../../common/Note';
import SummaryBox from '../../common/SummaryBox';
import Table from '../../common/table';
import { descendingComparator } from '../../common/table/sort';
import { TableColumnType } from '../../common/table/types';
import InfoModal from './InfoModal';
import NewWithdrawal from './NewWithdrawal';
import WithdrawalCellRenderer from './TableCellRenderer';
import { Add } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    paddingBottom: theme.spacing(4),
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
}));

const newWithdrawalChipStyles = makeStyles((theme: Theme) => ({
  root: {
    color: theme.palette.common.white,
  },
}));

interface Props {
  accession: Accession;
  onSubmit: (record: Accession) => void;
}

export default function WithdrawalView({ accession, onSubmit }: Props): JSX.Element {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<AccessionWithdrawal>();
  const [openInfoModal, setOpenInfoModal] = React.useState(false);
  const [withdrawalRows, setWithdrawalRows] = React.useState<AccessionWithdrawal[]>();

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  React.useEffect(() => {
    setWithdrawalRows(accession.withdrawals);
  }, [accession]);

  const seedsTotal = accession.initialQuantity
    ? `${accession.initialQuantity?.quantity} ${accession.initialQuantity?.units}`
    : 0;
  const seedsWithdrawn = `${
    accession.totalPastWithdrawalQuantity ? accession.totalPastWithdrawalQuantity?.quantity.toFixed(1) : ''
  } ${accession.totalPastWithdrawalQuantity ? accession.totalPastWithdrawalQuantity?.units : ''}\r
   ${accession.totalScheduledWithdrawalQuantity ? accession.totalScheduledWithdrawalQuantity?.quantity : ''} ${
    accession.totalScheduledWithdrawalQuantity ? accession.totalScheduledWithdrawalQuantity?.units : ''
  } ${accession.totalScheduledWithdrawalQuantity ? strings.SCHEDULED : ''}`;
  const seedsAvailable = accession.remainingQuantity?.quantity || 0;

  const allowWithdrawalInWeight = Boolean(accession.processingMethod === 'Weight');

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
      const newWithdrawals = !accession.withdrawals ? [] : [...accession.withdrawals];

      if (selectedRecord) {
        const index = newWithdrawals.findIndex((withdrawal) => withdrawal.id === selectedRecord.id);
        newWithdrawals.splice(index, 1, value);
      } else {
        newWithdrawals.push(value);
      }

      accession.withdrawals = newWithdrawals;
      onSubmit(accession);
    }
    setOpen(false);
  };

  const onCloseInfoModal = () => {
    setOpenInfoModal(false);
  };

  const onOpenInfoModal = () => {
    setOpenInfoModal(true);
  };

  const isInactive = (row: AccessionWithdrawal) => {
    return row.purpose === 'Viability Testing';
  };

  const isClickable = (row: AccessionWithdrawal) => {
    return row.purpose !== 'Viability Testing';
  };

  const onDelete = (value: AccessionWithdrawal) => {
    const newWithdrawals = accession?.withdrawals?.filter((withdrawal) => withdrawal !== value) ?? [];
    accession.withdrawals = newWithdrawals;
    onSubmit(accession);

    setOpen(false);
  };

  const hasBothWithdrawals =
    accession.withdrawals?.some((withdrawal) => withdrawal.withdrawnQuantity?.units !== 'Seeds') &&
    accession.withdrawals?.some((withdrawal) => withdrawal.withdrawnQuantity?.units === 'Seeds');

  return (
    <main>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <NewWithdrawal
          open={open}
          onClose={onCloseModal}
          onDelete={onDelete}
          seedsAvailable={seedsAvailable}
          withdrawal={selectedRecord}
          allowWithdrawalInWeight={allowWithdrawalInWeight}
          accession={accession}
        />
        <InfoModal open={openInfoModal} onClose={onCloseInfoModal} />
        <MainPaper>
          <PanelTitle title={strings.WITHDRAWAL} />
          <Typography component='p'>{strings.WITHDRAWAL_DESCRIPTION}</Typography>
          <Divisor />

          {seedsAvailable === 0 && (
            <>
              <Note>{strings.ALL_SEEDS_WITHDRAWN_MSG}</Note>
              <Divisor />
            </>
          )}

          <Grid container spacing={4}>
            <Grid item xs={4}>
              <SummaryBox id='total-seeds' title={strings.INITIAL_SEEDS} value={seedsTotal} variant='default' />
            </Grid>
            <Grid item xs={4}>
              <SummaryBox
                id='seeds-withdrawn'
                title={strings.SEEDS_WITHDRAWN}
                value={seedsWithdrawn.trim() || 0}
                variant='default'
                icon={hasBothWithdrawals}
                onIconClick={onOpenInfoModal}
              />
            </Grid>
            <Grid item xs={4}>
              <SummaryBox
                id='seeds-available'
                title={strings.SEEDS_REMAINING}
                value={
                  accession.remainingQuantity
                    ? `${seedsAvailable} ${accession.remainingQuantity?.units}`
                    : seedsAvailable
                }
                variant={seedsAvailable <= 0 ? 'zero' : 'available'}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                columns={COLUMNS}
                rows={withdrawalRows || []}
                orderBy='date'
                Renderer={WithdrawalCellRenderer}
                onSelect={onEdit}
                sortComparator={sortComparator}
                isInactive={isInactive}
                isClickable={isClickable}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item className={classes.right}>
              <Chip
                id='new-withdrawal-button'
                className={seedsAvailable > 0 ? classes.greenChip : classes.grayChip}
                label={strings.NEW_WITHDRAWAL}
                clickable={seedsAvailable > 0}
                disabled={seedsAvailable <= 0}
                deleteIcon={<Add classes={newWithdrawalChipStyles()} />}
                color={seedsAvailable > 0 ? 'primary' : undefined}
                onClick={seedsAvailable > 0 ? onNewWithdrawal : undefined}
                onDelete={onNewWithdrawal}
              />
            </Grid>
          </Grid>
        </MainPaper>
      </LocalizationProvider>
    </main>
  );
}

const COLUMNS: TableColumnType[] = [
  { key: 'date', name: strings.DATE, type: 'date' },
  { key: 'quantity', name: strings.WITHDRAWN, type: 'string' },
  { key: 'seedsRemaining', name: strings.REMAINING, type: 'string' },
  { key: 'destination', name: strings.DESTINATION, type: 'string' },
  { key: 'purpose', name: strings.PURPOSE, type: 'string' },
  { key: 'staffResponsible', name: strings.STAFF, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'notes' },
];

function sortComparator(a: AccessionWithdrawal, b: AccessionWithdrawal, orderBy: any): 1 | -1 | 0 {
  if (orderBy === 'quantity') {
    const aValue =
      a.withdrawnQuantity?.units === 'Seeds'
        ? `s ${a.withdrawnQuantity?.quantity} seeds`
        : `g ${a.withdrawnQuantity?.grams}grams`;
    const bValue =
      b.withdrawnQuantity?.units === 'Seeds'
        ? `s ${b.withdrawnQuantity?.quantity} seeds`
        : `g ${b.withdrawnQuantity?.grams}grams`;

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
