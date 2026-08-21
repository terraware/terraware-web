import { User } from 'src/types/User';

// Event names follow the convention "<Domain> <Object> <Past-tense Verb>"
// (e.g. "Accession Created", "Batch Withdrawn"). Past-tense encodes that the
// action completed; the domain prefix groups events in the Mixpanel sidebar.
// Fire events from successful API response paths or completed user actions,
// not from click handlers that may not result in a meaningful state change.

export enum MIXPANEL_EVENTS {
  // --- Seed bank ---
  ACCESSION_CREATED = 'Accession Created',
  ACCESSION_VIABILITY_TEST_RECORDED = 'Accession Viability Test Recorded',
  ACCESSION_WITHDRAWN = 'Accession Withdrawn',

  // --- Nursery / inventory ---
  BATCH_CREATED = 'Batch Created',
  BATCH_WITHDRAWAL_STARTED = 'Batch Withdrawal Started',
  BATCH_WITHDRAWAL_STEP_REACHED = 'Batch Withdrawal Step Reached',
  BATCH_WITHDRAWN = 'Batch Withdrawn',
  BATCH_QUANTITY_EDITED = 'Batch Quantity Edited',

  // --- Planting & plants ---
  PLANTING_SITE_CREATED = 'Planting Site Created',

  // --- Observations ---
  OBSERVATION_SCHEDULED = 'Observation Scheduled',
  SPECIES_MERGED = 'Species Merged',

  // --- Organization & people ---
  ORGANIZATION_CREATED = 'Organization Created',
  USER_INVITED = 'User Invited',
  USER_ROLE_UPDATED = 'User Role Updated',

  // --- Reporting & exports ---
  REPORT_VIEWED = 'Report Viewed',
  REPORT_DOWNLOADED = 'Report Downloaded',

  // --- Accelerator program (top-level CTAs and module interactions) ---
  ACCELERATOR_APPLY_BUTTON_CLICKED = 'Accelerator Apply Button Clicked',
  ACCELERATOR_TF_LINK_CLICKED = 'Accelerator TF Link Clicked',
  ACCELERATOR_MODULE_SESSION_EVENT_LINK_CLICKED = 'Accelerator Module Session Event Link Clicked',
  ACCELERATOR_MODULE_ADDITIONAL_LINK_CLICKED = 'Accelerator Module Additional Link Clicked',

  // --- Accelerator: Participant (forester) views ---
  PARTICIPANT_TODO_EVENT_VIEWED = 'Participant To-Do Event Viewed',
  PARTICIPANT_TODO_DELIVERABLE_VIEWED = 'Participant To-Do Deliverable Viewed',
  PARTICIPANT_DELIVERABLES_NAV_CLICKED = 'Participant Deliverables Nav Clicked',
  PARTICIPANT_MODULES_NAV_CLICKED = 'Participant Modules Nav Clicked',
  PARTICIPANT_DELIVERABLES_FILTER_APPLIED = 'Participant Deliverables Filter Applied',

  // --- Accelerator: Console (admin) views ---
  CONSOLE_DELIVERABLES_NAV_CLICKED = 'Console Deliverables Nav Clicked',
  CONSOLE_DELIVERABLES_FILTER_APPLIED = 'Console Deliverables Filter Applied',

  // --- Generic UI / Navigation ---
  TOP_BAR_HOME_CLICKED = 'Top Bar Home Clicked',
  SETTINGS_TAB_CLICKED = 'Settings Tab Clicked',

  // --- Friction / failure (Phase 2) ---
  FORM_VALIDATION_FAILED = 'Form Validation Failed',
  SAVE_FAILED = 'Save Failed',
  MODAL_ABANDONED = 'Modal Abandoned',

