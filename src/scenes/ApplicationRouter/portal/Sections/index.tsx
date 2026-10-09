import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { skipToken } from '@reduxjs/toolkit/query';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import { useLocalization } from 'src/providers';
import {
  useGetApplicationDeliverablesQuery,
  useGetApplicationModulesQuery,
  useGetApplicationQuery,
} from 'src/queries/generated/applications';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';
import SectionView from './SectionView';

const SectionViewWrapper = () => {
  const pathApplicationId = usePathApplicationId();
  const { currentData: modulesData } = useGetApplicationModulesQuery(pathApplicationId ?? skipToken);
  const applicationSections = useMemo(() => modulesData?.modules ?? [], [modulesData]);
  const { currentData: deliverablesData } = useGetApplicationDeliverablesQuery(pathApplicationId ?? skipToken);
  const applicationDeliverables = useMemo(() => deliverablesData?.deliverables ?? [], [deliverablesData]);

  const pathParams = useParams<{ applicationId: string; sectionId: string }>();
  const sectionId = Number(pathParams.sectionId);

  const appSection = useMemo(
    () => applicationSections.find((section) => section.moduleId === sectionId),
    [applicationSections, sectionId]
  );

  const deliverables = useMemo(
    () => applicationDeliverables.filter((deliverable) => deliverable.moduleId === sectionId),
    [applicationDeliverables, sectionId]
  );

  if (!appSection) {
    return null;
  }

  return <SectionView section={appSection} sectionDeliverables={deliverables} />;
};

const SectionViewPage = () => {
  const { activeLocale } = useLocalization();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;

  const selectedApplicationId = selectedApplication?.id;

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplicationId
        ? [
            {
              name: strings.ALL_SECTIONS,
              to: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${selectedApplicationId}`),
            },
          ]
        : [],
    [activeLocale, selectedApplicationId]
  );

  return (
    <ApplicationPage crumbs={crumbs}>
      <SectionViewWrapper />
    </ApplicationPage>
  );
};

export default SectionViewPage;
