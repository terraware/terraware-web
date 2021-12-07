import { Box, Chip, DialogTitle, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilValue } from 'recoil';
import {downloadReport, ExportRequestPayload} from 'src/api/seeds/report';
import { searchParamsSelector } from 'src/state/selectors/seeds/search';
import strings from 'src/strings';
import CancelButton from '../../common/CancelButton';
import DialogCloseButton from '../../common/DialogCloseButton';
import TextField from '../../common/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
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
  })
);

interface DownloadReportModalProps {
  facilityId: number;
  open: boolean;
  onClose: () => void;
}

export default function DownloadReportModal(props: DownloadReportModalProps): JSX.Element {
  const classes = useStyles();
  const { facilityId, open, onClose } = props;
  const [name, setName] = React.useState('');

  const searchParams = useRecoilValue(searchParamsSelector);

  const handleCancel = () => {
    setName('');
    onClose();
  };

  const handleOk = async () => {
    const reportParams: ExportRequestPayload = {
      facilityId,
      fields: searchParams.fields,
      sortOrder: searchParams.sortOrder,
      search: searchParams.search,
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
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>
        <Typography component='p' variant='h6' className={classes.bold}>
          {strings.REPORT}
        </Typography>
        <Typography component='p'>{strings.DOWNLOAD_REPORT_DESCRIPTION}</Typography>
        <DialogCloseButton onClick={handleCancel} />
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
              label={strings.REPORT_NAME}
              aria-label='Report name'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='downloadButton'
              className={classes.submit}
              label={strings.DOWNLOAD}
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
