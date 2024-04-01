import React, { useEffect } from 'react';

import Page from 'src/components/Page';
import { useProject } from 'src/providers';
import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

export default function ListView(): JSX.Element {
  const dispatch = useAppDispatch();
  const { project, projectId } = useProject();

  const modules = useAppSelector(selectModuleList(projectId));
  // tslint:disable:no-console
  console.log(project, modules);

  useEffect(() => {
    void dispatch(requestListModules(projectId));
  }, [dispatch, projectId]);

  return <Page title={strings.ALL_MODULES} />;
}
