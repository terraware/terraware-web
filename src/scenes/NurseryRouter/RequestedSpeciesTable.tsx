import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';
import {
  PlantingDateRequestRow,
  PlantingDateRequestSpeciesDetail,
  PlantingDateRequestStatus,
} from 'src/queries/search/plantingDateRequests';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingDateRequestFulfillmentBadge from './PlantingDateRequestFulfillmentBadge';

export const requestedSpeciesColumns = '2fr 1fr 1fr 2fr';

export const speciesStatus = (requestedQuantity: number, withdrawnQuantity: number): PlantingDateRequestStatus => {
  if (withdrawnQuantity <= 0) {
    return 'Pending';
  }
  return withdrawnQuantity >= requestedQuantity ? 'Fulfilled' : 'Partial';
};

export const useRequestedSpecies = (
  request: PlantingDateRequestRow
): { species: PlantingDateRequestSpeciesDetail[]; remainingPlants: number } => {
  const { activeLocale } = useLocalization();

  const species = useMemo(
    () =>
      request.species.toSorted((a, b) => a.scientificName.localeCompare(b.scientificName, activeLocale || undefined)),
    [activeLocale, request.species]
  );

  const remainingPlants = useMemo(
    () =>
      species.reduce(
        (total, speciesDetail) =>
          total + Math.max(0, speciesDetail.requestedQuantity - speciesDetail.withdrawnQuantity),
        0
      ),
    [species]
  );

  return useMemo(() => ({ species, remainingPlants }), [species, remainingPlants]);
};

/**
 * The quantities a planting date request asks for, laid out as the table the dialog and the drawer
 * share. Each surface supplies its own scrolling, so the header, the rows and the total are
 * separate pieces rather than one component.
 */
export const RequestedSpeciesTableHeader = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  return (
    <Box
      display='grid'
      gridTemplateColumns={requestedSpeciesColumns}
      gap={theme.spacing(1)}
      padding={theme.spacing(1, 0)}
      sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
    >
      <Typography fontSize='14px' fontWeight={600}>
        {strings.SPECIES}
      </Typography>
      <Typography fontSize='14px' fontWeight={600} textAlign='right'>
        {strings.REQUESTED}
      </Typography>
      <Typography fontSize='14px' fontWeight={600} textAlign='right'>
        {strings.WITHDRAWN}
      </Typography>
      <Typography fontSize='14px' fontWeight={600} textAlign='right'>
        {strings.STATUS}
      </Typography>
    </Box>
  );
};

type RequestedSpeciesTableRowProps = {
  species: PlantingDateRequestSpeciesDetail;
  /** Left off where the status column is too tight to hold it alongside the badge. */
  showRemaining?: boolean;
};

export const RequestedSpeciesTableRow = ({ species, showRemaining }: RequestedSpeciesTableRowProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { format } = useNumberFormatter();

  const remaining = Math.max(0, species.requestedQuantity - species.withdrawnQuantity);

  return (
    <Box
      display='grid'
      gridTemplateColumns={requestedSpeciesColumns}
      gap={theme.spacing(1)}
      alignItems='center'
      padding={theme.spacing(1.5, 0)}
      sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
    >
      <Typography fontSize='16px' fontStyle='italic'>
        {species.scientificName}
      </Typography>
      <Typography fontSize='16px' textAlign='right'>
        {format(species.requestedQuantity)}
      </Typography>
      <Typography fontSize='16px' textAlign='right'>
        {format(species.withdrawnQuantity)}
      </Typography>
      <Box display='flex' justifyContent='flex-end' alignItems='center' gap={theme.spacing(1)}>
        {showRemaining && remaining > 0 && species.withdrawnQuantity > 0 && (
          <Typography fontSize='14px' color={theme.palette.TwClrTxtWarning} noWrap>
            {strings.formatString(strings.X_LEFT, format(remaining))}
          </Typography>
        )}
        <PlantingDateRequestFulfillmentBadge
          status={speciesStatus(species.requestedQuantity, species.withdrawnQuantity)}
        />
      </Box>
    </Box>
  );
};

type RequestedSpeciesTableTotalProps = {
  requestedPlants: number;
  withdrawnPlants: number;
  status: string;
  /** Left off where the status column is too tight to hold it alongside the badge. */
  remainingPlants?: number;
};

export const RequestedSpeciesTableTotal = ({
  requestedPlants,
  withdrawnPlants,
  status,
  remainingPlants,
}: RequestedSpeciesTableTotalProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { format } = useNumberFormatter();

  return (
    <Box
      display='grid'
      gridTemplateColumns={requestedSpeciesColumns}
      gap={theme.spacing(1)}
      alignItems='center'
      padding={theme.spacing(1.5, 1)}
      marginLeft={theme.spacing(-1)}
      marginRight={theme.spacing(-1)}
      sx={{ backgroundColor: theme.palette.TwClrBgSecondary }}
    >
      <Typography fontSize='16px' fontWeight={600}>
        {strings.TOTAL}
      </Typography>
      <Typography fontSize='16px' fontWeight={600} textAlign='right'>
        {format(requestedPlants)}
      </Typography>
      <Typography fontSize='16px' fontWeight={600} textAlign='right'>
        {format(withdrawnPlants)}
      </Typography>
      <Box display='flex' justifyContent='flex-end' alignItems='center' gap={theme.spacing(1)}>
        {remainingPlants !== undefined && remainingPlants > 0 && (
          <Typography fontSize='14px' color={theme.palette.TwClrTxtWarning} noWrap>
            {strings.formatString(strings.X_LEFT, format(remainingPlants))}
          </Typography>
        )}
        <PlantingDateRequestFulfillmentBadge status={status} />
      </Box>
    </Box>
  );
};
