// The backend supports reading/writing other species information
// but we currently only need access to name and id
export type SpeciesType = {
    id?: number,
    name: string,
}
