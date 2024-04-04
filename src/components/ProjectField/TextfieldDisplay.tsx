import { Box, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { ProjectIdFieldProps } from './';
import GridEntryWrapper from './GridEntryWrapper';

const TextfieldDisplay = ({ id, label, value }: ProjectIdFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper>
      <Box paddingX={theme.spacing(2)}>
        <Textfield id={id} display label={label!} type='text' value={value as string} />
      </Box>
    </GridEntryWrapper>
  );
};

export default TextfieldDisplay;
