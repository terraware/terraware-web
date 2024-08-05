import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import AcceleratorDeliverableCard from 'src/components/AcceleratorDeliverableView/DeliverableCard';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';

const ApplicationDeliverable = () => {
  const { applicationId, deliverableId } = useParams<{
    applicationId: string;
    deliverableId: string;
  }>();
  const { activeLocale } = useLocalization();
  const { applicationDeliverables, selectedApplication, setSelectedApplication } = useApplicationData();

  useEffect(() => {
    setSelectedApplication(Number(applicationId ?? -1));
  }, [setSelectedApplication, applicationId]);

  const deliverable = useMemo(
    () => applicationDeliverables.find((deliverable) => deliverable.id === Number(deliverableId ?? -1)),
    [applicationDeliverables, deliverableId]
  );

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.PRESCREEN,
              to: APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  const titleComponent = useMemo(() => {
    if (!selectedApplication || !deliverable || !activeLocale) {
      return undefined;
    }

    return (
      <TitleBar
        header={strings.formatString(strings.DELIVERABLE_PROJECT, selectedApplication.projectName ?? '').toString()}
        title={deliverable.name}
        subtitle={selectedApplication.internalName}
      />
    );
  }, [activeLocale, deliverable, selectedApplication]);

  if (!selectedApplication || !deliverable) {
    return <Page isLoading={true} />;
  }

  return (
    <Page crumbs={crumbs} title={titleComponent} contentStyle={{ display: 'block' }}>
      <AcceleratorDeliverableCard deliverable={{ ...deliverable, documents: [] }} hideStatusBadge />
    </Page>
  );
};

export default ApplicationDeliverable;
