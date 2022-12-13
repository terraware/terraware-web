import { Box, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import Photos from './sections/Photos';
import SpeciesTable from './sections/SpeciesTable';
import { Batch, NurseryWithdrawal } from 'src/api/types/batch';
import { Delivery } from 'src/api/types/tracking';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { ServerOrganization } from 'src/types/Organization';
import { useEffect, useState } from 'react';
import { getPlantingSite } from 'src/api/tracking/tracking';
import { Species } from 'src/types/Species';

type WithdrawalTabPanelContentProps = {
  organization: ServerOrganization;
  species: Species[];
  withdrawal?: NurseryWithdrawal;
  delivery?: Delivery;
  batches?: Batch[];
};

export default function WithdrawalTabPanelContent({
  organization,
  species,
  withdrawal,
  delivery,
}: WithdrawalTabPanelContentProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const [siteName, setSiteName] = useState('');

  useEffect(() => {
    const getPlantingSiteData = async () => {
      if (delivery?.plantingSiteId) {
        const res = await getPlantingSite(delivery.plantingSiteId);
        if (res.requestSucceeded && res.site) {
          setSiteName(res.site.name);
        }
      }
    };
    getPlantingSiteData();
  }, [delivery]);

  const facilityName = organization?.facilities?.find((f) => f.id === withdrawal?.facilityId)?.name;
  const overviewCardData = [
    {
      title: strings.DATE,
      data: withdrawal?.withdrawnDate ?? '',
    },
    {
      title: strings.PURPOSE,
      data: withdrawal?.purpose ?? '',
    },
    {
      title: strings.QUANTITY,
      data: delivery?.plantings?.reduce((acc, planting) => acc + planting.numPlants, 0)?.toString() ?? '',
    },
    {
      title: strings.FROM_NURSERY,
      data: facilityName ?? '',
    },
    {
      title: strings.DESTINATION,
      data: siteName,
    },
    {
      title: strings.TO_PLOT,
      data:
        delivery?.plantings?.reduce(
          (acc, planting) => (acc.length === 0 ? `${planting.plotId ?? ''}` : acc + `, ${planting.plotId ?? ''}`),
          ''
        ) ?? '',
    },
    {
      title: strings.NOTES,
      data: withdrawal?.notes ?? '',
    },
  ];

  return (
    <Box display='flex' flexDirection='column'>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.WITHDRAWAL}
      </Typography>
      <Grid container>
        {overviewCardData.map(
          (item) =>
            item.data.length > 0 && (
              <Grid item xs={isMobile ? 12 : 4} key={item.title}>
                <OverviewItemCard isEditable={false} title={item.title} contents={item.data} />
              </Grid>
            )
        )}
      </Grid>
      <Box marginTop={theme.spacing(1)}>
        <SpeciesTable species={species} delivery={delivery} />
      </Box>
      <Box marginTop={theme.spacing(4)}>
        <Photos />
      </Box>
    </Box>
  );
}
