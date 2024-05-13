import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Crumb } from 'src/components/BreadCrumbs';
import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import ModuleViewTitle from './ModuleViewTitle';
import { useModuleData } from './Provider/Context';

const ModuleView = () => {
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ sessionId: string; moduleId: string; projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const { deliverables, module } = useModuleData();

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.ALL_MODULES : '',
        to: APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`),
      },
    ],
    [activeLocale, projectId]
  );

  return (
    <PageWithModuleTimeline
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={<ModuleViewTitle module={module} projectId={projectId} />}
    >
      {module && <ModuleDetailsCard deliverables={deliverables} module={module} projectId={projectId} />}
    </PageWithModuleTimeline>
  );
};

export default ModuleView;
