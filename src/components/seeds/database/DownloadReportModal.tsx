import React from 'react';
import { convertToSearchNodePayload, searchCsv, SeedSearchCriteria, SeedSearchSortOrder } from 'src/api/seeds/search';
import { ServerOrganization } from 'src/types/Organization';

import CancelButton from 'src/components/common/CancelButton';
import DialogCloseButton from 'src/components/common/DialogCloseButton';
import TextField from 'src/components/common/TextField';
import strings from 'src/strings';
import { Dialog, DialogTitle, Typography, DialogContent, Grid, DialogActions, Box, Chip, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  submit: {
    '&:not(.mobile)': {
      marginLeft: theme.spacing(2),
    },
    '&.mobile': {
      marginTop: theme.spacing(1),
    },
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
  mobileButtons: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
}));

interface DownloadReportModalProps {
  searchCriteria: SeedSearchCriteria;
  searchSortOrder: SeedSearchSortOrder;
  searchColumns: string[];
  organization: ServerOrganization;
  open: boolean;
  onClose: () => void;
}

export default function DownloadReportModal(props: DownloadReportModalProps): JSX.Element {
  const classes = useStyles();
  const { searchCriteria, searchSortOrder, searchColumns, organization, open, onClose } = props;
  const [name, setName] = React.useState('');
  const { isMobile } = useDeviceInfo();

  const handleCancel = () => {
    setName('');
    onClose();
  };

  const handleOk = async () => {
    const apiResponse = await searchCsv({
      prefix: 'facilities.accessions',
      fields: searchColumns.includes('active')
        ? [...searchColumns, 'id', 'facility_name']
        : [...searchColumns, 'active', 'id', 'facility_name'],
      sortOrder: [searchSortOrder],
      search: convertToSearchNodePayload(searchCriteria, organization.id),
      count: 1000,
    });

    // TODO: show user error message if API call failed.
    if (apiResponse !== null) {
      const csvContent = 'data:text/csv;charset=utf-8,' + apiResponse;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${name}.csv`);
      link.click();
    }
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
          <Box className={isMobile ? classes.mobileButtons : ''}>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='downloadButton'
              className={`${classes.submit} ${isMobile ? 'mobile' : ''}`}
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
