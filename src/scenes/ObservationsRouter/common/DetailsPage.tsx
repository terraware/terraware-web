import React, { useEffect, useMemo } from 'react';

import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

type DetailsPageProps = {
  plantingSiteId: number;
  observationId: number;
  stratumName?: string;
  title: string | React.ReactNode;
  children: React.ReactNode;
  rightComponent?: React.ReactNode;
};

export default function DetailsPage({
  plantingSiteId,
  observationId,
  stratumName,
  title,
  children,
  rightComponent,
}: DetailsPageProps): JSX.Element {
  const { activeLocale } = useLocalization();

  const { plantingSite, observations, observationResults, setSelectedPlantingSite } = usePlantingSiteData();

  useEffect(() => {
    if (plantingSite?.id !== plantingSiteId) {
      setSelectedPlantingSite(plantingSiteId);
    }
  }, [plantingSite, plantingSiteId, setSelectedPlantingSite]);

  const observation = useMemo(() => {
    return observations?.find((item) => item.id === observationId);
  }, [observations, observationId]);

  const result = useMemo(() => {
    return observationResults?.find((item) => item.observationId === observationId);
  }, [observationResults, observationId]);

  const observationDate = useMemo(() => {
    if (!observation || !plantingSite) {
      return '';
    }

    if (result?.completedTime) {
      return getDateDisplayValue(result.completedTime, plantingSite.timeZone);
    } else {
      return observation.endDate;
    }
  }, [plantingSite, observation, result]);

  const crumbs: Crumb[] = useMemo(() => {
    if (!activeLocale) {
      return [];
    }
    const data: Crumb[] = [];

    if (plantingSiteId) {
      data.push({
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString()),
      });

      if (observationId) {
        const plantingSiteName = observation?.plantingSiteName ?? '';
        const name = observationDate ? `${observationDate} (${plantingSiteName})` : undefined;

        if (observationId && name) {
          data.push({
            name,
            to: `/results/${observationId}`,
          });
        }

        if (!name) {
          data.push({
            name: strings.PLANT_MONITORING,
            to: APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString()),
          });
        }

        if (stratumName) {
          data.push({
            name: stratumName,
            to: '/stratum/' + encodeURIComponent(stratumName),
          });
        }
      }
    }

    return data;
  }, [activeLocale, plantingSiteId, observation, observationId, stratumName, observationDate]);

  return (
    <Page crumbs={crumbs} title={title} rightComponent={rightComponent}>
      {children}
    </Page>
  );
}
