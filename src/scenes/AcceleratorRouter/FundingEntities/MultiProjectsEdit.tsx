import React, { Fragment, useCallback, useEffect, useState } from 'react';

import { Box, Grid } from '@mui/material';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import AddLink from 'src/components/common/AddLink';
import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

type ProjectsEditProps = {
  projects: Project[];
  allProjects: Project[];
  setProjects: (projects: Project[]) => void;
};

const MultiProjectsEdit = (props: ProjectsEditProps): JSX.Element => {
  const { projects, allProjects, setProjects } = props;
  const [rows, setRows] = useState<Partial<Project> & { id: number }[]>([]);

  useEffect(() => {
    if (!rows.length) {
      setRows(projects);
    }
  }, [projects]);

  const onAddProject = () => {
    setRows(rows.concat([{ id: -1 }]));
  };

  const onDeleteProject = useCallback(
    (deletedIndex: number) => {
      const filteredRows = rows.filter((_row, _index) => _index !== deletedIndex);
      setRows(filteredRows);
      setProjects(filteredRows as Project[]);
    },
    [rows, setRows]
  );

  const selectProject = useCallback(
    (updatedIndex: number, newProjectId: number) => {
      const updatedRows = rows.map((project, index) =>
        index === updatedIndex ? { ...project, id: newProjectId } : project
      );
      setRows(updatedRows);
      setProjects(updatedRows as Project[]);
    },
    [rows, setRows]
  );

  return (
    <Grid container key='projects' spacing={2}>
      {rows.map((project, index) => (
        <Fragment key={index}>
          <Grid item xs={11} rowSpacing={2}>
            <ProjectsDropdown
              allowUnselect
              unselectValue={-1}
              availableProjects={allProjects.filter(
                (p) => p.id === project.id || !rows.map((r) => r.id).includes(p.id)
              )}
              record={{ projectId: project.id }}
              setRecord={(setFn) => {
                const project = setFn({ projectId: -1 });
                selectProject(index, project.projectId);
              }}
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
