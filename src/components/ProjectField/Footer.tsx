import React from 'react';

import { Grid } from '@mui/material';

import strings from 'src/strings';
import { Project, ProjectMeta } from 'src/types/Project';

import ProjectFieldInlineMeta from './InlineMeta';

type ProjectProfileFooterProps = {
  project?: Project;
  projectMeta?: ProjectMeta;
};

const ProjectProfileFooter = ({ project, projectMeta }: ProjectProfileFooterProps) => {
  return (
    <Grid container>
      <ProjectFieldInlineMeta
        date={project?.createdTime}
        dateLabel={strings.CREATED_ON}
        userId={project?.createdBy}
        userName={projectMeta?.createdByUserName}
        userLabel={strings.BY.toLowerCase()}
      />
      <ProjectFieldInlineMeta
        date={project?.modifiedTime}
        dateLabel={strings.LAST_MODIFIED_ON}
        userId={project?.modifiedBy}
        userName={projectMeta?.modifiedByUserName}
        userLabel={strings.BY.toLowerCase()}
      />
    </Grid>
  );
};

export default ProjectProfileFooter;
