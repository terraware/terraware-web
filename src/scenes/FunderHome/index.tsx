import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useUserFundingEntity } from 'src/providers';
import { useLazyListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import { requestGetFunderProjects } from 'src/redux/features/funder/projects/funderProjectsAsyncThunks';
import { selectFunderProjects } from 'src/redux/features/funder/projects/funderProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { FunderProjectDetails } from 'src/types/FunderProject';

import MultiProjectView from './MultiProjectView';
import ProjectView from './ProjectView';

export default function FunderHome() {
  const dispatch = useAppDispatch();
  const { userFundingEntity } = useUserFundingEntity();

  const [fundingEntityProjectIds, setFundingEntityProjectIds] = useState<number[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const funderProjects: Record<number, FunderProjectDetails> = useAppSelector(
    selectFunderProjects(fundingEntityProjectIds)
  );

  const [listPublishedReports, listPublihsedReportsResponse] = useLazyListPublishedReportsQuery();
  const publishedReports = useMemo(
    () => listPublihsedReportsResponse.data?.reports ?? [],
    [listPublihsedReportsResponse.data?.reports]
  );

  useEffect(() => {
    if (userFundingEntity?.projects) {
      setFundingEntityProjectIds(userFundingEntity.projects.map((p) => p.projectId));
    }
  }, [userFundingEntity?.projects]);

  useEffect(() => {
    if (!selectedProjectId && Object.keys(funderProjects).length === 1) {
      setSelectedProjectId(Number(Object.keys(funderProjects)[0]));
    }
  }, [funderProjects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      void listPublishedReports(selectedProjectId, true);
    }
  }, [listPublishedReports, selectedProjectId]);

  useEffect(() => {
    if (fundingEntityProjectIds.length) {
      void dispatch(requestGetFunderProjects(fundingEntityProjectIds));
    }
  }, [fundingEntityProjectIds, dispatch]);

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
