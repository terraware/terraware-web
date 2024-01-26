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
 *  data is the current state of data
 *  setData allows updating data, thereby adding to the stack of changes that can be undone/redone
 *  undo is a callback function to undo last change, if function is 'undefined', undo is no longer possible (beginning of stack)
 *  redo is a callback function to redo last change, if function is 'undefined', redo is no longer possible (end of stack)
 */
export default function useUndoRedoState<T>(initialValue?: T): [T | undefined, SetFn<T>, UndoFn<T>, RedoFn<T>] {
  const [stack, setStack] = useState<(T | undefined)[]>([initialValue]);
  const [stackIndex, setStackIndex] = useState<number>(0);

  const data = useMemo<T | undefined>(() => _.cloneDeep(stack[stackIndex]), [stackIndex, stack]);

  const setData = useCallback(
    (input: Func<T> | T) => {
      const value = typeof input === 'function' ? (input as Func<T>)(_.cloneDeep(stack[stackIndex])) : input;
      setStack((curr: (T | undefined)[]) => {
        const truncatedStack = curr.slice(0, stackIndex + 1);
        truncatedStack.push(_.cloneDeep(value));
        return truncatedStack;
      });
      setStackIndex((curr: number) => curr + 1);
    },
    [stack, stackIndex, setStack]
  );

  const undo = useMemo(() => {
    if (stackIndex > 0) {
      return () => {
        const undoneData = stack[stackIndex - 1];
        setStackIndex((curr: number) => curr - 1);
        return _.cloneDeep(undoneData);
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
        return _.cloneDeep(redoneData);
      };
    } else {
      return undefined;
    }
  }, [stack, stackIndex, setStackIndex]);

  return [data, setData, undo, redo];
}
