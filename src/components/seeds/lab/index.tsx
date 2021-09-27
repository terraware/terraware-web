import MomentUtils from '@date-io/moment';
import { Chip, Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import moment from 'moment';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { Accession } from '../../../api/types/accessions';
import { Germination, GerminationTest } from '../../../api/types/tests';
import timeSelector from '../../../state/selectors/time';
import strings from '../../../strings';
import Divisor from '../../common/Divisor';
import SummaryBox from '../../common/SummaryBox';
import Table from '../../common/table';
import { TableRowType } from '../../common/table/TableCellRenderer';
import CutTestCellRenderer from './CutTestCellRenderer';
import EnhancedTableDetails from './EnhacedTableDetails';
import NewCutTest from './NewCutTest';
import NewGermination from './NewGermination';
import NewTest from './NewTest';
import LabCellRenderer from './TableCellRenderer';
import { CUT_TEST_COLUMNS, TEST_COLUMNS, TEST_ENTRY_COLUMNS } from './types';

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

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const [testOpen, setTestOpen] = React.useState(false);
  const [testEntryOpen, setTestEntryOpen] = React.useState(false);
  const [cutTestOpen, setCutTestOpen] = React.useState(false);
  const [selectedTest, setSelectedTest] = React.useState<GerminationTest>();
  const allowTestInGrams = Boolean(accession.processingMethod === 'Weight');
  const seedsAvailable = accession.remainingQuantity?.quantity ?? 0;
  const [selectedTestEntry, setSelectedTestEntry] =
    React.useState<Germination>();
  const date = useRecoilValue(timeSelector);

  const getTotalScheduled = (): number => {
    const totalS = accession.germinationTests?.reduce(
      (acum, germinationTest) => {
        if (
          germinationTest.testType === 'Lab' &&
          moment(germinationTest.startDate).isAfter(date)
        ) {
          acum += germinationTest.seedsSown || 0;
        }

        return acum;
      },
      0
    );

    return totalS || 0;
  };

  const labRows =
    accession.germinationTests?.filter(
      (germinationTest) => germinationTest.testType === 'Lab'
    ) || [];

  const onEditTest = (row: TableRowType) => {
    setSelectedTest(row as GerminationTest);
    setTestOpen(true);
  };

  const onEditTestEntry = (row: TableRowType, parentRow: TableRowType) => {
    setSelectedTestEntry(row as Germination);
    setSelectedTest(parentRow as GerminationTest);
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
    setSelectedTest(parentRow as GerminationTest);
    setSelectedTestEntry(undefined);
    setTestEntryOpen(true);
  };

  const onCloseCutTestModal = (value?: Accession) => {
    if (value) {
      onSubmit(value);
    }
    setCutTestOpen(false);
  };

  const onCloseTestModal = (value?: GerminationTest | undefined) => {
    if (value) {
      const newGerminationTests = !accession.germinationTests
        ? []
        : [...accession.germinationTests];

      if (selectedTest) {
        const germinationTestIndex = newGerminationTests.findIndex(
          (germinationTest) => germinationTest.id === selectedTest.id
        );
        newGerminationTests.splice(germinationTestIndex, 1, value);
      } else {
        newGerminationTests.push(value);
      }
      accession.germinationTests = newGerminationTests;
      onSubmit(accession);
    }
    setTestOpen(false);
  };

  const onCloseTestEntryModal = (value?: Germination | undefined) => {
    if (selectedTest && value) {
      const newGerminations = !selectedTest?.germinations
        ? []
        : [...selectedTest.germinations];

      if (selectedTestEntry) {
        const germinationIndex = newGerminations.findIndex(
          (germination) => germination === selectedTestEntry
        );
        newGerminations.splice(germinationIndex, 1, value);
      } else {
        newGerminations.push(value);
      }

      const newGerminationTest = {
        ...selectedTest,
        germinations: newGerminations,
      };

      onCloseTestModal(newGerminationTest);
    }
    setTestEntryOpen(false);
  };

  const onDeleteTest = (value: GerminationTest) => {
    const newGerminationsTests =
      accession?.germinationTests?.filter(
        (germination) => germination !== value
      ) ?? [];
    accession.germinationTests = newGerminationsTests;
    onSubmit(accession);
    setTestOpen(false);
  };

  const onDeleteTestEntry = (value: Germination) => {
    if (selectedTest && selectedTest.germinations) {
      const newGerminations =
        selectedTest.germinations.filter(
          (germination) => germination !== value
        ) ?? [];

      const newGerminationTest = {
        ...selectedTest,
        germinations: newGerminations,
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
      <MuiPickersUtilsProvider utils={MomentUtils}>
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
        <NewCutTest
          open={cutTestOpen}
          onClose={onCloseCutTestModal}
          accession={accession}
        />
        <Paper className={classes.paper}>
          <Typography variant='h6' className={classes.bold}>
            {strings.LAB}
          </Typography>
          <Typography component='p'>{strings.LAB_DESCRIPTION}</Typography>
          <Divisor />
          <Grid container spacing={4}>
            {Boolean(total) && (
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
                id='lab-table'
                columns={TEST_COLUMNS}
                rows={labRows}
                orderBy='date'
                Renderer={LabCellRenderer}
                onSelect={onEditTest}
                DetailsRenderer={({ row, index }) => (
                  <EnhancedTableDetails
                    accessionId={accession.accessionNumber ?? ''}
                    row={row}
                    index={index}
                    rowName='germinations'
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
                deleteIcon={<AddIcon classes={newWithdrawalChipStyles()} />}
                color={'primary'}
                onClick={onNewTest}
                onDelete={onNewTest}
              />
            </Grid>
          </Grid>
          <Grid container justify='center' alignItems='center' spacing={4}>
            <Grid item xs={11}>
              <Typography variant='h6' className={classes.bold}>
                {strings.CUT_TEST}
              </Typography>
            </Grid>
          </Grid>
          <Grid container justify='center' alignItems='center' spacing={4}>
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
        </Paper>
      </MuiPickersUtilsProvider>
    </main>
  );
}
