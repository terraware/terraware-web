/* eslint-disable no-console */
import axios from "axios";

export const getSummaryUpdates = async (): Promise<any> => {
  const endpoint = `${process.env.REACT_APP_SEED_BANK_API}/api/v1/seedbank/summary`;

  return await (await axios.get(endpoint)).data;
};
