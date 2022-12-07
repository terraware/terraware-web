import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';

export type CardProps = {
  children?: ReactNode;
  style?: object;
};

export default function Card({ children, style }: CardProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      borderRadius='24px'
      padding='24px'
      sx={{
        ...(style || {}),
        backgroundColor: theme.palette.TwClrBg,
      }}
    >
      {children}
    </Box>
  );
}
