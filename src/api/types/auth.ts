import { components } from './generated-schema';

export type TokenRequest =
  components['schemas']['Body_login_api_v1_token_post'];
export type TokenResponse = {
  access_token: string;
  token_type: 'Bearer';
};
