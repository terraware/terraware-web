import { createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import strings from 'src/strings';
import Select from './Select/Select';

const useStyles = makeStyles((theme) =>
  createStyles({
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    title: {
      fontWeight: 600,
      fontSize: 24,
      color: 'gray',
    },
    selectedSection: {
      color: 'black',
      paddingLeft: '5px',
    },
    separator: {
      height: '32px',
      width: '1px',
      backgroundColor: 'gray',
      marginLeft: '10px',
    },
    titleLabel: {
      fontSize: '16px',
      paddingLeft: '16px',
      paddingRight: '8px',
    },
  })
);

interface TitleProps {
  page: string;
  parentPage: string;
}
export default function Title({ page, parentPage }: TitleProps): JSX.Element {
  const classes = useStyles();
  return (
    <div className={classes.titleContainer}>
      <div className={classes.title}>
        {parentPage} / <span className={classes.selectedSection}>{page}</span>
      </div>
      <div className={classes.separator} />
      <label className={classes.titleLabel}>{strings.PROJECT}</label>
      <Select />
      <label className={classes.titleLabel}>{strings.SITE}</label>
      <Select />
    </div>
  );
}
