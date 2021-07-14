import axios from "axios";

const BASE_URL = `http://localhost:8008/api/v1`;

export type Token = {
  accessToken: string;
  tokenType: string;
};

export type User = {
  username: string;
  password: string;
  grant_type: string;
};

export const login = async (user: User): Promise<Token> => {
  const bodyFormData = new FormData();
  bodyFormData.append("username", user.username);
  bodyFormData.append("password", user.password);
  bodyFormData.append("grant_type", user.grant_type);
  const endpoint = `${BASE_URL}/token`;
  return (await axios.post(endpoint, bodyFormData)).data;
};
