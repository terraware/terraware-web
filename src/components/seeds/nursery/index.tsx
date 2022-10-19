import { Chip, Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { getDate } from 'src/api/clock';
import { Accession } from 'src/api/types/accessions';
import { ViabilityTestResult, ViabilityTest } from 'src/api/types/tests';
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
import { ServerOrganization } from 'src/types/Organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

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
  organization?: ServerOrganization;
}

export default function Nursery({ accession, onSubmit, organization }: Props): JSX.Element {
  const classes = useStyles();
  const [date, setDate] = useState<number>();
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ViabilityTest>();
  const allowTestInGrams = Boolean(accession.processingMethod === 'Weight');
  const seedsAvailable = accession.remainingQuantity?.quantity ?? 0;
  const [nurseryRows, setNurseryRows] = useState<ViabilityTest[]>();
  const isContributor = organization?.role === 'Contributor';
  const { isMobile } = useDeviceInfo();

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
    setNurseryRows(accession.viabilityTests?.filter((germinationTest: any) => germinationTest.testType === 'Nursery'));
  }, [accession]);

  const onEdit = (row: TableRowType) => {
    setSelectedRecord(row as ViabilityTest);
    setOpen(true);
  };

  const onNew = () => {
    setSelectedRecord(undefined);
    setOpen(true);
  };

  const onCloseModal = (value?: ViabilityTest | undefined) => {
    if (value) {
      const newGerminationTests = !accession.viabilityTests ? [] : [...accession.viabilityTests];

      if (selectedRecord) {
        const index = newGerminationTests.findIndex((test) => test.id === selectedRecord.id);
        newGerminationTests.splice(index, 1, value);
      } else {
        newGerminationTests.push(value);
      }

      accession.viabilityTests = newGerminationTests;
      onSubmit(accession);
    }
    setOpen(false);
  };

  const onDelete = (value: ViabilityTest) => {
    const newGerminationsTests = accession?.viabilityTests?.filter((germination: any) => germination !== value) ?? [];
    accession.viabilityTests = newGerminationsTests;
    onSubmit(accession);
    setOpen(false);
  };

  const getTotalScheduled = (): number => {
    const totali = accession.viabilityTests?.reduce((acum: any, germinationTest: any) => {
      if (germinationTest.testType === 'Nursery' && moment(germinationTest.startDate).isAfter(date)) {
        acum += germinationTest.seedsSown || 0;
      }

      return acum;
    }, 0);

    return totali || 0;
  };

  const total = getTotalScheduled();

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

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
              <Grid item xs={gridSize()}>
                <SummaryBox
                  id='scheduledForTesting'
                  title={strings.SCHEDULED_FOR_TESTING}
                  value={strings.formatString(strings.SCHEDULED_SEEDS, total).toString()}
                  variant='default'
                />
              </Grid>
            )}
            <Grid item xs={isMobile ? 12 : total ? 6 : 12}>
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
                disabled={seedsAvailable <= 0 || isContributor}
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

function sortComparator(a: ViabilityTest, b: ViabilityTest, orderBy: any): number {
  if (orderBy === 'recordingDate' || orderBy === 'seedsGerminated') {
    const aValue = a.testResults ? a.testResults[0][orderBy as keyof ViabilityTestResult] : 0;
    const bValue = b.testResults ? b.testResults[0][orderBy as keyof ViabilityTestResult] : 0;

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
