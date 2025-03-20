import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useFundingEntity, useLocalization, useUser } from 'src/providers';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

const SingleView = () => {
  const navigate = useNavigate();
  const location = useStateLocation();
  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const theme = useTheme();
  const { fundingEntity } = useFundingEntity();

  const canEdit = isAllowed('MANAGE_FUNDING_ENTITIES');

  const goToEditFundingEntity = useCallback(
    () =>
      navigate(
        getLocation(
          APP_PATHS.ACCELERATOR_FUNDING_ENTITIES_EDIT.replace(':fundingEntityId', `${fundingEntity?.id}`),
          location
        )
      ),
    [navigate, location, fundingEntity]
  );

  const rightComponent = useMemo(
    () =>
      activeLocale &&
      canEdit && (
        <Button
          label={strings.EDIT_FUNDING_ENTITY}
          icon='iconEdit'
          onClick={goToEditFundingEntity}
          size='medium'
          id='editFundingEntity'
        />
      ),
    [activeLocale, canEdit, goToEditFundingEntity]
  );

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.FUNDING_ENTITIES : '',
        to: APP_PATHS.ACCELERATOR_FUNDING_ENTITIES,
      },
    ],
    [activeLocale]
  );

  return (
    <Page crumbs={crumbs} title={fundingEntity?.name || ''} rightComponent={rightComponent}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: '24px' }}>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <TextField label={strings.NAME} id='name' type='text' value={fundingEntity?.name} display={true} />
          </Grid>
          {fundingEntity?.projects?.map((project, idx) => (
            <Grid key={idx} item xs={4}>
              <Typography fontSize='14px' fontWeight={400} lineHeight='20px' color={theme.palette.TwClrBaseGray500}>
                {strings.PROJECT}
              </Typography>
              <Box display='flex' flexDirection='row' flexWrap='wrap' marginTop={theme.spacing(1.5)}>
                <span>
                  <Link fontSize='16px' to={APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${project.id}`)}>
                    {project.name}
                  </Link>
                </span>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Page>
  );
};

export default SingleView;
