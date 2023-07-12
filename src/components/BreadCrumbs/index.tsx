import React, { useRef } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import BackToLink from 'src/components/common/BackToLink';
import Link from 'src/components/common/Link';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';

export type Crumb = {
  name: string; // name of crumb
  to: string; // link to url/path
};

export type BreadCrumbsProps = {
  hierarchical?: boolean; // if true, the 'to' paths are hierarchical and concantenated, default is false (each 'to' is a fully qualified path)
  crumbs: Crumb[];
};

export default function BreadCrumbs({ hierarchical, crumbs }: BreadCrumbsProps): JSX.Element {
  const theme = useTheme();
  const breadCrumbs: Crumb[] =
    hierarchical !== true
      ? crumbs
      : // construct the absolute paths using concatenation of previous paths
        crumbs.reduce((acc, curr) => {
          const crumb = {
            name: curr.name,
            to: [...acc.map((_, i) => crumbs[i].to), curr.to].join(''),
          };
          return [...acc, crumb];
        }, [] as Crumb[]);

  return (
    <Box display='inline-flex' alignItems='center' flexWrap='wrap'>
      {breadCrumbs.map((crumb: Crumb, index: number) => (
        <Box key={index} display='inline-flex' alignItems='center'>
          {index === 0 ? (
            <BackToLink id={`crumb_${index}`} to={crumb.to} name={crumb.name} />
          ) : (
            <Link id={`crumb_${index}`} to={crumb.to}>
              {crumb.name}
            </Link>
          )}
          {index + 1 !== breadCrumbs.length && (
            <Typography fontSize='16px' fontWeight={500} lineHeight='24px' color={theme.palette.TwClrTxtTertiary}>
              &nbsp;/&nbsp;
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

type PageProps = {
  crumbs: Crumb[];
  title: string;
  children: React.ReactNode;
};

/**
 * A generic page structure with bread crumbs, title, header wrapper and instantiated children.
 */
export function Page({ crumbs, title, children }: PageProps): JSX.Element {
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
