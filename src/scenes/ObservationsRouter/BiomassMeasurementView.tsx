import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import BackToLink from 'src/components/common/BackToLink';
import Card from 'src/components/common/Card';
import TfMain from 'src/components/common/TfMain';
import Table from 'src/components/common/table';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { selectAdHocObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { BiomassMeasurementType } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';

type BiomassMeasurementViewProps = {
  selectedBiomass: BiomassMeasurementType;
};

export default function BiomassMeasurementView({ selectedBiomass }: BiomassMeasurementViewProps): JSX.Element {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();

  const gridSize = useMemo(() => {
    if (isMobile) {
      return 12;
    }
    return 4;
  }, [isMobile]);

  return <Page></Page>;
}
