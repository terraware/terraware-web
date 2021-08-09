import LocalizedStrings from 'react-localization';

const strings = new LocalizedStrings({
  en: {
    CANCEL: 'Cancel',
    SAVE: 'Save',
    SAVE_CHANGES: 'Save Changes',
    GENERIC_ERROR: 'An error ocurred',
    DELETE: 'Delete',
    SPECIES_NAME: 'Species Name',
    DELETE_SPECIES: 'Delete Species',
    DELETE_CONFIRMATION_MODAL_MAIN_TEXT:
      'Are you sure you want to delete this species? This action cannot be undone. Any plants with this species will now be categorized as “Other” for its species.',
    DELETE_PLANT: 'Delete Plant',
    DELETE_PLANT_CONFIRMATION_MODAL_MAIN_TEXT:
      'Are you sure you want to delete this plant? This action cannot be undone.',
    SNACKBAR_MSG_NEW_SPECIES_ADDED: 'New species added just now.',
    SNACKBAR_MSG_CHANGES_SAVED: 'Changes saved just now.',
    SNACKBAR_MSG_SPECIES_DELETED: 'Species deleted just now.',
    SNACKBAR_MSG_PLANT_DELETED: 'Plant deleted just now.',
    EDIT_SPECIES: 'Edit Species',
    ADD_SPECIES: 'Add Species',
    ADD: 'Add',
    NEW_SPECIES: 'New Species',
    N_OF_TREES: '# of Trees',
    SPECIES: 'Species',
    NUMBER_OF_TREES: 'Number of Trees',
    AS_OF: 'As of',
    OTHER: 'Other',
    DASHBOARD: 'Dashboard',
    ALL_PLANTS: 'All Plants',
    LOGOUT: 'Logout',
    DATE: 'Date',
    GEOLOCATION: 'Geolocation',
    PHOTO: 'Photo',
    NOTES: 'Notes',
    EXISTING_SPECIES_MSG: 'Choose Existing Species',
    CREATE_NEW_SPECIES: 'Create New Species',
    TOTAL: 'Total',
    FILTERS: 'Filters',
    FROM: 'From',
    TO: 'To',
    APPLY_FILTERS: 'Apply Filters',
    CLEAR_FILTERS: 'Clear Filters',
  },
});

export default strings;
