import { Chip, Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { getDate } from 'src/api/clock';
import { Accession } from 'src/api/types/accessions';
import { Germination, GerminationTest } from 'src/api/types/tests';
import Divisor from 'src/components/common/Divisor';
import SummaryBox from 'src/components/common/SummaryBox';
import Table from 'src/components/common/table';
import { descendingComparator } from 'src/components/common/table/sort';
import { TableRowType } from 'src/components/common/table/TableCellRenderer';
import MainPaper from 'src/components/MainPaper';
import PanelTitle from 'src/components/PanelTitle';
import strings from 'src/strings';
import NewTest from './NewTest';
import NurseryCellRenderer from './TableCellRenderer';
import { COLUMNS } from './types';
import { Add } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const useStyles = makeStyles((theme: Theme) => ({
  right: {
    marginLeft: 'auto',
  },
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
  greenChip: {
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

export default function Nursery({ accession, onSubmit }: Props): JSX.Element {
  const classes = useStyles();
  const [date, setDate] = useState<number>();
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GerminationTest>();
  const allowTestInGrams = Boolean(accession.processingMethod === 'Weight');
  const seedsAvailable = accession.remainingQuantity?.quantity ?? 0;
  const [nurseryRows, setNurseryRows] = useState<GerminationTest[]>();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const populateDate = async () => {
      const response = await getDate();
      setDate(response.serverTime ? response.serverTime : response.localTime);
    };
    populateDate();
  }, []);

  useEffect(() => {
    setNurseryRows(accession.germinationTests?.filter((germinationTest) => germinationTest.testType === 'Nursery'));
  }, [accession]);

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
      const newGerminationTests = !accession.germinationTests ? [] : [...accession.germinationTests];

      if (selectedRecord) {
        const index = newGerminationTests.findIndex((test) => test.id === selectedRecord.id);
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
    const newGerminationsTests = accession?.germinationTests?.filter((germination) => germination !== value) ?? [];
    accession.germinationTests = newGerminationsTests;
    onSubmit(accession);
    setOpen(false);
  };

  const getTotalScheduled = (): number => {
    const totali = accession.germinationTests?.reduce((acum, germinationTest) => {
      if (germinationTest.testType === 'Nursery' && moment(germinationTest.startDate).isAfter(date)) {
        acum += germinationTest.seedsSown || 0;
      }

      return acum;
    }, 0);

    return totali || 0;
  };

  const total = getTotalScheduled();

  return (
    <main>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <NewTest
          open={open}
          onClose={onCloseModal}
          onDelete={onDelete}
          value={selectedRecord}
          allowTestInGrams={allowTestInGrams}
          seedsAvailable={seedsAvailable}
        />
        <MainPaper>
          <PanelTitle title={strings.NURSERY} />
          <Typography component='p'>{strings.NURSERY_DESCRIPTION}</Typography>
          <Divisor />
          <Grid container spacing={4}>
            {Boolean(total) && (
              <Grid item xs={6}>
                <SummaryBox
                  id='scheduledForTesting'
                  title={strings.SCHEDULED_FOR_TESTING}
                  value={strings.formatString(strings.SCHEDULED_SEEDS, total).toString()}
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
                rows={nurseryRows || []}
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
                disabled={seedsAvailable <= 0}
                deleteIcon={<Add classes={newWithdrawalChipStyles()} />}
                color={'primary'}
                onClick={onNew}
                onDelete={onNew}
              />
            </Grid>
          </Grid>
        </MainPaper>
      </LocalizationProvider>
    </main>
  );
}

function sortComparator(a: GerminationTest, b: GerminationTest, orderBy: any): 1 | -1 | 0 {
  if (orderBy === 'recordingDate' || orderBy === 'seedsGerminated') {
    const aValue = a.germinations ? a.germinations[0][orderBy as keyof Germination] : 0;
    const bValue = b.germinations ? b.germinations[0][orderBy as keyof Germination] : 0;

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
