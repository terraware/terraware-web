import { Accession } from "../types/accessions";

export const emptyAccession: Accession = {
  species: null,
  family: null,
  trees: null,
  founder: null,
  endangered: null,
  rare: null,
  fieldNotes: null,
  collectedOn: null,
  receivedOn: null,
  primaryCollector: null,
  secondaryCollectors: [''],
  site: null,
  landowner: null,
  notes: null,
}

export const accession: Accession = {
  id: "USHA01001",
  species: "Kousa Dogwoord",
  family: null,
  trees: null,
  founder: null,
  endangered: null,
  rare: null,
  fieldNotes: null,
  collectedOn: '2020-12-25',
  receivedOn: null,
  primaryCollector: null,
  secondaryCollectors: [''],
  site: null,
  landowner: null,
  notes: null,
  state: 'processing',
  status: 'active'
}