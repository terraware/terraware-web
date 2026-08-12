/**
 * Delete mutations must not invalidate the deleted entity's own id tag. Any still-mounted query
 * holding that tag would immediately refetch the entity that no longer exists and 404. Invalidate
 * the 'LIST' tag (plus any parent/summary tags) instead, and let navigation unmount the detail views.
 */
export enum QueryTagTypes {
  AcceleratorProjects = 'AcceleratorProjects',
  /** A single accelerator report, keyed by report id. */
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
  PlantingSiteSurvivalRate = 'PlantingSiteSurvivalRate',
  PlantingSites = 'PlantingSites',
  /** Every accelerator report of a project, keyed by project id. */
  ProjectAcceleratorReport = 'ProjectAcceleratorReport',
  ProjectAcceleratorReportConfigs = 'ProjectAcceleratorReportConfigs',
  /** The indicator baselines and yearly targets of a project, keyed by project id. */
  ProjectAcceleratorReportTargets = 'ProjectAcceleratorReportTargets',
  /** Every accelerator report of a project in one year, keyed by `${projectId}-${year}`. */
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
