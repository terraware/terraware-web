import {
  Box,
  Chip,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { downloadReport } from '../../api/downloadReport';
import { ExportRequestPayload } from '../../api/types/report';
import { searchParamsSelector } from '../../state/selectors/search';
import TextField from '../common/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    cancel: {
      backgroundColor: theme.palette.grey[200],
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
      flexDirection: 'row-reverse',
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  })
);

export interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DownloadReportModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [name, setName] = React.useState('');

  const searchParams = useRecoilValue(searchParamsSelector);

  const handleCancel = () => {
    setName('');
    onClose();
  };

  const handleOk = async () => {
    const reportParams: ExportRequestPayload = {
      fields: searchParams.fields,
      sortOrder: searchParams.sortOrder,
      filters: searchParams.filters,
    };

    const reponse = await downloadReport(reportParams);

    const csvContent = 'data:text/csv;charset=utf-8,' + reponse;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${name}.csv`);
    link.click();
    onClose();
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='sm'
    >
      <DialogTitle>
        <Typography component='p' variant='h6' className={classes.bold}>
          Report
        </Typography>
        <Typography component='p'>
          You are about to download this datatable as a report. This csv file
          can be found in your Downloads. Please name your report below.
        </Typography>
        <IconButton
          aria-label='close'
          className={classes.closeButton}
          onClick={handleCancel}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              id='reportName'
              value={name}
              onChange={(id, value) => {
                setName(value as string);
              }}
              label='Report name'
              aria-label='Report name'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <Chip
              id='cancel'
              className={classes.cancel}
              label='Cancel'
              clickable
              onClick={handleCancel}
            />
            <Chip
              id='downloadButton'
              className={classes.submit}
              label='Download'
              clickable
              color='primary'
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
