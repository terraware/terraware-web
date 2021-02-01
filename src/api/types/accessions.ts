import { components } from "./generated-schema";

export type AccessionStatus = components["schemas"]["AccessionPayload"]["status"];
export type AccessionState = components["schemas"]["AccessionPayload"]["state"]
export type Accession = components["schemas"]["AccessionPayload"];
export type NewAccession = components["schemas"]["CreateAccessionRequestPayload"];

export const isAccession = (accession: NewAccession | Accession): accession is Accession => Boolean(accession.accessionNumber);
