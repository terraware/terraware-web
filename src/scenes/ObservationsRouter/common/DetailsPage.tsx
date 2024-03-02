import { useMemo } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { selectObservationDetails } from 'src/redux/features/observations/observationDetailsSelectors';
import { selectObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type DetailsPageProps = {
  plantingSiteId?: number | string;
  observationId?: number | string;
  plantingZoneId?: number | string;
  title: string;
  children: React.ReactNode;
};

export default function DetailsPage({
  plantingSiteId,
  observationId,
  plantingZoneId,
  title,
  children,
}: DetailsPageProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();

  const plantingZone = useAppSelector((state) =>
    selectObservationPlantingZone(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        plantingZoneId: Number(plantingZoneId),
      },
      defaultTimeZone.get().id
    )
  );

  const details = useAppSelector((state) =>
    selectObservationDetails(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
      },
      defaultTimeZone.get().id
    )
  );

  const crumbs: Crumb[] = useMemo(() => {
    const data: Crumb[] = [];

    if (plantingSiteId) {
      data.push({
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString()),
      });

      if (observationId) {
        const plantingSiteName = details?.plantingSiteName ?? '';
        const completionDate = details?.completedDate ? getShortDate(details.completedDate, activeLocale) : '';
        const name = `${completionDate} (${plantingSiteName})`;

        data.push({
          name,
          to: `/results/${observationId}`,
        });

        if (plantingZoneId) {
          data.push({
            name: plantingZone?.plantingZoneName ?? '',
            to: `/zone/${plantingZoneId}`,
          });
        }
      }
    }

    return data;
  }, [activeLocale, plantingSiteId, observationId, plantingZoneId, plantingZone, details]);

  return (
    <Page crumbs={crumbs} title={title}>
      {children}
    </Page>
  );
}
