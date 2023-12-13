import { useCallback, useMemo, useState } from 'react';

export type SetFn<T> = (data: T) => void;
export type UndoFn = (() => void) | undefined;
export type RedoFn = (() => void) | undefined;

/**
 * A useState like functionality that keeps track of changes
 * to support undo/redo.
 *
 * Returns array of [data, setData, undoFunction, redoFunction]
 * where,
 *  data is the current state of data
 *  setData allows updating data, thereby adding to the history of changes that can be undone/redone
 *  undo is a callback function to undo last change, if function is 'undefined', undo is no longer possible (beginning of history)
 *  redo is a callback function to redo last change, if function is 'undefined', redo is no longer possible (end of history)
 */
export default function useUndoRedoState<T>(initialValue?: T): [T | undefined, SetFn<T>, UndoFn, RedoFn] {
  const [history, setHistory] = useState<(T | undefined)[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const data = useMemo<T | undefined>(() => history[historyIndex], [historyIndex]);

  const setData = useCallback(
    (value: T) => {
      setHistory((curr: (T | undefined)[]) => {
        const truncatedHistory = curr.splice(0, historyIndex + 1);
        truncatedHistory.push(value);
        return truncatedHistory;
      });
      setHistoryIndex((curr: number) => curr + 1);
    },
    [historyIndex, setHistory]
  );

  const undo = useMemo(() => {
    if (historyIndex > 0) {
      return () => void setHistoryIndex((curr: number) => curr - 1);
    } else {
      return undefined;
    }
  }, [historyIndex, setHistoryIndex]);

  const redo = useMemo(() => {
    if (historyIndex < history.length - 1) {
      return () => void setHistoryIndex((curr: number) => curr + 1);
    } else {
      return undefined;
    }
  }, [history.length, historyIndex, setHistoryIndex]);

  return [data, setData, undo, redo];
}
