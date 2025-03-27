import React, { useCallback, useEffect } from 'react';

import { Box, useTheme } from '@mui/material';

import ReportStatusBadge from 'src/scenes/Reports/ReportStatusBadge';
import strings from 'src/strings';
import { AcceleratorReport } from 'src/types/AcceleratorReport';
import useSnackbar from 'src/utils/useSnackbar';

import InternalComment from '../../Documents/DocumentView/InternalComment';

export type MetadataProps = {
  report: AcceleratorReport;
};

const Metadata = (props: MetadataProps): JSX.Element => {
  const { report } = props;

  const snackbar = useSnackbar();
  const theme = useTheme();

  const onUpdateInternalComment = useCallback(() => {
    return true;
  }, []);

  useEffect(() => {
    if (status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    } else if (status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [status, snackbar]);

  return (
    <Box display='flex' flexDirection='column'>
      <Box border={`1px solid ${theme.palette.TwClrBaseGray100}`} borderRadius='8px' marginBottom='16px' padding='16px'>
        {report.status !== 'Needs Update' && (
          <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
            <ReportStatusBadge status={report.status} />
          </div>
        )}
        <InternalComment entity={report} update={onUpdateInternalComment} />
      </Box>
    </Box>
  );
};

export default Metadata;
