import { Link } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import DoneIcon from '@material-ui/icons/Done';
import React from 'react';
import strings from 'src/strings';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';

const useStyles = makeStyles((theme) =>
  createStyles({
    submit: {
      color: theme.palette.neutral[800],
      textDecoration: 'underline',
      fontWeight: theme.typography.fontWeightMedium,
      marginLeft: theme.spacing(0.5),
    },
    second: {
      textDecoration: 'underline',
      fontWeight: theme.typography.fontWeightMedium,
      marginLeft: theme.spacing(2),
    },
  })
);

interface Props {
  isSendingToNursery: boolean;
  isSentToNursery: boolean;
  canSendToNursery: boolean;
  onSubmitHandler: () => void;
  handleCancel: () => void;
}

export default function NurseryButtons({
  isSendingToNursery,
  isSentToNursery,
  canSendToNursery,
  onSubmitHandler,
  handleCancel,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <>
      {canSendToNursery && !isSendingToNursery && !isSentToNursery && (
        <Link
          className={classes.submit}
          id='sendToNursery'
          href='#'
          onClick={(event: React.SyntheticEvent) => {
            preventDefaultEvent(event);
            onSubmitHandler();
          }}
        >
          {strings.SEND_TO_NURSERY}
        </Link>
      )}
      {(isSendingToNursery || isSentToNursery) && (
        <>
          {isSentToNursery && <DoneIcon fontSize='inherit' />}
          {isSendingToNursery && <img src='/assets/loading.gif' height={16} alt='loading' />}
          <Link
            className={classes.submit}
            id='sendToNursery'
            href='#'
            onClick={(event: React.SyntheticEvent) => {
              preventDefaultEvent(event);
            }}
          >
            {isSentToNursery ? strings.SENT_TO_NURSERY : strings.SENDING}
          </Link>
        </>
      )}
      {!canSendToNursery && !isSentToNursery && (
        <>
          <Link
            className={classes.submit}
            id='undoSendToNursery'
            href='#'
            onClick={(event: React.SyntheticEvent) => {
              preventDefaultEvent(event);
              handleCancel();
            }}
          >
            {strings.UNDO_SEND_TO_NURSERY}
          </Link>
          <Link className={classes.second} id='goToDatabase' href='/accessions'>
            {strings.GO_TO_DATABASE}
          </Link>
        </>
      )}
    </>
  );
}
