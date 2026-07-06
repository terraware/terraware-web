import React, { type JSX, useCallback } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import { APP_PATHS, LOGIN_LINK } from 'src/constants';
import { useGetPublicStatisticsQuery } from 'src/queries/generated/publicStatistics';
import strings from 'src/strings';
import { formatNumberScale } from 'src/utils/numbers';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const ASSETS = '/assets/learnMore';
const MAX_CONTENT_WIDTH = 1200;

type ImageInfo = {
  src: string;
  alt?: string;
};

type StatInfo = {
  value: string;
  label: string;
};

const STAT_PLACEHOLDER = '—';

const LearnMoreView = (): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const { data: statisticsData } = useGetPublicStatisticsQuery();
  const statistics = statisticsData?.statistics;

  const groupedStat = (value?: number): string =>
    value === undefined ? STAT_PLACEHOLDER : value.toLocaleString(navigator.language || 'en');
  const scaledStat = (value?: number): string => (value === undefined ? STAT_PLACEHOLDER : formatNumberScale(value, 1));

  const goToLogin = useCallback(() => {
    const redirect = encodeURIComponent(`${window.location.origin}${APP_PATHS.HOME}`);
    window.location.href = `${LOGIN_LINK}?redirect=${redirect}`;
  }, []);

  const brand = theme.palette.TwClrTxtBrand as string;
  const accent = theme.palette.TwClrTxtAccent as string;
  const textColor = theme.palette.TwClrTxt as string;
  const secondaryText = theme.palette.TwClrTxtSecondary as string;

  const sectionPadding = isMobile ? '48px 24px' : '80px 24px';

  const sharedImageStyles = {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '12px',
    boxShadow: '0px 8px 24px rgba(58, 68, 69, 0.16)',
  };

  const StatCallout = ({ value, label }: StatInfo): JSX.Element => (
    <Box
      sx={{
        border: `1px solid ${accent}`,
        borderRadius: '16px',
        background: theme.palette.TwClrBaseWhite,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 32px',
        minWidth: '200px',
      }}
    >
      <Typography sx={{ color: accent, fontSize: '48px', fontWeight: 600, lineHeight: '60px' }}>{value}</Typography>
      <Typography
        sx={{
          color: theme.palette.TwClrTxt,
          fontSize: '16px',
          marginTop: '4px',
          textAlign: 'center',
          lineHeight: '24px',
          fontWeight: 400,
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  const Bullets = ({ items }: { items: string[] }): JSX.Element => (
    <Box component='ul' sx={{ margin: '16px 0 0', paddingLeft: '24px' }}>
      {items.map((item, index) => (
        <Typography
          component='li'
          key={index}
          sx={{
            color: theme.palette.TwClrBaseBlack,
            fontSize: '16px',
            lineHeight: '24px',
            marginBottom: '12px',
            fontWeight: 400,
          }}
        >
          {item}
        </Typography>
      ))}
    </Box>
  );

  const OverlapImages = ({ primary, secondary }: { primary: ImageInfo; secondary: ImageInfo }): JSX.Element => {
    if (isMobile) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          <Box component='img' src={primary.src} alt={primary.alt ?? ''} sx={sharedImageStyles} />
          <Box component='img' src={secondary.src} alt={secondary.alt ?? ''} sx={sharedImageStyles} />
        </Box>
      );
    }

    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px' }}>
        <Box
          component='img'
          src={primary.src}
          alt={primary.alt ?? ''}
          sx={{ ...sharedImageStyles, position: 'absolute', top: 0, left: 0, width: '82%' }}
        />
        <Box
          component='img'
          src={secondary.src}
          alt={secondary.alt ?? ''}
          sx={{
            ...sharedImageStyles,
            position: 'absolute',
            bottom: 0,
            right: '-24px',
            width: '52%',
            border: `1px solid ${theme.palette.TwClrBaseGray100}`,
          }}
        />
      </Box>
    );
  };

  type FeatureSectionProps = {
    title: string;
    intro: string;
    bullets: string[];
    stat: StatInfo;
    images: JSX.Element;
    imageSide: 'left' | 'right';
  };

  const FeatureSection = ({ title, intro, bullets, stat, images, imageSide }: FeatureSectionProps): JSX.Element => {
    const content = (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: isMobile ? 0 : '48px' }}>
        <Typography sx={{ color: brand, fontSize: isMobile ? '24px' : '28px', fontWeight: 600 }}>{title}</Typography>
        <Typography
          sx={{
            color: theme.palette.TwClrBaseBlack,
            fontSize: '16px',
            lineHeight: '24px',
            marginTop: '16px',
            fontWeight: 400,
          }}
        >
          {intro}
        </Typography>
        <Bullets items={bullets} />
        <Box sx={{ marginTop: isMobile ? '32px' : 'auto', paddingTop: isMobile ? 0 : '40px' }}>
          <StatCallout value={stat.value} label={stat.label} />
        </Box>
      </Box>
    );

    const imageColumn = <Box sx={{ flex: 1, display: 'flex', alignItems: 'stretch', width: '100%' }}>{images}</Box>;

    if (isMobile) {
      return (
        <Box
          sx={{
            background: theme.palette.TwClrBaseGray025,
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            padding: '32px 24px',
          }}
        >
          {content}
          {imageColumn}
        </Box>
      );
    }

    return (
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: '40px',
            bottom: '48px',
            left: 0,
            right: 0,
            background: theme.palette.TwClrBaseGray025,
            borderRadius: '16px',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'row',
            gap: '48px',
            alignItems: 'stretch',
            padding: '0 48px',
          }}
        >
          {imageSide === 'left' ? (
            <>
              {imageColumn}
              {content}
            </>
          ) : (
            <>
              {content}
              {imageColumn}
            </>
          )}
        </Box>
      </Box>
    );
  };

  const CheckFeature = ({ text }: { text: string }): JSX.Element => (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1, gap: '18px' }}>
      <Box
        sx={{
          alignItems: 'center',
          background: theme.palette.TwClrBgBrand,
          display: 'flex',
          flexShrink: 0,
          height: '32px',
          justifyContent: 'center',
          width: '32px',
        }}
      >
        <Icon name='checkmark' size='medium' fillColor={theme.palette.TwClrBaseWhite as string} />
      </Box>
      <Typography
        sx={{
          color: theme.palette.TwClrBaseBlack,
          fontSize: '20px',
          fontWeight: 500,
          textAlign: 'center',
          lineHeight: '28px',
        }}
      >
        {text}
      </Typography>
    </Box>
  );

  const fieldContent = (
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ color: brand, fontSize: isMobile ? '24px' : '28px', fontWeight: 700 }}>
        {strings.LEARN_MORE_FIELD_TITLE}
      </Typography>
      <Typography sx={{ color: textColor, fontSize: '17px', lineHeight: 1.5, marginTop: '16px' }}>
        {strings.LEARN_MORE_FIELD_INTRO}
      </Typography>
      <Bullets
        items={[
          strings.LEARN_MORE_FIELD_BULLET_1,
          strings.LEARN_MORE_FIELD_BULLET_2,
          strings.LEARN_MORE_FIELD_BULLET_3,
        ]}
      />
    </Box>
  );

  return (
    <Box sx={{ background: theme.palette.TwClrBaseWhite, minHeight: '100vh', width: '100%' }}>
      <Box
        sx={{
          alignItems: 'center',
          background: theme.palette.TwClrBaseWhite,
          borderBottom: `1px solid ${theme.palette.TwClrBaseGray100}`,
          display: 'flex',
          justifyContent: 'space-between',
          padding: isMobile ? '16px 20px' : '20px 40px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box component='img' src='/assets/tw-tf-logo.svg' alt='Terraware by Terraformation' sx={{ height: '40px' }} />
        <Box sx={{ display: 'flex', gap: '12px' }}>
          <Button
            label={strings.LEARN_MORE_SIGN_UP}
            onClick={goToLogin}
            priority='primary'
            size='large'
            type='productive'
          />
          <Button label={strings.LEARN_MORE_LOGIN} onClick={goToLogin} priority='secondary' size='large' />
        </Box>
      </Box>

      <Box sx={{ padding: sectionPadding }}>
        <Box sx={{ margin: '0 auto', maxWidth: MAX_CONTENT_WIDTH, textAlign: 'center' }}>
          <Typography
            sx={{
              color: brand,
              fontSize: isMobile ? '40px' : '60px',
              fontWeight: 600,
              lineHeight: 1.1,
              margin: '0 auto',
              maxWidth: '760px',
            }}
          >
            {strings.LEARN_MORE_HERO_TITLE}
          </Typography>
          <Typography
            sx={{
              color: textColor,
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: 500,
              lineHeight: '28px',
              margin: '24px auto 0',
              maxWidth: '800px',
            }}
          >
            {strings.LEARN_MORE_HERO_SUBTITLE}
          </Typography>

          <Box
            sx={{
              alignItems: isMobile ? 'center' : 'flex-start',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '16px' : 0,
              justifyContent: 'center',
              margin: '48px auto 0',
              maxWidth: isMobile ? '100%' : '920px',
            }}
          >
            <Box
              component='img'
              src={`${ASSETS}/image1.png`}
              alt={strings.LEARN_MORE_HERO_IMAGE_ALT}
              sx={{ ...sharedImageStyles, position: 'relative', width: isMobile ? '100%' : '56%', zIndex: 1 }}
            />
            <Box
              component='img'
              src={`${ASSETS}/image2.png`}
              alt=''
              sx={{
                ...sharedImageStyles,
                border: `1px solid ${theme.palette.TwClrBaseGray100}`,
                marginLeft: isMobile ? 0 : '-10%',
                marginTop: isMobile ? 0 : '13%',
                position: 'relative',
                width: isMobile ? '100%' : '56%',
                zIndex: 2,
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ padding: isMobile ? '0 24px 16px' : '0 24px 24px' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '24px',
            margin: '0 auto',
            maxWidth: MAX_CONTENT_WIDTH,
          }}
        >
          {(
            [
              { value: groupedStat(statistics?.totalOrganizations), label: strings.LEARN_MORE_STAT_ORGS_LABEL },
              { value: groupedStat(statistics?.totalCountries), label: strings.LEARN_MORE_STAT_COUNTRIES_LABEL },
              { value: scaledStat(statistics?.totalAreaUnderRestorationHa), label: strings.LEARN_MORE_STAT_AREA_LABEL },
            ] as StatInfo[]
          ).map((stat) => (
            <Box
              key={stat.label}
              sx={{
                alignItems: 'center',
                background: theme.palette.TwClrBgBrandGhostHover,
                borderRadius: '16px',
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ color: accent, fontSize: '60px', fontWeight: 600, lineHeight: '76px' }}>
                {stat.value}
              </Typography>
              <Typography sx={{ color: textColor, fontSize: '20px', fontWeight: 500, marginTop: '8px' }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Registered orgs banner */}
      <Box sx={{ padding: isMobile ? '0 24px 48px' : '0 24px 64px' }}>
        <Box
          sx={{
            background: theme.palette.TwClrBgBrandGhostHover,
            borderRadius: '16px',
            margin: '0 auto',
            maxWidth: MAX_CONTENT_WIDTH,
            padding: isMobile ? '24px' : '32px 40px',
          }}
        >
          <Typography
            sx={{
              color: brand,
              fontSize: isMobile ? '20px' : '26px',
              fontWeight: 600,
              lineHeight: 1.4,
              margin: '0 auto',
              maxWidth: '760px',
              textAlign: 'center',
            }}
          >
            {strings.LEARN_MORE_BANNER}
          </Typography>
        </Box>
      </Box>

      {/* Quote */}
      <Box sx={{ background: theme.palette.TwClrBaseGray050, padding: sectionPadding }}>
        <Box sx={{ margin: '0 auto', maxWidth: '900px', textAlign: 'center' }}>
          <Typography
            sx={{ color: secondaryText, fontSize: isMobile ? '24px' : '34px', fontWeight: 600, lineHeight: '44px' }}
          >
            “{strings.LEARN_MORE_QUOTE}”
          </Typography>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '20px',
              justifyContent: 'center',
              marginTop: '32px',
              textAlign: isMobile ? 'center' : 'left',
            }}
          >
            <Box
              component='img'
              src={`${ASSETS}/americanforestslogo.jpg`}
              alt={strings.LEARN_MORE_AMERICAN_FORESTS_ALT}
              sx={{ height: '64px', width: 'auto' }}
            />
            <Box>
              <Typography sx={{ color: secondaryText, fontSize: '16px', fontWeight: 600, lineHeight: '24px' }}>
                {strings.LEARN_MORE_QUOTE_AUTHOR}
              </Typography>
              <Typography sx={{ color: secondaryText, fontSize: '16px', fontWeight: 400, lineHeight: '24px' }}>
                {strings.LEARN_MORE_QUOTE_AUTHOR_TITLE}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* How can I use Terraware */}
      <Box sx={{ padding: isMobile ? '48px 24px 24px' : '72px 24px 24px', textAlign: 'center' }}>
        <Box
          component='img'
          src={`${ASSETS}/growing.png`}
          alt=''
          sx={{ height: 'auto', margin: '0 auto 24px', maxWidth: '240px', width: '60%' }}
        />
        <Typography sx={{ color: brand, fontSize: isMobile ? '30px' : '48px', fontWeight: 600, lineHeight: '60px' }}>
          {strings.LEARN_MORE_HOW_TITLE}
        </Typography>
      </Box>

      {/* Feature sections */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '48px',
          margin: '0 auto',
          maxWidth: MAX_CONTENT_WIDTH,
          padding: isMobile ? '32px 20px' : '48px 24px',
        }}
      >
        <FeatureSection
          title={strings.LEARN_MORE_SEED_BANK_TITLE}
          intro={strings.LEARN_MORE_SEED_BANK_INTRO}
          bullets={[strings.LEARN_MORE_SEED_BANK_BULLET_1, strings.LEARN_MORE_SEED_BANK_BULLET_2]}
          stat={{ value: scaledStat(statistics?.totalSeedsInStorage), label: strings.LEARN_MORE_STAT_SEEDS_LABEL }}
          imageSide='right'
          images={
            <OverlapImages primary={{ src: `${ASSETS}/image3.png` }} secondary={{ src: `${ASSETS}/image4.png` }} />
          }
        />

        <FeatureSection
          title={strings.LEARN_MORE_NURSERY_TITLE}
          intro={strings.LEARN_MORE_NURSERY_INTRO}
          bullets={[
            strings.LEARN_MORE_NURSERY_BULLET_1,
            strings.LEARN_MORE_NURSERY_BULLET_2,
            strings.LEARN_MORE_NURSERY_BULLET_3,
            strings.LEARN_MORE_NURSERY_BULLET_4,
          ]}
          stat={{
            value: scaledStat(statistics?.totalSeedlingsInNurseries),
            label: strings.LEARN_MORE_STAT_SEEDLINGS_LABEL,
          }}
          imageSide='left'
          images={
            <OverlapImages primary={{ src: `${ASSETS}/image5.png` }} secondary={{ src: `${ASSETS}/image6.png` }} />
          }
        />

        <FeatureSection
          title={strings.LEARN_MORE_PLANTING_SITE_TITLE}
          intro={strings.LEARN_MORE_PLANTING_SITE_INTRO}
          bullets={[strings.LEARN_MORE_PLANTING_SITE_BULLET_1, strings.LEARN_MORE_PLANTING_SITE_BULLET_2]}
          stat={{ value: scaledStat(statistics?.totalPlantings), label: strings.LEARN_MORE_STAT_PLANTINGS_LABEL }}
          imageSide='right'
          images={
            <OverlapImages primary={{ src: `${ASSETS}/image7.png` }} secondary={{ src: `${ASSETS}/image8.png` }} />
          }
        />
      </Box>

      {/* In the field */}
      <Box sx={{ margin: '0 auto', maxWidth: MAX_CONTENT_WIDTH, padding: isMobile ? '32px 20px' : '48px 24px' }}>
        {isMobile ? (
          <Box
            sx={{
              alignItems: 'center',
              background: theme.palette.TwClrBaseGray025,
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              padding: '32px 24px',
            }}
          >
            <Box sx={{ display: 'flex', flex: 1, gap: '16px', justifyContent: 'center' }}>
              <Box component='img' src={`${ASSETS}/image9.png`} alt='' sx={{ ...sharedImageStyles, maxWidth: '48%' }} />
              <Box
                component='img'
                src={`${ASSETS}/image10.png`}
                alt=''
                sx={{ ...sharedImageStyles, maxWidth: '48%' }}
              />
            </Box>
            {fieldContent}
          </Box>
        ) : (
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                top: '48px',
                bottom: '48px',
                left: 0,
                right: 0,
                background: theme.palette.TwClrBaseGray025,
                borderRadius: '16px',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'row',
                gap: '48px',
                alignItems: 'center',
                padding: '0 48px',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flex: 1,
                  gap: '16px',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component='img'
                  src={`${ASSETS}/image9.png`}
                  alt=''
                  sx={{ ...sharedImageStyles, maxWidth: '48%' }}
                />
                <Box
                  component='img'
                  src={`${ASSETS}/image10.png`}
                  alt=''
                  sx={{ ...sharedImageStyles, maxWidth: '48%' }}
                />
              </Box>
              {fieldContent}
            </Box>
          </Box>
        )}
      </Box>

      {/* Other features */}
      <Box sx={{ padding: sectionPadding }}>
        <Typography
          sx={{
            color: brand,
            fontSize: '28px',
            fontWeight: 600,
            marginBottom: '48px',
            textAlign: 'center',
            lineHeight: '36px',
          }}
        >
          {strings.LEARN_MORE_OTHER_FEATURES_TITLE}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '48px',
            margin: '0 auto',
            maxWidth: '960px',
          }}
        >
          <CheckFeature text={strings.LEARN_MORE_OTHER_FEATURE_1} />
          <CheckFeature text={strings.LEARN_MORE_OTHER_FEATURE_2} />
          <CheckFeature text={strings.LEARN_MORE_OTHER_FEATURE_3} />
        </Box>
      </Box>

      <Box sx={{ background: theme.palette.TwClrBaseGray700, padding: isMobile ? '48px 24px' : '72px 24px' }}>
        <Box sx={{ margin: '0 auto', maxWidth: MAX_CONTENT_WIDTH, textAlign: 'center' }}>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '24px',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                color: theme.palette.TwClrBaseWhite,
                fontSize: isMobile ? '28px' : '40px',
                fontWeight: 700,
                lineHeight: '52px',
              }}
            >
              {strings.LEARN_MORE_CTA_TITLE}
            </Typography>
            <Box sx={{ display: 'flex', gap: '12px' }}>
              <Button
                label={strings.LEARN_MORE_SIGN_UP}
                onClick={goToLogin}
                priority='primary'
                size='medium'
                sx={{
                  '&.button': {
                    background: theme.palette.TwClrBaseWhite,
                    borderColor: theme.palette.TwClrBaseWhite,
                    color: theme.palette.TwClrBaseBlack,
                  },
                }}
              />
              <Button
                label={strings.LEARN_MORE_LOGIN}
                onClick={goToLogin}
                priority='secondary'
                size='medium'
                sx={{
                  '&.button': {
                    background: 'transparent',
                    borderColor: theme.palette.TwClrBaseWhite,
                    color: theme.palette.TwClrBaseWhite,
                  },
                }}
              />
            </Box>
          </Box>
          <Typography
            sx={{
              color: theme.palette.TwClrBaseWhite,
              fontSize: '20px',
              marginTop: '32px',
              fontWeight: 400,
              lineHeight: '28px',
            }}
          >
            {strings.formatString(
              strings.LEARN_MORE_CTA_DEMO,
              <Box
                component='a'
                href={''}
                target='_blank'
                rel='noopener noreferrer'
                sx={{ color: `${theme.palette.TwClrBaseWhite} !important`, textDecoration: 'underline' }}
              >
                {strings.LEARN_MORE_CTA_PRODUCT_TEAM}
              </Box>
            )}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LearnMoreView;
