const toolbarContent = '& > .MuiBox-root';
const rightActions = `${toolbarContent} > .MuiBox-root:last-child`;
const internalButtons = `${rightActions} > .MuiBox-root`;
const composedInternalActions = `${internalButtons} > .MuiBox-root`;

// Flattens the MRT top toolbar on mobile so the search field and "Clear all filters" wrap onto their own rows.
export const mobileTopToolbarSx = {
  '@media (max-width: 767px)': {
    [toolbarContent]: {
      alignItems: 'center',
      flexWrap: 'wrap',
      rowGap: 0,
      '&::after': { content: '""', flexBasis: '100%', order: 1 },
    },
    [`${rightActions}, ${internalButtons}, ${composedInternalActions}`]: { display: 'contents' },
    [`${toolbarContent} > .MuiCollapse-root, ${rightActions} > .MuiCollapse-root`]: {
      flexBasis: '100%',
      marginTop: '0.5rem',
      order: 2,
      '& .MuiCollapse-wrapper, & .MuiCollapse-wrapperInner, & .MuiTextField-root': { width: '100%' },
    },
    [`${composedInternalActions} > .button`]: { marginTop: '0.5rem', order: 3, paddingLeft: 0 },
  },
};
