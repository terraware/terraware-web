import React, { type JSX, useCallback } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import area from '@turf/area';
import { MultiPolygon } from 'geojson';

import Card from 'src/components/common/Card';
import { SQ_M_TO_HECTARES } from 'src/constants';
import strings from 'src/strings';
import { DraftPlantingSite, SiteEditStep } from 'src/types/PlantingSite';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import DraftPlantingSiteBoundaryMap from './DraftPlantingSiteBoundaryMap';
import { DetailField } from './DraftPlantingSiteDetailsCard';

const stepLabel = (step: SiteEditStep): string => {
  switch (step) {
    case 'exclusion_areas':
      return strings.EXCLUSION_AREAS;
    case 'stratum_boundaries':
      return strings.STRATUM_BOUNDARIES;
    case 'substratum_boundaries':
      return strings.SUBSTRATUM_BOUNDARIES;
    default:
      return strings.SITE_BOUNDARY;
  }
};

type DraftPlantingSiteBoundaryCardProps = {
  plantingSite: DraftPlantingSite;
};

export default function DraftPlantingSiteBoundaryCard({
  plantingSite,
}: DraftPlantingSiteBoundaryCardProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const numberFormatter = useNumberFormatter();
  const { boundary, exclusion, siteEditStep, siteType, strata } = plantingSite;

  const formatHectares = useCallback(
    (geometry: MultiPolygon) =>
      strings.formatString(
        strings.AREA_IN_HA,
        numberFormatter.format(area(geometry) * SQ_M_TO_HECTARES, { decimals: 1 })
      ) as string,
    [numberFormatter]
  );

  const exclusionSummary = exclusion
    ? (strings.formatString(
        strings.EXCLUSION_AREAS_SUMMARY,
        numberFormatter.format(exclusion.coordinates.length),
        formatHectares(exclusion)
      ) as string)
    : undefined;

  return (
    <Card flushMobile radius={theme.spacing(2)} title={strings.SITE_BOUNDARY}>
      {boundary ? (
        <Box
          display='flex'
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems='flex-start'
          gap={theme.spacing(3.5)}
          marginTop={theme.spacing(2)}
        >
          <Box flex='none' width={isMobile ? '100%' : '520px'}>
            <DraftPlantingSiteBoundaryMap boundary={boundary} plantingSite={plantingSite} />
          </Box>
          <Box
            display='grid'
            flex={1}
            gridTemplateColumns='repeat(2, minmax(0, 1fr))'
            columnGap={theme.spacing(4)}
            rowGap={theme.spacing(3)}
            width='100%'
          >
            <DetailField label={strings.TOTAL_AREA} value={formatHectares(boundary)} />
            <DetailField label={strings.EXCLUSION_AREAS} value={exclusionSummary} />
            {siteType === 'detailed' && (
              <>
                <DetailField
                  label={strings.STRATA}
                  value={strata ? numberFormatter.format(strata.length) : undefined}
                />
                <DetailField
                  label={strings.SUBSTRATA}
                  value={
                    strata ? numberFormatter.format(strata.flatMap((stratum) => stratum.substrata).length) : undefined
                  }
                />
              </>
            )}
            <DetailField label={strings.SETUP_REMAINING} value={stepLabel(siteEditStep)} />
          </Box>
        </Box>
      ) : (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          gap={theme.spacing(1.5)}
          height='260px'
          marginTop={theme.spacing(2)}
          padding={theme.spacing(2)}
          borderRadius='8px'
          border={`1px dashed ${theme.palette.TwClrBrdrSecondary}`}
          sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
        >
          <Icon name='iconMap' size='large' fillColor={theme.palette.TwClrIcnSecondary} />
          <Typography fontSize='16px' fontWeight={600} lineHeight='24px' color={theme.palette.TwClrTxt}>
            {strings.NO_SITE_BOUNDARY_YET}
          </Typography>
          <Typography fontSize='16px' lineHeight='24px' color={theme.palette.TwClrTxt} textAlign='center'>
            {strings.NO_SITE_BOUNDARY_YET_DESCRIPTION}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
