import React, { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Container, Grid, useTheme } from '@mui/material';

import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';
import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

type Props = {
  children?: ReactNode;
  crumbs?: Crumb[];
  hierarchicalCrumbs?: boolean;
};

const ApplicationPage = ({ children, crumbs, hierarchicalCrumbs }: Props) => {
  const { goToHome } = useNavigateTo();
  const theme = useTheme();

  const { allApplications, selectedApplication, setSelectedApplication, reload } = useApplicationData();

  const pathParams = useParams<{ applicationId: string }>();
  const applicationId = Number(pathParams.applicationId);

  useEffect(() => {
    if (allApplications) {
      setSelectedApplication(applicationId);
    } else {
      reload();
    }
  }, [allApplications, applicationId, selectedApplication]);

  return (
    <TfMain>
      <PageHeader
        title={strings.APPLICATION}
        rightComponent={<Button label={strings.EXIT_APPLICATION} onClick={goToHome} priority={'ghost'} />}
      />
      <Grid container spacing={theme.spacing(1)}>
        <Grid item xs style={{ flexGrow: 1, padding: `${theme.spacing(2)} ${theme.spacing(4)}` }}>
          {crumbs && <BreadCrumbs crumbs={crumbs} hierarchical={hierarchicalCrumbs ?? true} />}
        </Grid>
      </Grid>

      <Container maxWidth={false} sx={{ padding: 0 }}>
        {children}
      </Container>
    </TfMain>
  );
};

export default ApplicationPage;
