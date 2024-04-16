import { useEffect, useMemo } from 'react';

import { useProjects } from 'src/hooks/useProjects';
import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectAllModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

export const useModules = () => {
  const dispatch = useAppDispatch();
  const { availableProjects } = useProjects();

  const projectIds = useMemo(() => availableProjects?.map((project) => project.id) || [], [availableProjects]);
  const projectModules = useAppSelector(selectAllModuleList(projectIds));

  useEffect(() => {
    projectIds.forEach((id) => void dispatch(requestListModules(id)));
  }, [projectIds, dispatch]);

  return { projectModules };
};
