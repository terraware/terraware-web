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
  collectedOn: null,
  receivedOn: '2020-12-25',
  primaryCollector: null,
  secondaryCollectors: [''],
  site: null,
  landowner: null,
  notes: null,
  state: 'processing',
  status: 'active',
  bags: ['7690876843685332', '4506798231292344'],
  photos: ['IMG-02302349.jpg', 'IMG-02302350.jpg'],
  geolocations: [`41°24'12.2"N 2°10'26.5"E`]
}