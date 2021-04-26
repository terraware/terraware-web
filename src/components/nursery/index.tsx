import DayJSUtils from '@date-io/dayjs';
import { Chip, Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import dayjs from 'dayjs';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { Accession } from '../../api/types/accessions';
import { Germination, GerminationTest } from '../../api/types/tests';
import timeSelector from '../../state/selectors/time';
import strings from '../../strings';
import Divisor from '../common/Divisor';
import SummaryBox from '../common/SummaryBox';
import Table from '../common/table';
import { descendingComparator } from '../common/table/sort';
import { TableRowType } from '../common/table/TableCellRenderer';
import NewTest from './NewTest';
import NurseryCellRenderer from './TableCellRenderer';
import { COLUMNS } from './types';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
    },
    right: {
      marginLeft: 'auto',
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
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

export default function Nursery({ accession, onSubmit }: Props): JSX.Element {
  const classes = useStyles();
  const date = useRecoilValue(timeSelector);

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const [open, setOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<GerminationTest>();

  const onEdit = (row: TableRowType) => {
    setSelectedRecord(row as GerminationTest);
    setOpen(true);
  };

  const onNew = () => {
    setSelectedRecord(undefined);
    setOpen(true);
  };

  const onCloseModal = (value?: GerminationTest | undefined) => {
    if (value) {
      const newGerminationTests = !accession.germinationTests
        ? []
        : [...accession.germinationTests];

      if (selectedRecord) {
        const index = newGerminationTests.findIndex(
          (test) => test.id === selectedRecord.id
        );
        newGerminationTests.splice(index, 1, value);
      } else {
        newGerminationTests.push(value);
      }

      accession.germinationTests = newGerminationTests;
      onSubmit(accession);
    }
    setOpen(false);
  };

  const onDelete = (value: GerminationTest) => {
    const newGerminationsTests =
      accession?.germinationTests?.filter(
        (germination) => germination !== value
      ) ?? [];
    accession.germinationTests = newGerminationsTests;
    onSubmit(accession);
    setOpen(false);
  };

  const getNurseryRows = (): GerminationTest[] => {
    const nurseryTests = accession.germinationTests?.filter(
      (germinationTest) => germinationTest.testType === 'Nursery'
    );
    return nurseryTests ?? [];
  };

  const getTotalScheduled = (): number | undefined => {
    const total = accession.germinationTests?.reduce(
      (acum, germinationTest) => {
        if (
          germinationTest.testType === 'Nursery' &&
          dayjs(germinationTest.startDate).isAfter(date)
        ) {
          acum += germinationTest.seedsSown || 0;
        }
        return acum;
      },
      0
    );
    return total;
  };

  const total = getTotalScheduled();
  return (
    <main>
      <MuiPickersUtilsProvider utils={DayJSUtils}>
        <NewTest
          open={open}
          onClose={onCloseModal}
          onDelete={onDelete}
          value={selectedRecord}
        />
        <Paper className={classes.paper}>
          <Typography variant='h6' className={classes.bold}>
            {strings.NURSERY}
          </Typography>
          <Typography component='p'>{strings.NURSERY_DESCRIPTION}</Typography>
          <Divisor />
          <Grid container spacing={4}>
            {total && (
              <Grid item xs={6}>
                <SummaryBox
                  id='scheduledForTesting'
                  title={strings.SCHEDULED_FOR_TESTING}
                  value={strings
                    .formatString(strings.SCHEDULED_SEEDS, total)
                    .toString()}
                  variant='default'
                />
              </Grid>
            )}
            <Grid item xs={total ? 6 : 12}>
              <SummaryBox
                id='mostRecentViabiliy'
                title={strings.MOST_RECENT_PERCENTAGE_VIABILITY}
                value={`${accession.latestViabilityPercent ?? 0}%`}
                variant='default'
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                columns={COLUMNS}
                rows={getNurseryRows()}
                orderBy='date'
                Renderer={NurseryCellRenderer}
                onSelect={onEdit}
                sortComparator={sortComparator}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item className={classes.right}>
              <Chip
                id='newTest'
                className={classes.greenChip}
                label={strings.NEW_TEST}
                clickable
                deleteIcon={<AddIcon classes={newWithdrawalChipStyles()} />}
                color={'primary'}
                onClick={onNew}
                onDelete={onNew}
              />
            </Grid>
          </Grid>
        </Paper>
      </MuiPickersUtilsProvider>
    </main>
  );
}

function sortComparator(
  a: GerminationTest,
  b: GerminationTest,
  orderBy: any
): 1 | -1 | 0 {
  if (orderBy === 'recordingDate' || orderBy === 'seedsGerminated') {
    const aValue = a.germinations
      ? a.germinations[0][orderBy as keyof Germination]
      : 0;
    const bValue = b.germinations
      ? b.germinations[0][orderBy as keyof Germination]
      : 0;

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
