import { Box, Container, Grid, Typography } from '@mui/material';
import { theme } from '@terraware/web-components';
import { useRef } from 'react';
import strings from 'src/strings';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TfMain from '../common/TfMain';
import EmptyStatePage from '../emptyStatePages/EmptyStatePage';

export default function PlantingSitesList(): JSX.Element {
  const contentRef = useRef(null);

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ paddingBottom: theme.spacing(3) }}>
          <Grid item xs={6}>
            <Typography fontSize='24px' fontWeight={600}>
              {strings.PLANTING_SITES}
            </Typography>
          </Grid>
        </Box>
      </PageHeaderWrapper>
      <Grid>
        <Box>
          <Container sx={{ paddingY: 4 }}>
            <EmptyStatePage pageName={'PlantingSites'} />
          </Container>
        </Box>
      </Grid>
    </TfMain>
  );
}
