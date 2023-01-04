import { ReactNode } from 'react';
import { Box, useTheme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import FormBottomBar from './FormBottomBar';

export interface PageFormProps {
  children: ReactNode;
  cancelID: string;
  saveID: string;
  onCancel: () => void;
  onSave: () => void;
  cancelButtonText?: string;
  saveButtonText?: string;
  saveDisabled?: boolean;
  className?: string;
  hideEdit?: boolean;
}

export default function PageForm(props: PageFormProps): JSX.Element {
  const { children, className, hideEdit, ...bottomBarProps } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  return (
    <>
      <Box className={className} paddingBottom={hideEdit ? theme.spacing(4) : theme.spacing(isMobile ? 25 : 15)}>
        {children}
      </Box>
      {!hideEdit && <FormBottomBar {...bottomBarProps} />}
    </>
  );
}
