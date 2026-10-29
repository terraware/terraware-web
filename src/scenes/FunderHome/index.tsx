import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useUserFundingEntity } from 'src/providers';
import { useGetProjectsQuery } from 'src/queries/generated/funderProjects';
import { useLazyListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import { FunderProjectDetails } from 'src/types/FunderProject';

import MultiProjectView from './MultiProjectView';
import ProjectView from './ProjectView';

export default function FunderHome() {
  const { userFundingEntity } = useUserFundingEntity();

  const fundingEntityProjects = userFundingEntity?.projects;
  const fundingEntityProjectIds = useMemo(
    () => (fundingEntityProjects ? fundingEntityProjects.map((p) => p.projectId) : []),
    [fundingEntityProjects]
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const { currentData: funderProjectsData } = useGetProjectsQuery(fundingEntityProjectIds, {
    skip: !fundingEntityProjectIds.length,
    refetchOnMountOrArgChange: true,
  });
  const funderProjects = useMemo(
    () =>
      Object.fromEntries((funderProjectsData?.projects ?? []).map((project) => [project.projectId, project])) as Record<
        number,
        FunderProjectDetails
      >,
    [funderProjectsData]
  );

  const [listPublishedReports, listPublihsedReportsResponse] = useLazyListPublishedReportsQuery();
  const publishedReports = useMemo(
    () => listPublihsedReportsResponse.data?.reports ?? [],
    [listPublihsedReportsResponse.data?.reports]
  );

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
