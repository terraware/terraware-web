import React, { useMemo, useRef } from 'react';
import { useTheme, Grid, Typography } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { useLocalization } from 'src/providers';
import { useAppSelector } from 'src/redux/store';
import { selectObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import { selectObservationDetails } from 'src/redux/features/observations/observationDetailsSelectors';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import BreadCrumbs, { Crumb } from 'src/components/BreadCrumbs';

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
  const contentRef = useRef(null);
  const theme = useTheme();
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
      defaultTimeZone.get()
    )
  );

  const details = useAppSelector((state) =>
    selectObservationDetails(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
      },
      defaultTimeZone.get()
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
        const completionDate = details?.completedTime ? getShortDate(details.completedTime, activeLocale) : '';
        const name = `${completionDate} (${plantingSiteName})`;

        data.push({
          name,
          to: `/${observationId}`,
        });

        if (plantingZoneId) {
          data.push({
            name: plantingZone?.plantingZoneName ?? '',
            to: `/${plantingZoneId}`,
          });
        }
      }
    }

    return data;
  }, [activeLocale, plantingSiteId, observationId, plantingZoneId, plantingZone, details]);

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <BreadCrumbs crumbs={crumbs} hierarchical={true} />
        <Grid container>
          <Typography
            sx={{
              marginTop: theme.spacing(3),
              marginBottom: theme.spacing(4),
              paddingLeft: theme.spacing(3),
              fontSize: '20px',
              fontWeight: 600,
              color: theme.palette.TwClrBaseGray800,
            }}
          >
            {title}
          </Typography>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
        </Grid>
      </PageHeaderWrapper>
      <Grid container ref={contentRef}>
        {children}
      </Grid>
    </TfMain>
  );
}
