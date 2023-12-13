import { renderHook, act } from '@testing-library/react-hooks';
import useUndoRedoState from './useUndoRedoState';

type Person = {
  name: string;
  age: number;
};

const dataWith = (result: any) => result.current[0];
const setDataWith = (result: any) => result.current[1];
const undoWith = (result: any) => result.current[2];
const redoWith = (result: any) => result.current[3];

describe('useUndoRedoState', () => {
  test('should show un-initialized value with nothing to undo or redo, upon initialization', () => {
    const { result } = renderHook(() => useUndoRedoState<Person>());

    const [data, setData, undo, redo] = result.current;

    expect(data).toBeUndefined();
    expect(setData).not.toBeUndefined();
    expect(undo).toBeUndefined();
    expect(redo).toBeUndefined();
  });

  test('should show initialized value with nothing to undo or redo, upon initialization', () => {
    const { result } = renderHook(() => useUndoRedoState<Person>({ name: 'bugs', age: 25 }));

    const [data, setData, undo, redo] = result.current;

    expect(data).toEqual({ name: 'bugs', age: 25 });
    expect(setData).not.toBeUndefined();
    expect(undo).toBeUndefined();
    expect(redo).toBeUndefined();
  });

  test('should allow setting data', () => {
    const { result } = renderHook(() => useUndoRedoState<Person>({ name: 'bugs', age: 25 }));

    act(() => void setDataWith(result)({ name: 'bunny', age: 5 }));

    expect(dataWith(result)).toEqual({ name: 'bunny', age: 5 });
    expect(undoWith(result)).not.toBeUndefined();
    expect(redoWith(result)).toBeUndefined();
  });

  test('should allow undoing data', () => {
    const { result } = renderHook(() => useUndoRedoState<Person>({ name: 'bugs', age: 25 }));

    act(() => void setDataWith(result)({ name: 'bunny', age: 5 }));
    act(() => void undoWith(result)());

    expect(dataWith(result)).toEqual({ name: 'bugs', age: 25 });
    expect(undoWith(result)).toBeUndefined();
  });

  test('should allow undoing data even with uninitialized value', () => {
    const { result } = renderHook(() => useUndoRedoState<Person>());

    act(() => void setDataWith(result)({ name: 'bunny', age: 5 }));
    act(() => void undoWith(result)());

    expect(dataWith(result)).toBeUndefined();
    expect(undoWith(result)).toBeUndefined();
  });

  test('should allow redoing data', () => {
    const { result } = renderHook(() => useUndoRedoState<Person>({ name: 'bugs', age: 25 }));

    act(() => void setDataWith(result)({ name: 'bunny', age: 5 }));
    expect(dataWith(result)).toEqual({ name: 'bunny', age: 5 });

    act(() => void undoWith(result)());
    expect(dataWith(result)).toEqual({ name: 'bugs', age: 25 });

    act(() => void redoWith(result)());
    expect(dataWith(result)).toEqual({ name: 'bunny', age: 5 });
  });

  test('should allow multiple undo/redo across history', () => {
    const { result } = renderHook(() => useUndoRedoState<Person>({ name: 'bugs', age: 25 }));

    act(() => void setDataWith(result)({ name: 'bunny', age: 5 }));
    act(() => void setDataWith(result)({ name: 'roadrunner', age: 35 }));
    act(() => void setDataWith(result)({ name: 'wiley', age: 55 }));

    expect(dataWith(result)).toEqual({ name: 'wiley', age: 55 });

    act(() => void undoWith(result)());
    expect(dataWith(result)).toEqual({ name: 'roadrunner', age: 35 });

    act(() => void undoWith(result)());
    expect(dataWith(result)).toEqual({ name: 'bunny', age: 5 });

    act(() => void redoWith(result)());
    expect(dataWith(result)).toEqual({ name: 'roadrunner', age: 35 });

    act(() => void redoWith(result)());
    expect(dataWith(result)).toEqual({ name: 'wiley', age: 55 });
  });

  test('changing data should clear redo stack', () => {
    const { result } = renderHook(() => useUndoRedoState<Person>({ name: 'bugs', age: 25 }));

    act(() => void setDataWith(result)({ name: 'bunny', age: 5 }));
    expect(dataWith(result)).toEqual({ name: 'bunny', age: 5 });

    act(() => void undoWith(result)());
    expect(dataWith(result)).toEqual({ name: 'bugs', age: 25 });

    act(() => void setDataWith(result)({ name: 'roadrunner', age: 35 }));
    expect(redoWith(result)).toBeUndefined();
  });
});