  // --- Species Intelligence ---
  SPECIES_INTELLIGENCE_BANNER_SHOWN = 'Species Intelligence Banner Shown',
  SPECIES_INTELLIGENCE_SETUP_PROMPT_SHOWN = 'Species Intelligence Setup Prompt Shown',
  SPECIES_INTELLIGENCE_SETUP_PROMPT_COMPLETED = 'Species Intelligence Setup Prompt Completed',
  SPECIES_INTELLIGENCE_SETUP_PROMPT_CANCELLED = 'Species Intelligence Setup Prompt Cancelled',
  SPECIES_INTELLIGENCE_PROJECT_LOCATION_SET = 'Species Intelligence Project Location Set',
  SPECIES_INTELLIGENCE_STATUS_INDICATOR_HOVERED = 'Species Intelligence Status Indicator Hovered',
  SPECIES_INTELLIGENCE_CHECK_RUN = 'Species Intelligence Check Run',
  SPECIES_INTELLIGENCE_CHECK_COMPLETED = 'Species Intelligence Check Completed',
  SPECIES_INTELLIGENCE_OVERRIDE_CREATED = 'Species Intelligence Override Created',
  SPECIES_AUTOFILL_FIELD_EDITED = 'Species Autofill Field Edited',
  SPECIES_INTELLIGENCE_SOURCE_ATTRIBUTION_HOVERED = 'Species Intelligence Source Attribution Hovered',
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
  [MIXPANEL_EVENTS.ACCESSION_VIABILITY_TEST_RECORDED]: {
    test_type: string;
  };
  [MIXPANEL_EVENTS.ACCESSION_WITHDRAWN]: {
    purpose: string;
    quantity?: number;
  };
  [MIXPANEL_EVENTS.BATCH_CREATED]: {
    species_id?: number;
    from_accession: boolean;
  };
  [MIXPANEL_EVENTS.BATCH_WITHDRAWAL_STARTED]: {
    batch_count: number;
    source_page?: string;
  };
  [MIXPANEL_EVENTS.BATCH_WITHDRAWAL_STEP_REACHED]: {
    step: string;
  };
  [MIXPANEL_EVENTS.BATCH_WITHDRAWN]: {
    purpose: string;
    batch_count: number;
    has_photos: boolean;
  };
  [MIXPANEL_EVENTS.PLANTING_SITE_CREATED]: {
    num_strata?: number;
    has_boundary: boolean;
  };
  [MIXPANEL_EVENTS.OBSERVATION_SCHEDULED]: {
    duration_days?: number;
  };
  [MIXPANEL_EVENTS.SPECIES_MERGED]: {
    count: number;
  };
  [MIXPANEL_EVENTS.ORGANIZATION_CREATED]: {
    organization_type?: string;
    has_country_code: boolean;
    num_managed_locations: number;
  };
  [MIXPANEL_EVENTS.USER_INVITED]: {
    role: string;
  };
  [MIXPANEL_EVENTS.USER_ROLE_UPDATED]: {
    new_role: string;
  };
  [MIXPANEL_EVENTS.REPORT_VIEWED]: {
    viewer_persona: 'accelerator_admin' | 'funder' | 'forester';
  };
  [MIXPANEL_EVENTS.REPORT_DOWNLOADED]: {
    report_type: string;
    format: string;
    row_count?: number;
  };
  [MIXPANEL_EVENTS.FORM_VALIDATION_FAILED]: {
    form_name: string;
    error_count: number;
    fields_with_errors?: string[];
  };
  [MIXPANEL_EVENTS.SAVE_FAILED]: {
    entity_type: string;
    error_details?: string;
  };
  [MIXPANEL_EVENTS.MODAL_ABANDONED]: {
    modal_name: string;
    time_open_seconds: number;
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_BANNER_SHOWN]: Record<string, never>;
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_SETUP_PROMPT_SHOWN]: {
    project_count: number;
    trigger: string;
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_SETUP_PROMPT_COMPLETED]: {
    project_count: number;
    countries_set: number;
    botanical_country_set: number;
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_SETUP_PROMPT_CANCELLED]: {
    project_count: number;
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_PROJECT_LOCATION_SET]: {
    project_id: number;
    country_code?: string;
    botanical_country_id?: string;
    set_at: 'creation' | 'edit';
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_STATUS_INDICATOR_HOVERED]: {
    species_id: number;
    status_state: 'invasive' | 'introduced' | 'native' | 'unknown';
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_CHECK_RUN]: {
    project_scope: 'all' | number;
    species_count: number;
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_CHECK_COMPLETED]: {
    project_scope: 'all' | number;
    species_count: number;
    invasive_count: number;
    unknown_count: number;
    duration_ms: number;
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_OVERRIDE_CREATED]: {
    project_scope?: number;
    species_id: number;
    justification_length: number;
  };
  [MIXPANEL_EVENTS.SPECIES_AUTOFILL_FIELD_EDITED]: {
    species_id?: number;
    field_name: string;
    time_since_autofill_ms: number;
  };
  [MIXPANEL_EVENTS.SPECIES_INTELLIGENCE_SOURCE_ATTRIBUTION_HOVERED]: {
    species_id: number;
    field_name?: string;
    source: string;
  };
};
