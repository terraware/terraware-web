import React from 'react';

const Co2HectareYear = () => (
  <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>
    tCO
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        fontSize: '65%',
        bottom: '-0.2em',
        lineHeight: 0,
      }}
    >
      2
    </span>
    /ha/yr
  </span>
);

export default Co2HectareYear;
