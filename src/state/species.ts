import { atom } from 'recoil';

export interface SpeciesState {
  checkData: boolean;
}

export default atom<SpeciesState>({ key: 'species', default: { checkData: false } });
