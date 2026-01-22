import React, { type JSX, isValidElement, useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

type DataValue = string | number | null | undefined | JSX.Element;

const DataValueElement = ({ value, units }: { value: DataValue; units?: DataValue }) => {
  const hasValue = useMemo(() => !([undefined, null] as DataValue[]).includes(value), [value]);

  if (isValidElement(value)) {
    return value;
  }

  return (
    <Typography
      sx={{
        fontSize: '16px',
        lineHeight: '32px',
        fontWeight: 600,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {hasValue ? value : 'N/A'} {hasValue && units}
    </Typography>
  );
};

type ProjectDataDisplayProps = {
  height?: string;
  label?: string;
  md?: number;
  value?: DataValue;
  units?: DataValue;
  tooltip?: string;
};

const ProjectDataDisplay = ({ label, value, md, tooltip, units }: ProjectDataDisplayProps) => {
  const theme = useTheme();

  return (
    <Grid item xs={12} md={md || 3} height={'64px'} margin={`${theme.spacing(1)} 0`}>
      <Box paddingX={theme.spacing(2)}>
        <Typography
          sx={{
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: 400,
            marginBottom: theme.spacing(1),
          }}
        >
          {label}
          {tooltip && (
            <Tooltip title={tooltip} placement='top'>
              <Icon
                style={{ marginLeft: theme.spacing(1) }}
                name='info'
                size='small'
                fillColor={theme.palette.TwClrIcn}
              />
            </Tooltip>
          )}
        </Typography>
        <DataValueElement value={value} units={units} />
      </Box>
    </Grid>
  );
};

export default ProjectDataDisplay;
