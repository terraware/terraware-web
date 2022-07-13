import React, { useEffect } from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
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
}));

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
    </div>
  );
}
