import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useBoolean from 'src/hooks/useBoolean';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useListModulesQuery } from 'src/queries/generated/modules';
import {
  ProjectModulePayload,
  UpdateProjectModuleApiArg,
  useDeleteProjectModuleMutation,
  useListProjectModulesQuery,
  useUpdateProjectModuleMutation,
} from 'src/queries/generated/projectModules';
import { ProjectPayload, useGetProjectQuery } from 'src/queries/generated/projects';
import useSnackbar from 'src/utils/useSnackbar';

import ProjectModulesList from '../ProjectModulesList';

const modulePayloadToUpdatePayload = (projectId: number, module: ProjectModulePayload): UpdateProjectModuleApiArg => {
  return {
    projectId,
    moduleId: module.id,
    updateProjectModuleRequestPayload: {
      ...module,
    },
  };
};

export default function ProjectModulesEditView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { goToAcceleratorProject } = useNavigateTo();
  const [saveIsLoading, , setSaveIsLoadingTrue, setSaveIsLoadingFalse] = useBoolean(false);
  const { projectId: projectIdString } = useParams<{ projectId: string }>();
  const projectId = useMemo(() => Number(projectIdString || -1), [projectIdString]);
  const { data: projectData } = useGetProjectQuery(projectId);
  const project = useMemo(() => (projectData?.project || {}) as ProjectPayload, [projectData]);
  const snackbar = useSnackbar();

  const [deleteProjectModule] = useDeleteProjectModuleMutation();
  const [updateProjectModule] = useUpdateProjectModuleMutation();
  const { data: allModulesData, isLoading: isAllModulesListLoading } = useListModulesQuery();
  const allModules = useMemo(() => allModulesData?.modules || [], [allModulesData?.modules]);
  const { data: projectModulesData, isLoading: isProjectModulesListLoading } = useListProjectModulesQuery(projectId);
  const projectModules = useMemo(() => projectModulesData?.modules || [], [projectModulesData?.modules]);
  const [pendingModules, setPendingModules] = useState<ProjectModulePayload[]>(projectModules);

  useEffect(() => {
    setPendingModules(projectModules);
  }, [projectModules]);

  const backToProjectDeliverables = useCallback(
    () => goToAcceleratorProject(projectId),
    [goToAcceleratorProject, projectId]
  );

  // TODO fix Add Module modal showing incorrect validate fields

  const saveModules = useCallback(() => {
    if (!projectIdString) {
      return;
    }
    const save = async () => {
      try {
        setSaveIsLoadingTrue();
        const toDelete = projectModules.filter(
          (oldModule) => pendingModules.find((newModule) => newModule.id === oldModule.id) === undefined
        );

        const toAdd = pendingModules.filter(
          (newModule) => projectModules.find((oldModule) => oldModule.id === newModule.id) === undefined
        );

        const toUpdate = pendingModules.filter((newModule) => {
          const oldModule = projectModules.find((module) => module.id === newModule.id);
          return (
            oldModule !== undefined &&
            !(
              oldModule.title === newModule.title &&
              oldModule.startDate === newModule.startDate &&
              oldModule.endDate === newModule.endDate
            )
          );
        });

        const deletePromises = toDelete.map((module) =>
          deleteProjectModule({ projectId, moduleId: module.id }).unwrap()
        );
        const updatePromises = [...toAdd, ...toUpdate].map((module) =>
          updateProjectModule(modulePayloadToUpdatePayload(projectId, module)).unwrap()
        );

        const responses = await Promise.all([...deletePromises, ...updatePromises]);
        if (responses.some((response) => response.status !== 'ok')) {
          snackbar.toastError();
          return;
        }
        snackbar.toastSuccess(strings.CHANGES_SAVED);
        goToAcceleratorProject(projectId);
      } catch (e) {
        snackbar.toastError();
      } finally {
        setSaveIsLoadingFalse();
      }
    };
    void save();
  }, [
    projectIdString,
    projectModules,
    pendingModules,
    snackbar,
    strings,
    goToAcceleratorProject,
    projectId,
    deleteProjectModule,
    updateProjectModule,
    setSaveIsLoadingTrue,
    setSaveIsLoadingFalse,
  ]);

  return (
    <TfMain>
      <Box padding={theme.spacing(3)}>
        <Typography fontSize='24px' fontWeight={600}>
          {strings.formatString(strings.MODULES_FOR_PROJECT, project.name)}
        </Typography>
      </Box>
      <PageForm
        cancelID={'cancelEditModules'}
        saveID={'saveEditModules'}
        onCancel={backToProjectDeliverables}
        onSave={saveModules}
        style={{ display: 'flex', flexGrow: 1 }}
        busy={saveIsLoading}
      >
        <Grid
          container
          spacing={theme.spacing(3)}
          borderRadius={theme.spacing(3)}
          padding={theme.spacing(0, 3, 3, 0)}
          margin={0}
        >
          {projectIdString && (
            <ProjectModulesList
              projectId={projectId}
              editing={true}
              allModules={allModules}
              projectModules={pendingModules}
              setProjectModules={setPendingModules}
              isLoading={isProjectModulesListLoading || isAllModulesListLoading}
            />
          )}
        </Grid>
      </PageForm>
    </TfMain>
  );
}
