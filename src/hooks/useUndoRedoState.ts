import { useCallback, useMemo, useState } from 'react';

export type SetFn<T> = (data: T) => void;
export type UndoFn<T> = (() => T | undefined) | undefined;
export type RedoFn<T> = (() => T | undefined) | undefined;

/**
 * A useState like functionality that keeps track of changes
 * to support undo/redo.
 *
 * Returns array of [data, setData, undoFunction, redoFunction]
 * where,
 *  data is the current state of data
 *  setData allows updating data, thereby adding to the stack of changes that can be undone/redone
 *  undo is a callback function to undo last change, if function is 'undefined', undo is no longer possible (beginning of stack)
 *  redo is a callback function to redo last change, if function is 'undefined', redo is no longer possible (end of stack)
 */
export default function useUndoRedoState<T>(initialValue?: T): [T | undefined, SetFn<T>, UndoFn<T>, RedoFn<T>] {
  const [stack, setStack] = useState<(T | undefined)[]>([initialValue]);
  const [stackIndex, setStackIndex] = useState<number>(0);

  const data = useMemo<T | undefined>(() => stack[stackIndex], [stackIndex, stack]);

  const setData = useCallback(
    (value: T) => {
      setStack((curr: (T | undefined)[]) => {
        const truncatedStack = curr.splice(0, stackIndex + 1);
        truncatedStack.push(value);
        return truncatedStack;
      });
      setStackIndex((curr: number) => curr + 1);
    },
    [stackIndex, setStack]
  );

  const undo = useMemo(() => {
    if (stackIndex > 0) {
      return () => {
        const undoneData = stack[stackIndex - 1];
        setStackIndex((curr: number) => curr - 1);
        return undoneData;
      };
    } else {
      return undefined;
    }
  }, [stack, stackIndex, setStackIndex]);

  const redo = useMemo(() => {
    if (stackIndex < stack.length - 1) {
      return () => {
        const redoneData = stack[stackIndex + 1];
        setStackIndex((curr: number) => curr + 1);
        return redoneData;
      };
    } else {
      return undefined;
    }
  }, [stack, stackIndex, setStackIndex]);

  return [data, setData, undo, redo];
}
