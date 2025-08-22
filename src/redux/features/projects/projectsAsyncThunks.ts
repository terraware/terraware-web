import { createAsyncThunk } from '@reduxjs/toolkit';

import { Response2 } from 'src/services/HttpService';
import ProjectsService, {
  AssignProjectInternalUserRequestPayload,
  AssignProjectInternalUserResponsePayload,
  AssignProjectRequestPayload,
  AssignProjectResponsePayload,
  DeleteProjectResponsePayload,
  RemoveProjectInternalUserResponsePayload,
  UpdateProjectResponsePayload,
} from 'src/services/ProjectsService';
import strings from 'src/strings';
import { ProjectInternalUsers, UpdateProjectRequest } from 'src/types/Project';

export const requestProjectUpdate = createAsyncThunk(
  'projects/update',
  async (request: { projectId: number; project: UpdateProjectRequest }, { rejectWithValue }) => {
    const response: Response2<UpdateProjectResponsePayload> = await ProjectsService.updateProject(
      request.projectId,
      request.project
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectDelete = createAsyncThunk(
  'projects/delete',
  async (request: { projectId: number }, { rejectWithValue }) => {
    const response: Response2<DeleteProjectResponsePayload> = await ProjectsService.deleteProject(request.projectId);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectAssign = createAsyncThunk(
  'project/assign',
  async (request: { projectId: number; entities: AssignProjectRequestPayload }, { rejectWithValue }) => {
    const { projectId, entities } = request;
    const response: Response2<AssignProjectResponsePayload> = await ProjectsService.assignProjectToEntities(
      projectId,
      entities
    );

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectInternalUsersList = createAsyncThunk(
  'projects/listInternalUsers',
  async (request: { projectId: number }, { rejectWithValue }) => {
    const response = await ProjectsService.listProjectInternalUsers(request.projectId);

    if (response !== null && response.requestSucceeded) {
      return response;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectInternalUserAssign = createAsyncThunk(
  'projects/assignInternalUser',
  async (request: { projectId: number; payload: AssignProjectInternalUserRequestPayload }, { rejectWithValue }) => {
    const { projectId, payload } = request;
    const response: Response2<AssignProjectInternalUserResponsePayload> =
      await ProjectsService.assignProjectInternalUser(projectId, payload);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectInternalUserRemove = createAsyncThunk(
  'projects/removeInternalUser',
  async (request: { projectId: number; userId: number }, { rejectWithValue }) => {
    const { projectId, userId } = request;
    const response: Response2<RemoveProjectInternalUserResponsePayload> =
      await ProjectsService.removeProjectInternalUser(projectId, userId);

    if (response !== null && response.requestSucceeded) {
      return response.data;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestProjectInternalUsersUpdate = createAsyncThunk(
  'projects/updateInternalUsers',
  async (
    request: {
      projectId: number;
      usersToAssign: AssignProjectInternalUserRequestPayload[];
      usersToRemove: ProjectInternalUsers;
    },
    { rejectWithValue }
  ) => {
    const { usersToRemove, usersToAssign } = request;

    try {
      const removePromises = usersToRemove.map((user) =>
        ProjectsService.removeProjectInternalUser(request.projectId, user.userId)
      );
      const removeResults = await Promise.all(removePromises);

      const assignPromises = usersToAssign.map((user) =>
        ProjectsService.assignProjectInternalUser(request.projectId, user)
      );
      const assignResults = await Promise.all(assignPromises);

      if ([...removeResults, ...assignResults].every((result) => result?.requestSucceeded)) {
        return 'ok';
      }

      return rejectWithValue(strings.GENERIC_ERROR);
    } catch (error) {
      return rejectWithValue(strings.GENERIC_ERROR);
    }
  }
);
