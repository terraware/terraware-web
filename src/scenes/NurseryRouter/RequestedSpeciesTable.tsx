import React, { type JSX, type ReactNode, useMemo } from 'react';

import { Box, type SxProps, type Theme, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';
import {
  PlantingDateRequestRow,
  PlantingDateRequestSpeciesDetail,
  PlantingDateRequestStatus,
} from 'src/queries/search/plantingDateRequests';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import PlantingDateRequestFulfillmentBadge from './PlantingDateRequestFulfillmentBadge';

const requestedSpeciesColumns = 'minmax(0, 1fr) auto auto minmax(max-content, 1fr)';

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

type RequestedSpeciesTableProps = {
  species: PlantingDateRequestSpeciesDetail[];
  requestedPlants: number;
  withdrawnPlants: number;
  status: string;
  /** Left off where the status column is too tight to hold it alongside the badge. */
  remainingPlants?: number;
};

/**
 * The quantities a planting date request asks for, as the table the dialog and the drawer share.
 */
export const RequestedSpeciesTable = ({
  species,
  requestedPlants,
  withdrawnPlants,
  status,
  remainingPlants,
}: RequestedSpeciesTableProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { format } = useNumberFormatter();

  const headerCell: SxProps<Theme> = {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: theme.palette.TwClrBg,
    borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    padding: theme.spacing(1),
  };

  const totalCell: SxProps<Theme> = {
    position: 'sticky',
    bottom: 0,
    zIndex: 1,
    backgroundColor: theme.palette.TwClrBgSecondary,
    padding: theme.spacing(1.5, 1),
  };

  return (
    <Box
      display='grid'
      gridTemplateColumns={requestedSpeciesColumns}
      marginLeft={theme.spacing(-1)}
      marginRight={theme.spacing(-1)}
    >
      <Row>
        <Typography fontSize='14px' fontWeight={600} sx={headerCell}>
          {strings.SPECIES}
        </Typography>
        <Typography fontSize='14px' fontWeight={600} textAlign='right' whiteSpace='nowrap' sx={headerCell}>
          {strings.REQUESTED}
        </Typography>
        <Typography fontSize='14px' fontWeight={600} textAlign='right' whiteSpace='nowrap' sx={headerCell}>
          {strings.WITHDRAWN}
        </Typography>
        <Typography fontSize='14px' fontWeight={600} textAlign='right' whiteSpace='nowrap' sx={headerCell}>
          {strings.STATUS}
        </Typography>
      </Row>

      {species.map((speciesDetail) => (
        <SpeciesRow
          key={speciesDetail.speciesId}
          species={speciesDetail}
          showRemaining={remainingPlants !== undefined}
        />
      ))}

      <Row>
        <Typography fontSize='16px' fontWeight={600} sx={totalCell}>
          {strings.TOTAL}
        </Typography>
        <Typography fontSize='16px' fontWeight={600} textAlign='right' whiteSpace='nowrap' sx={totalCell}>
          {format(requestedPlants)}
        </Typography>
        <Typography fontSize='16px' fontWeight={600} textAlign='right' whiteSpace='nowrap' sx={totalCell}>
          {format(withdrawnPlants)}
        </Typography>
        <Box display='flex' justifyContent='flex-end' alignItems='center' gap={theme.spacing(1)} sx={totalCell}>
          {remainingPlants !== undefined && remainingPlants > 0 && (
            <Typography fontSize='14px' color={theme.palette.TwClrTxtWarning} whiteSpace='nowrap'>
              {strings.formatString(strings.X_LEFT, format(remainingPlants))}
            </Typography>
          )}
          <PlantingDateRequestFulfillmentBadge status={status} />
        </Box>
      </Row>
    </Box>
  );
};

const Row = ({ children }: { children: ReactNode }): JSX.Element => <Box display='contents'>{children}</Box>;

const SpeciesRow = ({
  species,
  showRemaining,
}: {
  species: PlantingDateRequestSpeciesDetail;
  showRemaining: boolean;
}): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const { format } = useNumberFormatter();

  const remaining = Math.max(0, species.requestedQuantity - species.withdrawnQuantity);
  const cell: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 1),
    borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
  };

  return (
    <Row>
      <Typography fontSize='16px' fontStyle='italic' sx={cell}>
        {species.scientificName}
      </Typography>
      <Typography fontSize='16px' whiteSpace='nowrap' sx={{ ...cell, justifyContent: 'flex-end' }}>
        {format(species.requestedQuantity)}
      </Typography>
      <Typography fontSize='16px' whiteSpace='nowrap' sx={{ ...cell, justifyContent: 'flex-end' }}>
        {format(species.withdrawnQuantity)}
      </Typography>
      <Box sx={{ ...cell, justifyContent: 'flex-end', gap: theme.spacing(1) }}>
        {showRemaining && remaining > 0 && species.withdrawnQuantity > 0 && (
          <Typography fontSize='14px' color={theme.palette.TwClrTxtWarning} whiteSpace='nowrap'>
            {strings.formatString(strings.X_LEFT, format(remaining))}
          </Typography>
        )}
        <PlantingDateRequestFulfillmentBadge
          status={speciesStatus(species.requestedQuantity, species.withdrawnQuantity)}
        />
      </Box>
    </Row>
  );
};
