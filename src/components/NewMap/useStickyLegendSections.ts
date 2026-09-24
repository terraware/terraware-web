import { useCallback, useMemo, useState } from 'react';

import { useUser } from 'src/providers';

const PREFERENCE_NAME = 'collapsedMapLegendSections';

const entryFor = (view: string, section: string) => `${view}.${section}`;

const readStoredEntries = (stored: unknown): string[] =>
  Array.isArray(stored) ? stored.filter((entry): entry is string => typeof entry === 'string') : [];

const useStickyLegendSections = (view?: string) => {
  const { updateUserPreferences, userPreferences } = useUser();
  const [pendingEntries, setPendingEntries] = useState<string[]>();

  const storedEntries = useMemo(() => readStoredEntries(userPreferences[PREFERENCE_NAME]), [userPreferences]);
  // The reader's latest click stands until their preferences catch up with it.
  const entries = useMemo(() => new Set(pendingEntries ?? storedEntries), [pendingEntries, storedEntries]);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const isCollapsed = useCallback(
    (section: string) => (view === undefined ? !!collapsedSections[section] : entries.has(entryFor(view, section))),
    [collapsedSections, entries, view]
  );

  const toggleSection = useCallback(
    (section: string) => {
      if (view === undefined) {
        setCollapsedSections((current) => ({ ...current, [section]: !current[section] }));
        return;
      }

      const entry = entryFor(view, section);
      const next = new Set(entries);
      if (next.has(entry)) {
        next.delete(entry);
      } else {
        next.add(entry);
      }

      const nextEntries = [...next];
      setPendingEntries(nextEntries);
      void updateUserPreferences({ [PREFERENCE_NAME]: nextEntries });
    },
    [entries, updateUserPreferences, view]
  );

  return { isCollapsed, toggleSection };
};

export default useStickyLegendSections;
