import React, { type JSX } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, Textfield } from '@terraware/web-components';

import VariableStatusBadge from 'src/components/Variables/VariableStatusBadge';
import strings from 'src/strings';
import {
  NonSectionVariableStatuses,
  UpdateVariableWorkflowDetailsPayload,
  VariableStatusType,
} from 'src/types/documentProducer/Variable';

type VariableWorkflowDetailsProps = {
  display?: boolean;
  setVariableWorkflowDetails: (details: UpdateVariableWorkflowDetailsPayload) => void;
  variableWorkflowDetails: UpdateVariableWorkflowDetailsPayload;
};

const VariableWorkflowDetails = ({
  display,
  setVariableWorkflowDetails,
  variableWorkflowDetails,
}: VariableWorkflowDetailsProps): JSX.Element => {
  const theme = useTheme();
  const formElementStyles = { margin: theme.spacing(1, 0) };

  return (
    <>
      <Grid item xs={12}>
        <Box
          sx={{
            border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            height: '1px',
            marginY: '16px',
            width: '100%',
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ marginBottom: '12px' }}>
          {display ? (
            <>
              <Typography sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px', marginBottom: '12px' }}>
                {strings.VARIABLE_STATUS}
              </Typography>
              <VariableStatusBadge status={variableWorkflowDetails.status} />
            </>
          ) : (
            <Dropdown
              fullWidth
              label={strings.VARIABLE_STATUS}
              onChange={(newValue: string) => {
                setVariableWorkflowDetails({
                  ...variableWorkflowDetails,
                  status: newValue as VariableStatusType,
                });
              }}
              options={NonSectionVariableStatuses.map((status) => ({
                label: status === 'Rejected' ? strings.UPDATE_REQUESTED : status,
                value: status,
              }))}
              selectedValue={variableWorkflowDetails?.status}
            />
          )}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Textfield
          display={display}
          id='internal-comments'
          label={strings.INTERNAL_COMMENTS}
          onChange={(newValue: any) => {
            setVariableWorkflowDetails({
              ...variableWorkflowDetails,
              internalComment: newValue,
            });
          }}
          sx={formElementStyles}
          type='textarea'
          value={variableWorkflowDetails?.internalComment}
        />
      </Grid>

      {variableWorkflowDetails?.status && ['Rejected', 'In Review'].includes(variableWorkflowDetails.status) && (
        <Grid item xs={12}>
          <Textfield
            display={display}
            id='feedback'
            label={strings.FEEDBACK}
            onChange={(newValue: any) => {
              setVariableWorkflowDetails({
                ...variableWorkflowDetails,
                feedback: newValue,
              });
            }}
            sx={formElementStyles}
            type='textarea'
            value={variableWorkflowDetails?.feedback}
          />
        </Grid>
      )}
    </>
  );
};

export default VariableWorkflowDetails;
