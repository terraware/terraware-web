import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { IconName } from '@terraware/web-components';
import { Icon } from '@terraware/web-components';
import { Props as ButtonProps } from '@terraware/web-components/components/Button/Button';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import Button from 'src/components/common/button/Button';
import { useKnowledgeBaseLinks } from 'src/knowledgeBaseLinks';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';
import { isOwner } from 'src/utils/organization';

export type OnboardingCardRow = {
  buttonProps?: ButtonProps;
  secondaryButtonProps?: ButtonProps;
  icon: IconName;
  title: string;
  subtitle: string;
  enabled: boolean;
};

type OnboardingCardProps = {
  rows: OnboardingCardRow[];
};

const OnboardingCard = ({ rows }: OnboardingCardProps): JSX.Element => {
  const { isMobile, isDesktop } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const knowledgeBaseLinks = useKnowledgeBaseLinks();

  const adminTaskNumberStyle = {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: theme.palette.TwClrBgBrand,
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: '700',
    marginLeft: '16px',
  };

  const iconContainerStyle = {
    background: theme.palette.TwClrBaseGray025,
    borderRadius: '8px',
    display: 'flex',
    height: '88px',
    width: '88px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '8px',
    marginLeft: '24px',
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: isDesktop ? theme.palette.TwClrBg : 'transparent',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: isDesktop ? '16px' : 0,
      }}
    >
      {isDesktop && (
        <Box sx={{ paddingRight: '48px' }}>
          <img alt={strings.TERRAWARE_MOBILE_APP_IMAGE_ALT} src={'/assets/onboarding.png'} />
        </Box>
      )}
      <Box flexBasis={'100%'} alignSelf={'stretch'}>
        <Box display={'flex'} flexDirection={'column'} height={'100%'}>
          {isOwner(selectedOrganization) && (
            <Box paddingBottom={'24px'} sx={{ background: theme.palette.TwClrBg }} padding={2}>
              <Typography
                component='p'
                variant='h6'
                sx={{
                  color: theme.palette.TwClrTxt,
                  fontSize: '20px',
                  fontWeight: 600,
                  lineHeight: '28px',
                }}
              >
                {strings.GET_STARTED}
              </Typography>
              <Typography
                component='p'
                variant='h6'
                sx={{
                  color: theme.palette.TwClrTxt,
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                }}
              >
                {strings.GET_STARTED_SUBTITLE}
              </Typography>
            </Box>
          )}
          {rows.map((row, index) =>
            isDesktop ? (
              <Box
                key={index}
                sx={{
                  marginTop: '16px',
                  marginBottom: '16px',
                  marginLeft: '0px',
                  marginRight: '0px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  background: row.enabled ? theme.palette.TwClrBgSecondary : theme.palette.TwClrBg,
                  opacity: row.enabled ? 1 : 0.5,
                  borderRadius: '8px',
                  paddingTop: '24px',
                  paddingBottom: '24px',
                  position: 'relative',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  {isOwner(selectedOrganization) && <Box sx={adminTaskNumberStyle}>{index + 1}</Box>}
                  <Box sx={iconContainerStyle}>
                    <Icon size='large' name={row.icon} />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box
                    sx={{
                      marginLeft: '24px',
                    }}
                  >
                    <Typography
                      component='p'
                      variant='h6'
                      sx={{
                        color: theme.palette.TwClrTxt,
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: '24px',
                      }}
                    >
                      {row.title}
                    </Typography>
                    <Typography
                      component='p'
                      variant='h6'
                      sx={{
                        color: theme.palette.TwClrTxt,
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '24px',
                      }}
                    >
                      {row.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      marginLeft: '24px',
                      marginRight: '24px',
                      width: '25%',
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%',
                      flexShrink: '0',
                    }}
                  >
                    {row.buttonProps && row.enabled ? (
                      <Box display='flex' flexDirection='column' alignItems='center'>
                        <Button
                          priority='primary'
                          style={{
                            marginBottom: '16px',
                            width: isMobile ? '100%' : 'fit-content',
                          }}
                          type='productive'
                          size='medium'
                          {...row.buttonProps}
                        />
                        {row.secondaryButtonProps && (
                          <Button
                            priority='ghost'
                            style={{
                              margin: 0,
                            }}
                            type='productive'
                            size='medium'
                            {...row.secondaryButtonProps}
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography
                        component='p'
                        variant='h6'
                        sx={{
                          color: theme.palette.TwClrTxt,
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: '24px',
                        }}
                      >
                        {strings.COMPLETE}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ) : isMobile ? (
              <Box
                display={'flex'}
                flexDirection={'column'}
                sx={{
                  background: theme.palette.TwClrBgSecondary,
                  borderRadius: '8px',
                  opacity: row.enabled ? 1 : 0.5,
                  alignItems: 'center',
                  padding: 2,
                  marginTop: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  {isOwner(selectedOrganization) && <Box sx={adminTaskNumberStyle}>{index + 1}</Box>}
                  <Box
                    sx={{
                      ...iconContainerStyle,
                      marginLeft: isOwner(selectedOrganization) ? '24px' : 0,
                    }}
                  >
                    <Icon size='large' name={row.icon} />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 3,
                  }}
                >
                  <Typography
                    component='p'
                    variant='h6'
                    sx={{
                      color: theme.palette.TwClrTxt,
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '24px',
                    }}
                  >
                    {row.title}
                  </Typography>
                  <Typography
                    component='p'
                    variant='h6'
                    sx={{
                      color: theme.palette.TwClrTxt,
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '24px',
                      textAlign: 'center',
                    }}
                  >
                    {row.subtitle}
                  </Typography>
                </Box>
                <Box width={'100%'}>
                  {row.buttonProps && row.enabled ? (
                    <Box display='flex' flexDirection='column' alignItems='center'>
                      <Button
                        priority='primary'
                        style={{
                          marginBottom: '16px',
                          width: isMobile ? '100%' : 'fit-content',
                        }}
                        type='productive'
                        size='medium'
                        {...row.buttonProps}
                      />
                      {row.secondaryButtonProps && (
                        <Button
                          priority='ghost'
                          style={{
                            margin: 0,
                          }}
                          type='productive'
                          size='medium'
                          {...row.secondaryButtonProps}
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography
                      component='p'
                      variant='h6'
                      sx={{
                        color: theme.palette.TwClrTxt,
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: '24px',
                        textAlign: 'center',
                      }}
                    >
                      {strings.COMPLETE}
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <Box
                display={'flex'}
                flexDirection={'column'}
                sx={{
                  background: theme.palette.TwClrBgSecondary,
                  borderRadius: '8px',
                  opacity: row.enabled ? 1 : 0.5,
                  marginTop: 2,
                }}
              >
                <Box
                  key={index}
                  sx={{
                    marginTop: '16px',
                    marginBottom: '16px',
                    marginLeft: '0px',
                    marginRight: '0px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                    borderRadius: '8px',
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    {isOwner(selectedOrganization) && <Box sx={adminTaskNumberStyle}>{index + 1}</Box>}
                    <Box
                      sx={{
                        ...iconContainerStyle,
                        marginRight: '24px',
                      }}
                    >
                      <Icon size='large' name={row.icon} />
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box
                      sx={{
                        marginLeft: '24px',
                      }}
                    >
                      <Typography
                        component='p'
                        variant='h6'
                        sx={{
                          color: theme.palette.TwClrTxt,
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: '24px',
                        }}
                      >
                        {row.title}
                      </Typography>
                      <Typography
                        component='p'
                        variant='h6'
                        sx={{
                          color: theme.palette.TwClrTxt,
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '24px',
                        }}
                      >
                        {row.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box>
                  {row.buttonProps && row.enabled ? (
                    <Box display='flex' flexDirection='column' alignItems='center' paddingBottom={'24px'}>
                      <Button
                        priority='primary'
                        style={{
                          marginBottom: '16px',
                          width: isMobile ? '100%' : 'fit-content',
                        }}
                        type='productive'
                        size='medium'
                        {...row.buttonProps}
                      />
                      {row.secondaryButtonProps && (
                        <Button
                          priority='ghost'
                          style={{
                            margin: 0,
                          }}
                          type='productive'
                          size='medium'
                          {...row.secondaryButtonProps}
                        />
                      )}
                    </Box>
                  ) : (
                    <Box display='flex' flexDirection='column' alignItems='center' paddingBottom={'24px'}>
                      <Typography
                        component='p'
                        variant='h6'
                        sx={{
                          color: theme.palette.TwClrTxt,
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: '24px',
                        }}
                      >
                        {strings.COMPLETE}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )
          )}
          {!isOwner(selectedOrganization) && (
            <Box
              color={theme.palette.TwClrTxt}
              height='100%'
              display='flex'
              justifyContent='center'
              flexDirection='column'
              sx={{ background: isDesktop ? 'transparent' : theme.palette.TwClrBg }}
              marginTop={isDesktop ? 0 : 2}
              padding={isDesktop ? 0 : 2}
            >
              <Typography textAlign='center'>{strings.ONBOARDING_NON_ADMINS_MESSAGE}</Typography>
            </Box>
          )}
          {!isOwner(selectedOrganization) && (
            <Box
              border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
              borderRadius={2}
              padding={2}
              marginTop={isDesktop ? 'auto' : 2}
              marginBottom={2}
              sx={{ background: isDesktop ? 'transparent' : theme.palette.TwClrBg }}
            >
              <Box display={'flex'} paddingBottom={2} alignItems='center'>
                <Icon name='iconHelp' size='medium' fillColor={theme.palette.TwClrIcn} />
                <Typography color={theme.palette.TwClrBaseGray800} fontWeight={600} fontSize={'20px'} paddingLeft={1}>
                  {strings.KNOWLEDGE_BASE}
                </Typography>
              </Box>
              <Typography>
                {strings.formatString(
                  strings.DESCRIPTION_KNOWLEDGE_BASE_WITH_LINK,
                  <Link to={knowledgeBaseLinks['/home']} fontSize={'16px'} target='_blank'>
                    {strings.KNOWLEDGE_BASE}
                  </Link>
                )}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingCard;
