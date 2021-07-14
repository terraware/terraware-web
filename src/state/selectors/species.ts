import { atom, selector } from "recoil";
import { getSpecies } from "../../api/species";
import { Species } from "../../api/types/species";

export const speciesAtom = atom({
  key: "speciesTrigger",
  default: 0,
});

export default selector<Species[]>({
  key: "speciesSelector",
  get: async ({ get }) => {
    get(speciesAtom);
    return await getSpecies();
  },
  set: ({ set }) => {
    set(speciesAtom, (v) => v + 1);
  },
});
