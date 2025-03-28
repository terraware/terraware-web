import React, { useCallback } from 'react';

import { Box, useTheme } from '@mui/material';

import ReportStatusBadge from 'src/scenes/Reports/ReportStatusBadge';
import { AcceleratorReport } from 'src/types/AcceleratorReport';

import InternalComment from '../../Documents/DocumentView/InternalComment';

export type MetadataProps = {
  report: AcceleratorReport;
};

const Metadata = (props: MetadataProps): JSX.Element => {
  const { report } = props;

  const theme = useTheme();

  const onUpdateInternalComment = useCallback(() => {
    return true;
  }, []);

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
