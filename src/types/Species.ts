// The backend supports reading/writing other species information
// but we currently only need access to name and id
type SpeciesType = {
  id: number,
  name: string,
};

export type SpeciesForChart = {
  species: SpeciesType;
  numberOfTrees: number;
  color: string;
};

export default SpeciesType;

