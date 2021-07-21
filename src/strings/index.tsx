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
    SNACKBAR_MSG_NEW_SPECIES_ADDED: 'New species added just now.',
    SNACKBAR_MSG_CHANGES_SAVED: 'Changes saved just now.',
    SNACKBAR_MSG_SPECIES_DELETED: 'Species deleted just now.',
    EDIT_SPECIES: 'Edit Species',
    ADD_SPECIES: 'Add Species',
    ADD: 'Add',
    NEW_SPECIES: 'New Species',
  },
});

export default strings;
