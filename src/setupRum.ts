import { datadogRum } from '@datadog/browser-rum';
import { reactPlugin } from '@datadog/browser-rum-react';

import packageJson from '../package.json';

const tier = process.env.REACT_APP_TERRAWARE_TIER || 'dev';
const appVersion = process.env.REACT_APP_TERRAWARE_FE_BUILD_VERSION || packageJson.version;
const applicationId = process.env.REACT_APP_DATADOG_APP_ID;
const clientToken = process.env.REACT_APP_DATADOG_CLIENT_TOKEN;

export const canEnableRum = (): boolean => {
  return !(tier === 'test' || !appVersion || !applicationId || !clientToken);
};

const setupRum = () => {
  datadogRum.init({
    applicationId: applicationId as string,
    clientToken: clientToken as string,
    site: 'us3.datadoghq.com',
    service: 'terraware-web',
    env: tier,

    version: appVersion,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0,
    defaultPrivacyLevel: 'mask-user-input',
    plugins: [reactPlugin({ router: true })],
  });
};

export default setupRum;
