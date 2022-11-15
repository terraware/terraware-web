import { Box, Typography, useTheme } from '@mui/material';

export function useRenderFeature() {
  const theme = useTheme();

  return (data: any): JSX.Element => {
    const { type, id, fullName, name } = data;

    return (
      <Box>
        <Box display='flex' justifyContent='space-between'>
          <Typography>Type</Typography>
          <Typography marginLeft={theme.spacing(2)}>{type.toUpperCase()}</Typography>
        </Box>
        <Box display='flex' justifyContent='space-between'>
          <Typography>ID</Typography>
          <Typography marginLeft={theme.spacing(2)}>{id}</Typography>
        </Box>
        <Box display='flex' justifyContent='space-between'>
          <Typography>Name</Typography>
          <Typography marginLeft={theme.spacing(2)}>{fullName || name}</Typography>
        </Box>
      </Box>
    );
  };
}
