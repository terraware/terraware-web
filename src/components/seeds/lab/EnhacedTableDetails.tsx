import { Close } from '@mui/icons-material';
import { Box, Chip, Collapse, Grid, Table, TableBody, TableCell, TableRow, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { ViabilityTest } from 'src/api/types/tests';
import strings from 'src/strings';
import Divisor from '../../common/Divisor';
import SummaryBox from '../../common/SummaryBox';
import { descendingComparator, getComparator, Order, stableSort } from '../../common/table/sort';
import { DetailsProps } from '../../common/table/types';
import LabChart from './LabChart';

const useStyles = makeStyles((theme: Theme) => ({
  hover: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: `${theme.palette.neutral[100]}!important`,
    },
  },
  expander: {
    color: theme.palette.primary.main,
    textAlign: 'center',
    cursor: 'pointer',
    padding: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
  },
  close: {
    color: theme.palette.primary.main,
    textAlign: 'right',
    cursor: 'pointer',
    paddingBottom: 0,
    fontWeight: theme.typography.fontWeightBold,
    border: 'none',
  },
  newEntry: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.neutral[700],
    '&:hover': {
      backgroundColor: theme.palette.neutral[700],
    },
  },
}));

export default function EnhancedTableDetails<T>({
  accessionId,
  index,
  row,
  rowName,
  columns,
  defaultSort,
  Renderer,
  expandText,
  onClick,
  onSelect,
}: DetailsProps<T>): JSX.Element {
  const [order] = React.useState<Order>('asc');
  const [orderBy] = React.useState(defaultSort);

  const classes = useStyles();

  const [open, setOpen] = React.useState([false]);

  const [totalSeedsGerminated, setTotalSeedsGerminated] = React.useState(0);
  const [percentageTotalSeedsGerminated, setPercentageTotalSeedsGerminated] = React.useState('');

  const calculateTotalSeedsGerminated = () => {
    let total = 0;
    const selectedTest = row as unknown as ViabilityTest;

    if (selectedTest.testResults) {
      selectedTest.testResults.forEach((testResult) => {
        total += testResult.seedsGerminated;
      });
    }

    setTotalSeedsGerminated(total);
    if (selectedTest.seedsSown) {
      setPercentageTotalSeedsGerminated(((total / selectedTest.seedsSown) * 100).toFixed(1));
    }
  };

  React.useEffect(() => {
    calculateTotalSeedsGerminated();
  });

  React.useEffect(() => {
    const previousOpen = localStorage.getItem(`${accessionId}-lab-opened-entries`);
    if (previousOpen) {
      setOpen(JSON.parse(previousOpen));
    }
  }, [accessionId]);

  const hasEditColumn = columns.filter((c) => c.type === 'edit').length > 0;

  return (
    <>
      {!open[index] && (
        <TableRow>
          <TableCell
            id={`row${index + 1}-expand`}
            className={classes.expander}
            colSpan={12}
            onClick={() => {
              const prevOpens = [...open];
              prevOpens[index] = prevOpens[index] ? !prevOpens[index] : true;
              setOpen(prevOpens);
              localStorage.setItem(`${accessionId}-lab-opened-entries`, JSON.stringify(prevOpens));
            }}
          >
            {expandText}
          </TableCell>
        </TableRow>
      )}
      {open[index] && (
        <TableRow>
          <TableCell
            className={classes.close}
            colSpan={12}
            onClick={() => {
              const prevOpens = [...open];
              prevOpens[index] = prevOpens[index] ? !prevOpens[index] : true;
              setOpen(prevOpens);
              localStorage.setItem(`${accessionId}-lab-opened-entries`, JSON.stringify(prevOpens));
            }}
          >
            <Close />
          </TableCell>
        </TableRow>
      )}
      <>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
            <Collapse in={open[index]} timeout='auto' unmountOnExit>
              <Box margin={1}>
                <Grid container>
                  <Grid item xs={4}>
                    <SummaryBox
                      id='totalSeedsGerminated'
                      title={strings.TOTAL_SEEDS_GERMINATED}
                      value={`${totalSeedsGerminated} (${percentageTotalSeedsGerminated}%)`}
                      variant='full'
                    />
                  </Grid>
                  <Grid item xs={8}>
                    {row[rowName] && <LabChart row={row} rowName={rowName} defaultSort={defaultSort} />}
                  </Grid>
                  <Grid item xs={12}>
                    <Divisor />
                  </Grid>
                  <Grid item xs={12}>
                    <Table size='small' aria-label='purchases' id={`row${index + 1}-details`}>
                      <TableBody>
                        {row[rowName] &&
                          stableSort(row[rowName] as T[], getComparator(order, orderBy, descendingComparator)).map(
                            (subRow, subRowIndex) => {
                              const newOnClick = onSelect ? () => onSelect(subRow, row) : undefined;

                              return (
                                <TableRow
                                  id={`row${subRowIndex + 1}`}
                                  key={subRowIndex}
                                  classes={{ hover: classes.hover }}
                                  hover={Boolean(onSelect) && !hasEditColumn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (newOnClick && !hasEditColumn) {
                                      newOnClick();
                                    }
                                  }}
                                >
                                  {columns.map((column) => (
                                    <Renderer
                                      index={subRowIndex + 1}
                                      key={column.key}
                                      row={subRow as T}
                                      column={column}
                                      value={subRow[column.key]}
                                      onRowClick={newOnClick}
                                    />
                                  ))}
                                </TableRow>
                              );
                            }
                          )}
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid item xs={9} />
                  <Grid item xs={3}>
                    <Chip
                      id='newEntry'
                      label={strings.NEW_ENTRY}
                      clickable
                      onClick={() => onClick(row)}
                      color='secondary'
                      className={classes.newEntry}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    </>
  );
}
