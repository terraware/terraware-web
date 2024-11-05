import { BaseEditor, Element as SlateElement } from 'slate';
import { ReactEditor } from 'slate-react';

// Required type definitions for slatejs (https://docs.slatejs.org/concepts/12-typescript):
export type CustomText = { text: string };

export type VariableElement = {
  // This is unused, but required by Slate
  children: CustomText[];
  docId?: number;
  reference: boolean;
  type: 'variable';
  variableId?: number;
};

export type TextElement = {
  children: CustomText[];
  type: 'text';
};

export type SectionElement = {
  children: (VariableElement | TextElement)[];
  type: 'section';
};

export type ElementUnion = SectionElement | VariableElement | TextElement;

// For some reason the typeguards in Slate do not actually narrow the type
export const isVariableElement = (input: unknown): input is VariableElement =>
  SlateElement.isElementType(input, 'variable');
export const isTextElement = (input: unknown): input is TextElement => SlateElement.isElementType(input, 'text');
export const isSectionElement = (input: unknown): input is SectionElement =>
  SlateElement.isElementType(input, 'section');
export const isCustomText = (input: unknown): input is CustomText => (input as CustomText).text !== undefined;

// Slate editor will return everything as a Descendant, which is a union of our custom elements and CustomText
// This is used to disambiguate the two, since most of the operations going from Slate to variable values are in the
// context of the custom elements (ElementUnion)
// export const isSlateElementWithChildren = (input: unknown): input is ElementUnion =>
//   isArray((input as ElementUnion).children);

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: ElementUnion;
    Text: CustomText;
  }
}
