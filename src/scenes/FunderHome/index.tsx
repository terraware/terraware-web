import React, { useCallback, useEffect, useMemo, useState } from 'react';

import isEnabled from 'src/features';
import { useUser, useUserFundingEntity } from 'src/providers';
import { useLazyGetUserFundingEntityQuery } from 'src/queries/funder/fundingEntities';
import { requestListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesAsyncThunks';
import { selectListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesSelectors';
import { requestGetFunderProjects } from 'src/redux/features/funder/projects/funderProjectsAsyncThunks';
import { selectFunderProjects } from 'src/redux/features/funder/projects/funderProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { PublishedReport } from 'src/types/AcceleratorReport';
import { FunderProjectDetails } from 'src/types/FunderProject';

import MultiProjectView from './MultiProjectView';
import ProjectView from './ProjectView';

export default function FunderHome() {
  const dispatch = useAppDispatch();
  const { userFundingEntity } = useUserFundingEntity();

  const { user } = useUser();
  const rtkQueryEnabled = isEnabled('Redux RTK Query');
  const [rtkGetUserFundingEntity, { data: rtkUserFundingEntity }] = useLazyGetUserFundingEntityQuery();

  const [fundingEntityProjectIds, setFundingEntityProjectIds] = useState<number[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const funderProjects: Record<number, FunderProjectDetails> = useAppSelector(
    selectFunderProjects(fundingEntityProjectIds)
  );
  const reportsResponse = useAppSelector(selectListFunderReports(selectedProjectId?.toString() ?? ''));
  const [publishedReports, setPublishedReports] = useState<PublishedReport[]>();

  useEffect(() => {
    if (rtkQueryEnabled && user) {
      void rtkGetUserFundingEntity(user.id);
    }
  }, [rtkGetUserFundingEntity, rtkQueryEnabled, user]);

  useEffect(() => {
    if (rtkQueryEnabled) {
      if (rtkUserFundingEntity?.projects) {
        setFundingEntityProjectIds(rtkUserFundingEntity.projects.map((p) => p.projectId));
      }
    } else {
      if (userFundingEntity?.projects) {
        setFundingEntityProjectIds(userFundingEntity.projects.map((p) => p.projectId));
      }
    }
  }, [rtkQueryEnabled, rtkUserFundingEntity?.projects, userFundingEntity?.projects]);

  useEffect(() => {
    if (!selectedProjectId && Object.keys(funderProjects).length === 1) {
      setSelectedProjectId(Number(Object.keys(funderProjects)[0]));
    }
  }, [funderProjects, selectedProjectId]);

  useEffect(() => {
    if (fundingEntityProjectIds.length) {
      void dispatch(requestGetFunderProjects(fundingEntityProjectIds));
    }
  }, [fundingEntityProjectIds, dispatch]);

  useEffect(() => {
    if (selectedProjectId && selectedProjectId !== -1 && publishedReports === undefined) {
      void dispatch(requestListFunderReports(selectedProjectId));
    }
  }, [dispatch, selectedProjectId, publishedReports]);

  useEffect(() => {
    if (reportsResponse?.status === 'success') {
      setPublishedReports(reportsResponse.data || []);
    }
  }, [reportsResponse]);

  const projectDetails = useMemo(() => {
    if (selectedProjectId) {
      return funderProjects[selectedProjectId];
    }
  }, [selectedProjectId, funderProjects]);

  const goToAllProjects = useCallback(() => setSelectedProjectId(undefined), []);

  if (selectedProjectId && projectDetails && publishedReports !== undefined) {
    return (
      <ProjectView
        projectDetails={projectDetails}
        includeCrumbs={Object.keys(funderProjects).length > 1}
        goToAllProjects={goToAllProjects}
        publishedReports={publishedReports}
      />
    );
  } else {
    return <MultiProjectView projects={Object.values(funderProjects)} selectProject={setSelectedProjectId} />;
  }
}
