import React, { useRef } from 'react';
import TfMain from 'src/components/common/TfMain';
import { Box, CircularProgress, Grid, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PageSnackbar from 'src/components/PageSnackbar';

export type PageProps = {
  content?: React.ReactNode;
  contentStyle?: Record<string, string | number>;
  isLoading?: boolean;
  title?: React.ReactNode;
  useBackground?: boolean;
};

const Page = ({ content, contentStyle, isLoading, title, useBackground }: PageProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);

  if (isLoading) {
    return (
      <TfMain>
        <CircularProgress sx={{ margin: 'auto' }} />
      </TfMain>
    );
  }

  return (
    <TfMain backgroundImageVisible={useBackground}>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid item xs={12} paddingLeft={theme.spacing(3)} marginBottom={theme.spacing(4)}>
          <Grid item xs={12} display={isMobile ? 'block' : 'flex'} alignItems='center'>
            {title}
          </Grid>
        </Grid>
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Box ref={contentRef} sx={contentStyle}>
        {content}
      </Box>
    </TfMain>
  );
};
export default Page;
