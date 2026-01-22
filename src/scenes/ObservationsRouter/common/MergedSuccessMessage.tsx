import React, { type JSX } from 'react';

import { MergeOtherSpeciesRequestData } from 'src/redux/features/species/speciesThunks';

/** Returns a message to show after "Other" species are successfully merged with known ones. */
export default function MergedSuccessMessage(merged: MergeOtherSpeciesRequestData[]): JSX.Element {
  return (
    <ul style={{ paddingLeft: '24px', margin: 0 }}>
      {merged.map((sp, index) => (
        <li key={index}>
          {sp.otherSpeciesName} &#8594; {sp.newName}
        </li>
      ))}
    </ul>
  );
}
