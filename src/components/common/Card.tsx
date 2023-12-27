import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type CardProps = {
  children?: ReactNode;
  style?: object;
  flushMobile?: boolean;
};

export default function Card({ children, style, flushMobile }: CardProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const flush = isMobile && flushMobile;

  return (
    <Box
      borderRadius={flush ? 0 : theme.spacing(3)}
      padding={3}
      margin={flush ? theme.spacing(0, -3) : 0}
      sx={{
        ...(style || {}),
        backgroundColor: theme.palette.TwClrBg,
      }}
    >
      {children}
    </Box>
  );
}
