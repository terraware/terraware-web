import React from 'react';

import { Grid, useTheme } from '@mui/material';

import Page, { PageProps } from 'src/components/Page';

import ModuleTimeline from './ModuleTimeline';

const PageWithModuleTimeline = (props: PageProps) => {
  const theme = useTheme();

  return (
    <Grid container spacing={theme.spacing(1)}>
      <Grid item xs style={{ flexGrow: 1 }}>
        <Page {...props} />
      </Grid>
      <Grid item>
        <ModuleTimeline activeStep={mockPhase.activeModule} steps={mockPhase.modules} title={mockPhase.title} />
      </Grid>
    </Grid>
  );
};

const mockPhase = {
  title: 'Phase 1: Feasibility Study',
  activeModule: 1,
  modules: [
    {
      label: 'Module 1',
      description: 'Kick-Off',
    },
    {
      label: 'Module 2',
      description: 'Introduction to Carbon Projects',
    },
    {
      label: 'Module 3',
      description: 'Legal Eligibility',
    },
    {
      label: 'Module 4',
      description: 'Proposed Restoration Activities Part 1',
    },
    {
      label: 'Module 5',
      description: 'Proposed Restoration Activities Part 2',
    },
    {
      label: 'Module 6',
      description: 'Financial Viability',
    },
    {
      label: 'Module 7',
      description: 'Stakeholders and Co-Benefits',
    },
    {
      label: 'Module 8',
      description: 'Finalizing Deliverables',
    },
    {
      label: 'Module 9',
      description: 'Carbon Sales Process',
    },
    {
      label: 'Module 10',
      description: 'Close Phase 1',
    },
  ],
};

export default PageWithModuleTimeline;
