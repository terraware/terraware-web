import {
  Box,
  Chip,
  Collapse,
  createStyles,
  Grid,
  makeStyles,
  TableCell,
} from '@material-ui/core';
import grey from '@material-ui/core/colors/grey';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import { GerminationTest } from '../../api/types/tests';
import Divisor from '../common/Divisor';
import SummaryBox from '../common/SummaryBox';
import {
  descendingComparator,
  getComparator,
  Order,
  stableSort,
} from '../common/table/sort';
import { DetailsProps } from '../common/table/types';
import LabChart from './LabChart';

const useStyles = makeStyles((theme) =>
  createStyles({
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
      backgroundColor: grey[800],
      '&:hover': {
        backgroundColor: grey[800],
      },
    },
  })
);

export default function EnhancedTableDetails<T>({
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
  const [
    percentageTotalSeedsGerminated,
    setPercentageTotalSeedsGerminated,
  ] = React.useState(0);

  const calculateTotalSeedsGerminated = () => {
    let total = 0;
    const selectedTest = row as GerminationTest;

    if (selectedTest.germinations) {
      selectedTest.germinations.forEach((germination) => {
        total += germination.seedsGerminated;
      });
    }

    setTotalSeedsGerminated(total);
    if (selectedTest.seedsSown) {
      setPercentageTotalSeedsGerminated((total / selectedTest.seedsSown) * 100);
    }
  };

  React.useEffect(() => {
    calculateTotalSeedsGerminated();
  });

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
            }}
          >
            <CloseIcon />
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
                      title='Total seeds germinated'
                      value={`${totalSeedsGerminated} (${percentageTotalSeedsGerminated}%)`}
                      variant='full'
                    />
                  </Grid>
                  <Grid item xs={8}>
                    {row[rowName] && (
                      <LabChart
                        row={row}
                        rowName={rowName}
                        defaultSort={defaultSort}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Divisor></Divisor>
                  </Grid>
                  <Grid item xs={12}>
                    <Table
                      size='small'
                      aria-label='purchases'
                      id={`row${index + 1}-details`}
                    >
                      <TableBody>
                        {row[rowName] &&
                          stableSort(
                            row[rowName] as T[],
                            getComparator(order, orderBy, descendingComparator)
                          ).map((subRow, subRowIndex) => {
                            const onClick = onSelect
                              ? () => onSelect(subRow, row)
                              : undefined;
                            return (
                              <TableRow
                                id={`row${subRowIndex + 1}`}
                                key={subRowIndex}
                              >
                                {columns.map((column) => (
                                  <Renderer
                                    index={subRowIndex + 1}
                                    key={column.key}
                                    row={subRow as T}
                                    column={column}
                                    value={subRow[column.key]}
                                    onRowClick={onClick}
                                  />
                                ))}
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </Grid>
                  <Grid item xs={9}></Grid>
                  <Grid item xs={3}>
                    <Chip
                      id='newEntry'
                      label='New entry'
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
