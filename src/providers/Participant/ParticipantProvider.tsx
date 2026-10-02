import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { skipToken } from '@reduxjs/toolkit/query';

import useListProjectModules from 'src/hooks/useListProjectModules';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useListProjectIdsWithModulesQuery } from 'src/queries/search/modules';
import { Project } from 'src/types/Project';

import { ParticipantContext, ParticipantData } from './ParticipantContext';

type Props = {
  children: React.ReactNode;
};

const ParticipantProvider = ({ children }: Props) => {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  const [currentAcceleratorProject, setCurrentAcceleratorProject] = useState<Project>();
  const [acceleratorProjects, setAcceleratorProjects] = useState<Project[]>([]);
  const [moduleProjects, setModuleProjects] = useState<Project[]>([]);
  const [orgHasModules, setOrgHasModules] = useState<boolean | undefined>(undefined);
  const [orgHasParticipants, setOrgHasParticipants] = useState<boolean | undefined>(undefined);

  const { currentData: projectIdsWithModules, isFetching: projectIdsWithModulesFetching } =
    useListProjectIdsWithModulesQuery(selectedOrganization?.id ?? skipToken);
  const { availableProjects: projects } = useProjects();

  const { listProjectModules, projectModules, isLoading: listModulesIsLoading } = useListProjectModules();

  const _setCurrentAcceleratorProject = useCallback(
    (projectId: string | number) => {
      setCurrentAcceleratorProject(acceleratorProjects.find((project) => project.id === Number(projectId)));
    },
    [acceleratorProjects]
  );

  const participantData = useMemo<ParticipantData>(
    () => ({
      currentAcceleratorProject,
      isLoading: projectIdsWithModulesFetching || listModulesIsLoading,
      projectsWithModules: moduleProjects,
      modules: projectModules,
      allAcceleratorProjects: acceleratorProjects,
      orgHasModules,
      orgHasParticipants,
      setCurrentAcceleratorProject: _setCurrentAcceleratorProject,
    }),
    [
      currentAcceleratorProject,
      listModulesIsLoading,
      projectModules,
      moduleProjects,
      projectIdsWithModulesFetching,
      orgHasModules,
      orgHasParticipants,
      acceleratorProjects,
      _setCurrentAcceleratorProject,
    ]
  );

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      setCurrentAcceleratorProject(undefined);
      setModuleProjects([]);
      setOrgHasModules(undefined);
      setOrgHasParticipants(undefined);
      setAcceleratorProjects([]);
    }
  }, [activeLocale, selectedOrganization]);

  useEffect(() => {
    const nextAcceleratorProjects = (projects || []).filter((project) => !!project.phase);
    setAcceleratorProjects(nextAcceleratorProjects);
    setOrgHasParticipants(nextAcceleratorProjects.length > 0);
  }, [projects]);

  useEffect(() => {
    if (currentAcceleratorProject && currentAcceleratorProject.id) {
      void listProjectModules(currentAcceleratorProject.id);
    }
  }, [currentAcceleratorProject, listProjectModules]);

  useEffect(() => {
    if (projectIdsWithModules) {
      const nextModuleProjects = projectIdsWithModules
        .map((id) => acceleratorProjects.find((project) => project.id === id))
        .filter((project): project is Project => !!project)
        .sort((a, b) => a.name.localeCompare(b.name));

      setModuleProjects(nextModuleProjects);
      setOrgHasModules(nextModuleProjects.length > 0);

      // Assign the first project with modules as the current accelerator project
      if (nextModuleProjects.length > 0 && !currentAcceleratorProject) {
        setCurrentAcceleratorProject(nextModuleProjects[0]);
      }
    }
  }, [projectIdsWithModules, currentAcceleratorProject, acceleratorProjects]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;
