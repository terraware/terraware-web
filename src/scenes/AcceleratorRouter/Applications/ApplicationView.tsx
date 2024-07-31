import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import TitleBar from 'src/components/common/TitleBar';

import Page from 'src/components/Page';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

const ApplicationView = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, setSelectedApplication } = useApplicationData();
  const pathParams = useParams<{ applicationId: string }>();

  useEffect(() => {
    setSelectedApplication(Number(pathParams.applicationId ?? -1))
  }, [setSelectedApplication, pathParams]);

  const titleComponent = useMemo(() => {
    if (!selectedApplication || !activeLocale) {
      return undefined
    }

    return (<TitleBar 
      header={strings.formatString(strings.DELIVERABLE_PROJECT, selectedApplication.projectName ?? '').toString()}
      title={selectedApplication.internalName}
    />);
  }, [selectedApplication])
  
  if (!selectedApplication) {
    return undefined;
  }

  return (<Page title={titleComponent} contentStyle={{ display: 'block' }}>

  </Page>);
};

export default ApplicationView;
