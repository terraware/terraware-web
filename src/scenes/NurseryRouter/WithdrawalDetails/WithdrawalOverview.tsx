import React, { type JSX } from 'react';

import { Grid } from '@mui/material';

import OverviewItemCard from 'src/components/common/OverviewItemCard';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { DeliveryPayload } from 'src/queries/generated/deliveries';
import { NurseryWithdrawalPayload } from 'src/queries/generated/nurseryWithdrawals';
import { SearchNurseryWithdrawalPayload } from 'src/queries/search/nurseries';
import { purposeLabel } from 'src/types/Batch';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type WithdrawalOverviewProps = {
  withdrawal?: NurseryWithdrawalPayload;
  delivery?: DeliveryPayload;
  reassignmentDeliveries?: DeliveryPayload[];
  withdrawalSummary?: SearchNurseryWithdrawalPayload;
};

export default function WithdrawalOverview({
  withdrawal,
  withdrawalSummary,
  delivery,
  reassignmentDeliveries = [],
}: WithdrawalOverviewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();

  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const crossSiteDeliveries = reassignmentDeliveries.filter((item) => item.plantingSiteId !== delivery?.plantingSiteId);
  const hasSiteReassignment = crossSiteDeliveries.length > 0;
  const originalSite = plantingSites.find((site) => site.id === delivery?.plantingSiteId);
  const locationNames = (deliveries: DeliveryPayload[], field: 'site' | 'stratum' | 'substratum') => {
    const names = deliveries.flatMap((item) => {
      const site = plantingSites.find((candidate) => candidate.id === item.plantingSiteId);
      if (field === 'site') {
        return site ? [site.name] : [];
      }
      return item.plantings
        .filter((planting) => planting.type === (item.id === delivery?.id ? 'Delivery' : 'Reassignment To'))
        .flatMap((planting) => {
          const stratum = site?.strata?.find((candidate) =>
            candidate.substrata.some((substratum) => substratum.id === planting.substratumId)
          );
          const name =
            field === 'stratum'
              ? stratum?.name
              : stratum?.substrata.find((substratum) => substratum.id === planting.substratumId)?.name;
          return name ? [name] : [];
        });
    });
    return [...new Set(names)].join(', ');
  };
  const reassignedValue = (original: string, destination: string) =>
    hasSiteReassignment ? strings.formatString(strings.REASSIGNED_VALUE, original, destination).toString() : original;
  const facilityName = selectedOrganization?.facilities?.find((f) => f.id === withdrawal?.facilityId)?.name;
  const plantingSeasonData =
    withdrawal?.plantingSeasonId || withdrawalSummary?.plantingSeasonName
      ? [
          {
            title: strings.PLANTING_SEASON,
            data: hasSiteReassignment
              ? strings
                  .formatString(strings.REASSIGNED_TO_NO_SEASON, withdrawalSummary?.plantingSeasonName ?? '')
                  .toString()
              : withdrawalSummary?.plantingSeasonName ?? '',
          },
          {
            title: strings.PLANTING_DATE,
            data: hasSiteReassignment
              ? strings
                  .formatString(
                    strings.REASSIGNED_TO_NO_DATE,
                    withdrawalSummary?.plantingDate ?? strings.NOT_WITHDRAWN_TO_DATE
                  )
                  .toString()
              : withdrawalSummary?.plantingDate ?? strings.NOT_WITHDRAWN_TO_DATE,
          },
        ]
      : [];
  const overviewCardData = [
    {
      title: strings.DATE,
      data: withdrawal?.withdrawnDate ?? '',
    },
    {
      title: strings.PURPOSE,
      data: withdrawal?.purpose ? purposeLabel(withdrawal.purpose) : '',
    },
    {
      title: strings.QUANTITY,
      data: withdrawalSummary?.totalWithdrawn?.toString() ?? '',
    },
    {
      title: strings.FROM_NURSERY,
      data: facilityName ?? '',
    },
    {
      title: strings.DESTINATION,
      data: reassignedValue(
        (hasSiteReassignment ? originalSite?.name : undefined) ?? withdrawalSummary?.destinationName ?? '',
        locationNames(crossSiteDeliveries, 'site')
      ),
    },
    {
      title: strings.TO_STRATUM,
      data: reassignedValue(
        hasSiteReassignment
          ? locationNames(delivery ? [delivery] : [], 'stratum')
          : withdrawalSummary?.stratumName ?? '',
        locationNames(crossSiteDeliveries, 'stratum')
      ),
    },
    {
      title: strings.TO_SUBSTRATUM,
      data: reassignedValue(
        hasSiteReassignment
          ? locationNames(delivery ? [delivery] : [], 'substratum')
          : withdrawalSummary?.substratumShortName ?? '',
        locationNames(crossSiteDeliveries, 'substratum')
      ),
    },
    ...plantingSeasonData,
    {
      title: strings.NOTES,
      data: withdrawal?.notes ?? '',
    },
  ];

  return (
    <Grid container>
      {overviewCardData.map((item) => (
        <Grid item xs={isMobile ? 12 : 4} key={item.title}>
          <OverviewItemCard isEditable={false} title={item.title} contents={item.data} />
        </Grid>
      ))}
    </Grid>
  );
}
