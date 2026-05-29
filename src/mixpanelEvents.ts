import { User } from 'src/types/User';

// Event names follow the convention "<Domain> <Object> <Past-tense Verb>" for new
// entries (e.g. "Accession Created", "Batch Withdrawn"). Past-tense encodes that
// the action completed; the domain prefix groups events in the Mixpanel sidebar.
//
// Prefer adding new events to the Phase 1 section below over extending the legacy
// section. Legacy events are kept to preserve historical data continuity.

export enum MIXPANEL_EVENTS {
  // ===========================================================================
  // Legacy events (pre-convention) — Accelerator program, nav clicks, etc.
  // Do not extend; add new events in the Phase 1 section below.
  // ===========================================================================
  PART_EX_TO_DO_UPCOMING_VIEW_EVENT = 'To-Do/Upcoming View Event',
  PART_EX_TO_DO_UPCOMING_VIEW_DELIVERABLE = 'To-Do/Upcoming View Deliverable',
  TOP_BAR_HOME = 'Top Bar Home',
  PART_EX_LEFT_NAV_DELIVERABLES = 'Participant Deliverables Nav Click',
  PART_EX_LEFT_NAV_MODULES = 'Participant Modules Nav Click',
  CONSOLE_LEFT_NAV_DELIVERABLES = 'Console Deliverables Nav Click',
  ACCELERATOR_MDDULE_SESSION_EVENT_LINK = 'Accelerator Module Session Event Click',
  ACCELERATOR_MDDULE_ADDITIONAL_LINK = 'Accelerator Modules Additional Link Click',
  HOME_ACCELERATOR_APPLY_BUTTON = 'Apply to Accelerator Click',
  HOME_ACCELERATOR_TF_LINK = 'Accelerator TF Link Click',
  PART_EX_DELIVERABLES_LIST_FILTER = 'Participant Deliverables List Filter Applied',
  CONSOLE_DELIVERABLES_LIST_FILTER = 'Console Deliverables List Filter Applied',
  SETTINGS_TAB = 'Settings Tab Click',

  // ===========================================================================
  // Phase 1 events — core Terraware workflows.
  // Fire from successful API response paths (post-mutation), not from click handlers.
  // ===========================================================================

  // --- Seed bank ---
  ACCESSION_CREATED = 'Accession Created',
  ACCESSION_VIABILITY_TEST_RECORDED = 'Accession Viability Test Recorded',
  ACCESSION_WITHDRAWN = 'Accession Withdrawn',

  // --- Nursery / inventory ---
  BATCH_CREATED = 'Batch Created',
  BATCH_WITHDRAWN = 'Batch Withdrawn',
  BATCH_QUANTITY_EDITED = 'Batch Quantity Edited',

  // --- Planting & plants ---
  PLANTING_SITE_CREATED = 'Planting Site Created',
  PLANTING_SITE_PUBLISHED = 'Planting Site Published',
  DELIVERY_RECORDED = 'Delivery Recorded',
  SURVIVAL_RATE_VIEWED = 'Survival Rate Viewed',

  // --- Observations ---
  OBSERVATION_SCHEDULED = 'Observation Scheduled',
  OBSERVATION_SUBMITTED = 'Observation Submitted',
  SPECIES_MERGED = 'Species Merged',

  // --- Organization & people ---
  ORGANIZATION_CREATED = 'Organization Created',
  USER_INVITED = 'User Invited',
  USER_ROLE_UPDATED = 'User Role Updated',

  // --- Reporting & exports ---
  REPORT_VIEWED = 'Report Viewed',
  REPORT_DOWNLOADED = 'Report Downloaded',
}

// Shape of the user profile written via mixpanel.people.set(). Keys prefixed with
// `$` are Mixpanel reserved properties (they populate built-in profile fields,
// filters, and dashboards); unprefixed keys are our custom properties.
export type MixpanelUserProfile = {
  $email: User['email'];
  $first_name?: User['firstName'];
  $last_name?: User['lastName'];
  $country_code?: User['countryCode'];
  $timezone?: User['timeZone'];
  locale?: User['locale'];
  email_notifs_enabled: User['emailNotificationsEnabled'];
  user_type: User['userType'];
  global_roles: User['globalRoles'];
  is_internal_user: boolean;
};

// Per-event property shapes. Each event added here gets compile-time checking of
// its property names + types at every track call site. Events NOT listed here
// accept any Record<string, unknown> — useful for legacy events and as a fallback
// while a new event is being designed. When instrumenting a Phase 1 event for the
// first time, add its shape to this map.
export type MixpanelEventPropertyMap = {
  [MIXPANEL_EVENTS.ACCESSION_CREATED]: {
    species_id?: number;
    initial_state?: string;
    has_photos: boolean;
    has_project_assigned: boolean;
  };
};
