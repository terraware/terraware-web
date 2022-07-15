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
import { TableRowType } from 'src/components/common/table/TableCellRenderer';
import MainPaper from 'src/components/MainPaper';
import PanelTitle from 'src/components/PanelTitle';
import strings from 'src/strings';
import CutTestCellRenderer from './CutTestCellRenderer';
import EnhancedTableDetails from './EnhacedTableDetails';
import NewCutTest from './NewCutTest';
import NewGermination from './NewGermination';
import NewTest from './NewTest';
import LabCellRenderer from './TableCellRenderer';
import { CUT_TEST_COLUMNS, TEST_COLUMNS, TEST_ENTRY_COLUMNS } from './types';
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
  const [testOpen, setTestOpen] = useState(false);
  const [testEntryOpen, setTestEntryOpen] = useState(false);
  const [cutTestOpen, setCutTestOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ViabilityTest>();
  const allowTestInGrams = Boolean(accession.processingMethod === 'Weight');
  const seedsAvailable = accession.remainingQuantity?.quantity ?? 0;
  const [selectedTestEntry, setSelectedTestEntry] = useState<ViabilityTestResult>();
  const [date, setDate] = useState<number>();
  const [labRows, setLabRows] = useState<ViabilityTest[]>();

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
    setLabRows(accession.viabilityTests?.filter((viabilityTest) => viabilityTest.testType === 'Lab'));
  }, [accession]);

  const getTotalScheduled = (): number => {
    const totalS = accession.viabilityTests?.reduce((acum, viabilityTest) => {
      if (viabilityTest.testType === 'Lab' && moment(viabilityTest.startDate).isAfter(date)) {
        acum += viabilityTest.seedsSown || 0;
      }

      return acum;
    }, 0);

    return totalS || 0;
  };

  const onEditTest = (row: TableRowType) => {
    setSelectedTest(row as ViabilityTest);
    setTestOpen(true);
  };

  const onEditTestEntry = (row: TableRowType, parentRow: TableRowType) => {
    setSelectedTestEntry(row as ViabilityTestResult);
    setSelectedTest(parentRow as ViabilityTest);
    setTestEntryOpen(true);
  };

  const onEditCutTest = () => {
    setCutTestOpen(true);
  };

  const onNewTest = () => {
    setSelectedTest(undefined);
    setTestOpen(true);
  };

  const onNewTestEntry = (parentRow: TableRowType) => {
    setSelectedTest(parentRow as ViabilityTest);
    setSelectedTestEntry(undefined);
    setTestEntryOpen(true);
  };

  const onCloseCutTestModal = (value?: Accession) => {
    if (value) {
      onSubmit(value);
    }
    setCutTestOpen(false);
  };

  const onCloseTestModal = (value?: ViabilityTest | undefined) => {
    if (value) {
      const newGerminationTests = !accession.viabilityTests ? [] : [...accession.viabilityTests];

      if (selectedTest) {
        const germinationTestIndex = newGerminationTests.findIndex(
          (germinationTest) => germinationTest.id === selectedTest.id
        );
        newGerminationTests.splice(germinationTestIndex, 1, value);
      } else {
        newGerminationTests.push(value);
      }
      accession.viabilityTests = newGerminationTests;
      onSubmit(accession);
    }
    setTestOpen(false);
  };

  const onCloseTestEntryModal = (value?: ViabilityTestResult | undefined) => {
    if (selectedTest && value) {
      const newGerminations = !selectedTest?.testResults ? [] : [...selectedTest.testResults];

      if (selectedTestEntry) {
        const germinationIndex = newGerminations.findIndex((germination) => germination === selectedTestEntry);
        newGerminations.splice(germinationIndex, 1, value);
      } else {
        newGerminations.push(value);
      }

      const newGerminationTest = {
        ...selectedTest,
        testResults: newGerminations,
      };

      onCloseTestModal(newGerminationTest);
    }
    setTestEntryOpen(false);
  };

  const onDeleteTest = (value: ViabilityTest) => {
    const newGerminationsTests = accession?.viabilityTests?.filter((germination) => germination !== value) ?? [];
    accession.viabilityTests = newGerminationsTests;
    onSubmit(accession);
    setTestOpen(false);
  };

  const onDeleteTestEntry = (value: ViabilityTestResult) => {
    if (selectedTest && selectedTest.testResults) {
      const newGerminations = selectedTest.testResults.filter((testResult) => testResult !== value) ?? [];

      const newGerminationTest = {
        ...selectedTest,
        testResults: newGerminations,
      };

      onCloseTestModal(newGerminationTest);
    }

    setTestEntryOpen(false);
  };

  const createCutTestRow = () => {
    const cutTest = {
      compromisedSeeds: accession.cutTestSeedsCompromised ?? '--',
      emptySeeds: accession.cutTestSeedsEmpty ?? '--',
      filledSeeds: accession.cutTestSeedsFilled ?? '--',
    };
    const cutTests = [];
    cutTests.push(cutTest);

    return cutTests;
  };

  const total = getTotalScheduled();

  return (
    <main>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <NewTest
          open={testOpen}
          onClose={onCloseTestModal}
          onDelete={onDeleteTest}
          value={selectedTest}
          allowTestInGrams={allowTestInGrams}
          seedsAvailable={seedsAvailable}
        />
        <NewGermination
          open={testEntryOpen}
          onClose={onCloseTestEntryModal}
          onDelete={onDeleteTestEntry}
          value={selectedTestEntry}
        />
        <NewCutTest open={cutTestOpen} onClose={onCloseCutTestModal} accession={accession} />
        <MainPaper>
          <PanelTitle title={strings.LAB} />
          <Typography component='p'>{strings.LAB_DESCRIPTION}</Typography>
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
                id='lab-table'
                columns={TEST_COLUMNS}
                rows={labRows || []}
                orderBy='date'
                Renderer={LabCellRenderer}
                onSelect={onEditTest}
                DetailsRenderer={({ row, index }) => (
                  <EnhancedTableDetails
                    accessionId={accession.id ?? ''}
                    row={row}
                    index={index}
                    rowName='testResults'
                    columns={TEST_ENTRY_COLUMNS}
                    defaultSort='recordingDate'
                    Renderer={LabCellRenderer}
                    expandText={strings.EDIT_NUMBER_OF_GERMINATED_SEEDS}
                    onClick={onNewTestEntry}
                    onSelect={onEditTestEntry}
                  />
                )}
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
                onClick={onNewTest}
                onDelete={onNewTest}
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={11}>
              <Typography variant='subtitle1' className={classes.bold}>
                {strings.CUT_TEST}
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={11} id='cutTest'>
              <Table
                columns={CUT_TEST_COLUMNS}
                rows={createCutTestRow()}
                orderBy='date'
                Renderer={CutTestCellRenderer}
                onSelect={onEditCutTest}
              />
            </Grid>
          </Grid>
        </MainPaper>
      </LocalizationProvider>
    </main>
  );
}
