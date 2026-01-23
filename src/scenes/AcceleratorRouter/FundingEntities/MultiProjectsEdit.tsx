import React, { Fragment, type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Grid } from '@mui/material';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import AddLink from 'src/components/common/AddLink';
import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';

type ProjectsEditOption = {
  projectId: number;
  dealName?: string;
};

type ProjectsEditProps = {
  projects: ProjectsEditOption[];
  allProjects: ProjectsEditOption[];
  setProjects: (projects: ProjectsEditOption[]) => void;
  tooltip?: string;
};

const MultiProjectsEdit = (props: ProjectsEditProps): JSX.Element => {
  const { projects, allProjects, setProjects, tooltip } = props;
  const [rows, setRows] = useState<Partial<ProjectsEditOption> & { projectId: number }[]>([]);

  useEffect(() => {
    if (!rows.length) {
      setRows(projects);
    }
  }, [projects, rows.length]);

  const onAddProject = () => {
    setRows(rows.concat([{ projectId: -1 }]));
  };

  const onDeleteProject = useCallback(
    (deletedIndex: number) => {
      const filteredRows = rows.filter((_row, _index) => _index !== deletedIndex);
      setRows(filteredRows);
      setProjects(filteredRows as ProjectsEditOption[]);
    },
    [rows, setRows, setProjects]
  );

  const selectProject = useCallback(
    (updatedIndex: number, newProjectId: number) => {
      const updatedRows = rows.map((project, index) =>
        index === updatedIndex ? { ...project, projectId: newProjectId } : project
      );
      setRows(updatedRows);
      setProjects(updatedRows as ProjectsEditOption[]);
    },
    [rows, setRows, setProjects]
  );

  return (
    <Grid container key='projects' spacing={2}>
      {rows.map((project, index) => (
        <Fragment key={index}>
          <Grid item xs={11} rowSpacing={2}>
            <ProjectsDropdown
              placeholder={strings.SELECT}
              availableProjects={allProjects
                .filter((p) => p.projectId === project.projectId || !rows.map((r) => r.projectId).includes(p.projectId))
                .map((p) => {
                  return {
                    id: p.projectId,
                    dealName: p.dealName,
                    name: '',
                  };
                })}
              useDealName={true}
              tooltip={tooltip}
              record={{ projectId: project.projectId }}
              setRecord={(setFn) => {
                const _project = setFn({ projectId: -1 });
                selectProject(index, _project.projectId);
              }}
              autoComplete
            />
          </Grid>
          <Grid item xs={1} display={'flex'} flexDirection={'column-reverse'}>
            <Link onClick={() => onDeleteProject(index)}>
              <Box paddingTop='8px'>
                <Icon name='iconSubtract' size='medium' />
              </Box>
            </Link>
          </Grid>
        </Fragment>
      ))}
      <Grid item xs={12}>
        <AddLink onClick={onAddProject} key='addProject' text={strings.ADD_PROJECT} large={true} />
      </Grid>
    </Grid>
  );
};

export default MultiProjectsEdit;
