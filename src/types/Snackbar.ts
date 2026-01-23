import type { JSX } from 'react';

export type Priority = 'info' | 'critical' | 'warning' | 'success';
export type Title = string | string[] | undefined;
export type Message = string | (string | JSX.Element)[];
export type OnCloseMessage = {
  key?: string;
  label?: string;
  payload?: string | number | boolean | object;
};
export type Type = 'page' | 'toast';

export interface Snackbar {
  title?: Title;
  msg: Message;
  priority: Priority;
  type: Type;
  onCloseMessage?: OnCloseMessage;
}
