import React, { useCallback, useEffect, useState } from 'react';

import useListCohortModules from 'src/hooks/useListCohortModules';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { requestListModuleProjects } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleProjects } from 'src/redux/features/modules/modulesSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Project } from 'src/types/Project';

import { ParticipantContext, ParticipantData } from './ParticipantContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  const [currentAcceleratorProject, setCurrentAcceleratorProject] = useState<Project>();
  const [acceleratorProjects, setAcceleratorProjects] = useState<Project[]>([]);
  const [moduleProjects, setModuleProjects] = useState<Project[]>([]);
  const [orgHasModules, setOrgHasModules] = useState<boolean | undefined>(undefined);
  const [orgHasParticipants, setOrgHasParticipants] = useState<boolean | undefined>(undefined);

  const [listModuleProjectsRequestId, setListModuleProjectsRequestId] = useState<string>('');

  const moduleProjectsListRequest = useAppSelector(selectModuleProjects(listModuleProjectsRequestId));
  const projects = useAppSelector(selectProjects);

  const { listCohortModules, cohortModules, status: listModulesStatus } = useListCohortModules();

  const _setCurrentAcceleratorProject = useCallback(
    (projectId: string | number) => {
      setCurrentAcceleratorProject(acceleratorProjects.find((project) => project.id === Number(projectId)));
    },
    [acceleratorProjects]
  );

  const [participantData, setParticipantData] = useState<ParticipantData>({
    isLoading: true,
    projectsWithModules: moduleProjects,
    modules: cohortModules,
    orgHasModules,
    orgHasParticipants,
    allAcceleratorProjects: acceleratorProjects,
    setCurrentAcceleratorProject: _setCurrentAcceleratorProject,
  });

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      setCurrentAcceleratorProject(undefined);
      setModuleProjects([]);
      setOrgHasModules(undefined);
      setOrgHasParticipants(undefined);
      setAcceleratorProjects([]);
      void dispatch(requestProjects(selectedOrganization.id, activeLocale));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  useEffect(() => {
    const nextAcceleratorProjects = (projects || []).filter((project) => !!project.phase);
    setAcceleratorProjects(nextAcceleratorProjects);
    setOrgHasParticipants(nextAcceleratorProjects.length > 0);
  }, [projects]);

  useEffect(() => {
    if (selectedOrganization) {
      const request = dispatch(requestListModuleProjects(selectedOrganization.id));
      setListModuleProjectsRequestId(request.requestId);
    }
  }, [selectedOrganization, dispatch]);

  useEffect(() => {
    if (currentAcceleratorProject && currentAcceleratorProject.cohortId) {
      void listCohortModules(currentAcceleratorProject.cohortId);
    }
  }, [currentAcceleratorProject, listCohortModules]);

  useEffect(() => {
    if (moduleProjectsListRequest && moduleProjectsListRequest.status === 'success' && moduleProjectsListRequest.data) {
      const nextModuleProjects = moduleProjectsListRequest.data
        .map((id) => acceleratorProjects.find((project) => project.id === id))
        .filter((project): project is Project => !!project)
        .sort((a, b) => a.name.localeCompare(b.name));

      setModuleProjects(nextModuleProjects);
      setOrgHasModules(nextModuleProjects.length > 0);

      // Assign the first project with modules as the current participant project
      if (nextModuleProjects.length > 0 && !currentAcceleratorProject) {
        setCurrentAcceleratorProject(nextModuleProjects[0]);
      }
    }
  }, [moduleProjectsListRequest, currentAcceleratorProject, acceleratorProjects]);

  useEffect(() => {
    setParticipantData({
      currentAcceleratorProject,
      isLoading: moduleProjectsListRequest?.status === 'pending' || listModulesStatus === 'pending',
      projectsWithModules: moduleProjects,
      modules: cohortModules,
      allAcceleratorProjects: acceleratorProjects,
      orgHasModules,
      orgHasParticipants,
      setCurrentAcceleratorProject: _setCurrentAcceleratorProject,
    });
  }, [
    currentAcceleratorProject,
    listModulesStatus,
    cohortModules,
    moduleProjects,
    moduleProjectsListRequest,
    orgHasModules,
    orgHasParticipants,
    acceleratorProjects,
    _setCurrentAcceleratorProject,
  ]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;
