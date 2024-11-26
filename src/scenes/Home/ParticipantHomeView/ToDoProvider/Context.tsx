import { createContext, useContext } from 'react';

import { ToDoItem } from 'src/types/ProjectToDo';

export type ToDoData = {
  projectId: number;
  toDoItems: ToDoItem[];
  upcomingItems: ToDoItem[];
};

// default values pointing to nothing
export const ToDoContext = createContext<ToDoData>({
  projectId: -1,
  toDoItems: [],
  upcomingItems: [],
});

export const useToDoData = () => useContext(ToDoContext);
