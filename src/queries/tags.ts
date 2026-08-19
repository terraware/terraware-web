/**
 * Delete mutations must not invalidate the deleted entity's own id tag. Any still-mounted query
 * holding that tag would immediately refetch the entity that no longer exists and 404. Invalidate
 * the 'LIST' tag (plus any parent/summary tags) instead, and let navigation unmount the detail views.
 */
export enum QueryTagTypes {
  AcceleratorProjects = 'AcceleratorProjects',
  AcceleratorReport = 'AcceleratorReport',
  AcceleratorReportMedia = 'AcceleratorReportMedia',
  AccessionWithdrawals = 'AccessionWithdrawals',
  Accessions = 'Accessions',
  Activities = 'Activities',
  Deliveries = 'Deliveries',
  Disclaimer = 'Disclaimer',
  FunderActivities = 'FunderActivities',
  InventoryPlanning = 'InventoryPlanning',
  CommonIndicators = 'CommonIndicators',
  ProjectIndicators = 'ProjectIndicators',
  DraftPlantingSites = 'DraftPlantingSites',
  Funders = 'Funders',
  FundingEntities = 'FundingEntities',
  GlobalRolesUsers = 'GlobalRolesUsers',
  InternalInterests = 'InternalInterests',
  Modules = 'Modules',
  MonitoringPlots = 'MonitoringPlots',
  Notifications = 'Notifications',
  NurseryBatchPhotos = 'NurseryBatchPhotos',
  NurseryBatches = 'NurseryBatches',
  NurseryOrganizationSummary = 'NurseryOrganizationSummary',
  NurserySpeciesSummary = 'NurserySpeciesSummary',
  NurserySummary = 'NurserySummary',
  NurseryWithdrawalPhotos = 'NurseryWithdrawalPhotos',
  NurseryWithdrawals = 'NurseryWithdrawals',
  Observation = 'Observation',
  ObservationMedia = 'ObservationMedia',
  OrganizationMedia = 'OrganizationMedia',
  Splats = 'Splats',
  PlantingDateRequests = 'PlantingDateRequests',
  PlantingSeasonDates = 'PlantingSeasonDates',
  PlantingSeasons = 'PlantingSeasons',
  PlantingSiteSpeciesTargets = 'PlantingSiteSpeciesTargets',
  PlantingSiteSurvivalRate = 'PlantingSiteSurvivalRate',
  PlantingSites = 'PlantingSites',
  ProjectAcceleratorReport = 'ProjectAcceleratorReport',
  ProjectAcceleratorReportConfigs = 'ProjectAcceleratorReportConfigs',
  ProjectAcceleratorReportTargets = 'ProjectAcceleratorReportTargets',
  ProjectAcceleratorReportYear = 'ProjectAcceleratorReportYear',
  ProjectInternalUsers = 'ProjectInternalUsers',
  ProjectModules = 'ProjectModules',
  ProjectScores = 'ProjectScores',
  ProjectVotes = 'ProjectVotes',
  Projects = 'Projects',
  PublishedAcceleratorReport = 'PublishedAcceleratorReport',
  PublishedAcceleratorReportMedia = 'PublishedAcceleratorReportMedia',
  SeedbankSummary = 'SeedbankSummary',
  SeedFundReportMedia = 'SeedFundReportMedia',
  SeedFundReports = 'SeedFundReports',
  Species = 'Species',
  T0 = 'T0',
  TrackingStats = 'TrackingStats',
  UserPreferences = 'UserPreferences',
  Users = 'Users',
  ViabilityTests = 'ViabilityTests',
}

export const QUERY_TAGS = Object.values(QueryTagTypes);

export const acceleratorReportTag = (reportId: number) => ({ type: QueryTagTypes.AcceleratorReport, id: reportId });

export const acceleratorReportMediaTag = (fileId: number) => ({
  type: QueryTagTypes.AcceleratorReportMedia,
  id: fileId,
});

export const projectAcceleratorReportTag = (projectId: number) => ({
  type: QueryTagTypes.ProjectAcceleratorReport,
  id: projectId,
});

export const projectAcceleratorReportConfigsTag = (projectId: number) => ({
  type: QueryTagTypes.ProjectAcceleratorReportConfigs,
  id: projectId,
});

export const projectAcceleratorReportTargetsTag = (projectId: number) => ({
  type: QueryTagTypes.ProjectAcceleratorReportTargets,
  id: projectId,
});

export const projectAcceleratorReportYearTag = (projectId: number, year: number) => ({
  type: QueryTagTypes.ProjectAcceleratorReportYear,
  id: `${projectId}-${year}`,
});
