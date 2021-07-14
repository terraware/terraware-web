import axios from "axios";
import { Species } from "./types/species";

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1`;

export const getSpecies = async (): Promise<Species[]> => {
  const endpoint = `${BASE_URL}/species`;
  return (
    await axios.get(endpoint, {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZXhwIjoxNjI2MTA0NTk1fQ.tmnRTAsE5YRotNMX-ZR9KpgDsG3Eubc_3NWynTjR3XQ",
      },
    })
  ).data.species;
};
