import { useCallback, useMemo, useState } from 'react';

import _ from 'lodash';

type Func<T> = (previousValue: T | undefined) => T | undefined;
export type SetFn<T> = (data: Func<T> | T) => void;
export type UndoFn<T> = (() => T | undefined) | undefined;
export type RedoFn<T> = (() => T | undefined) | undefined;

/**
 * A useState like functionality that keeps track of changes
 * to support undo/redo.
 *
 * Returns array of [data, setData, undoFunction, redoFunction]
 * where,
 * - data is the current state of data
 * - setData allows updating data, thereby adding to the stack of changes that can be undone/redone
 * - undo is a callback function to undo last change, if function is 'undefined', undo is no longer possible (beginning of stack)
 * - redo is a callback function to redo last change, if function is 'undefined', redo is no longer possible (end of stack)
 */
export default function useUndoRedoState<T>(initialValue?: T): [T | undefined, SetFn<T>, UndoFn<T>, RedoFn<T>] {
  // kept in one state so that several changes in the same render each build on the previous one
  const [{ stack, stackIndex }, setHistory] = useState<{ stack: (T | undefined)[]; stackIndex: number }>({
    stack: [initialValue],
    stackIndex: 0,
  });

  const data = useMemo<T | undefined>(() => _.cloneDeep(stack[stackIndex]), [stackIndex, stack]);

  const setData = useCallback((input: Func<T> | T) => {
    setHistory((curr) => {
      const value = typeof input === 'function' ? (input as Func<T>)(_.cloneDeep(curr.stack[curr.stackIndex])) : input;
      const truncatedStack = curr.stack.slice(0, curr.stackIndex + 1);
      truncatedStack.push(_.cloneDeep(value));
      return { stack: truncatedStack, stackIndex: truncatedStack.length - 1 };
    });
  }, []);

  const undo = useMemo(() => {
    if (stackIndex > 0) {
      return () => {
        const undoneData = stack[stackIndex - 1];
        setHistory((curr) => ({ ...curr, stackIndex: Math.max(curr.stackIndex - 1, 0) }));
        return _.cloneDeep(undoneData);
      };
    } else {
      return undefined;
    }
  }, [stack, stackIndex]);

  const redo = useMemo(() => {
    if (stackIndex < stack.length - 1) {
      return () => {
        const redoneData = stack[stackIndex + 1];
        setHistory((curr) => ({ ...curr, stackIndex: Math.min(curr.stackIndex + 1, curr.stack.length - 1) }));
        return _.cloneDeep(redoneData);
      };
    } else {
      return undefined;
    }
  }, [stack, stackIndex]);

  return [data, setData, undo, redo];
}
