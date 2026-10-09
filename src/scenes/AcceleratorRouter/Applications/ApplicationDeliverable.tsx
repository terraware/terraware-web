import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { skipToken } from '@reduxjs/toolkit/query';

import AcceleratorDeliverableCard from 'src/components/AcceleratorDeliverableView/DeliverableCard';
import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import TitleBar from 'src/components/common/TitleBar';
import { APP_PATHS } from 'src/constants';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import { useLocalization } from 'src/providers';
import { useGetApplicationDeliverablesQuery, useGetApplicationQuery } from 'src/queries/generated/applications';
import strings from 'src/strings';

const ApplicationDeliverable = () => {
  const { deliverableId } = useParams<{ deliverableId: string }>();
  const { activeLocale } = useLocalization();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;
  const { currentData: deliverablesData } = useGetApplicationDeliverablesQuery(pathApplicationId ?? skipToken);
  const applicationDeliverables = useMemo(() => deliverablesData?.deliverables ?? [], [deliverablesData]);

  const deliverable = useMemo(
    () => applicationDeliverables.find((_deliverable) => _deliverable.id === Number(deliverableId ?? -1)),
    [applicationDeliverables, deliverableId]
  );

  const selectedApplicationId = selectedApplication?.id;

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplicationId
        ? [
            {
              name: strings.APPLICATION,
              to: APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${selectedApplicationId}`),
            },
          ]
        : [],
    [activeLocale, selectedApplicationId]
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
      <AcceleratorDeliverableCard deliverable={{ ...deliverable }} hideStatusBadge />
    </Page>
  );
};

export default ApplicationDeliverable;
