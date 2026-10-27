import { createContext, useContext } from 'react';

// 'edit' is an existing planting site whose strata and substrata have server IDs to keep
export type EditorMode = 'draft' | 'edit';

export const EditorModeContext = createContext<EditorMode>('draft');

export const useEditorMode = (): EditorMode => useContext(EditorModeContext);
