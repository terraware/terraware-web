import { useEffect, useMemo } from 'react';

import { useProjects } from 'src/hooks/useProjects';
import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectAllModuleList } from 'src/redux/features/modules/modulesSelectors'


export const useModules = () => {
  const dispatch = useAppDispatch();
  const { availableProjects } = useProjects();

  const projectIds = useMemo(() => availableProjects?.map((project) => project.id) || [], [availableProjects])
  const projectModules = useAppSelector(selectAllModuleList(projectIds));

  useEffect(() => {
    projectIds.forEach(id => void dispatch(requestListModules(id)))
  }, [projectIds, dispatch]);


  return { projectModules };
};
