import React, { useRef } from 'react';
import { useTheme, Grid, Typography } from '@mui/material';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';

type DetailsPageProps = {
  crumbs: Crumb[];
  title: string;
  children: React.ReactNode;
};

export default function DetailsPage({ crumbs, title, children }: DetailsPageProps): JSX.Element {
  const contentRef = useRef(null);
  const theme = useTheme();

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <BreadCrumbs crumbs={crumbs} hierarchical={true} />
        <Grid container>
          <Typography
            sx={{
              marginTop: theme.spacing(3),
              marginBottom: theme.spacing(4),
              paddingLeft: theme.spacing(3),
              fontSize: '20px',
              fontWeight: 600,
              color: theme.palette.TwClrBaseGray800,
            }}
          >
            {title}
          </Typography>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
        </Grid>
      </PageHeaderWrapper>
      <Grid container ref={contentRef}>
        {children}
      </Grid>
    </TfMain>
  );
}
