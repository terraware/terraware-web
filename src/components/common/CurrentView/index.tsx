import React, { useCallback, useState } from 'react';

import CurrentViewSelect, { DEFAULT_VIEW, ViewOption } from './CurrentViewSelect';

export { DEFAULT_VIEW } from './CurrentViewSelect';
export type { ViewOption } from './CurrentViewSelect';

export type CurrentViewProps = {
  defaultPreset?: string;
  defaultViewLabel?: string | null;
  id?: string;
  onPresetChange?: (preset: string) => void;
  presetViews?: ViewOption[];
};

const CurrentView = ({
  defaultPreset = DEFAULT_VIEW,
  defaultViewLabel,
  id,
  onPresetChange,
  presetViews,
}: CurrentViewProps) => {
  const [preset, setPreset] = useState(defaultPreset);

  const handleChange = useCallback(
    (value: string) => {
      setPreset(value);
      onPresetChange?.(value);
    },
    [onPresetChange]
  );

  return (
    <CurrentViewSelect
      defaultViewLabel={defaultViewLabel}
      id={id}
      onChange={handleChange}
      presetViews={presetViews}
      selected={preset}
    />
  );
};

export default CurrentView;
