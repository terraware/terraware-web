import { components } from 'src/api/types/generated-schema';

const schemas = 'schemas';

export type Report = components[typeof schemas]['GetReportPayloadV1'];

export type ListReport = components[typeof schemas]['ListReportsResponseElement'];

export type ReportFile = components[typeof schemas]['ListReportFilesResponseElement'];

export type ReportPhoto = components[typeof schemas]['ListReportPhotosResponseElement'];
