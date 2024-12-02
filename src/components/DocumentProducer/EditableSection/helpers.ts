import Prism, { TokenStream } from 'prismjs';
import 'prismjs/components/prism-markdown';
import { Descendant, NodeEntry, Range } from 'slate';

import strings from 'src/strings';
import { VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueSelectValue, VariableValueValue } from 'src/types/documentProducer/VariableValue';

import { CustomText, TextElement, VariableElement, isCustomText, isVariableElement } from './types';

export const editorDisplayVariableWithValues = (
  variable: VariableWithValues,
  separator: string,
  placeholder?: string,
  reference?: boolean
): string => {
  let result = '';
  switch (variable.type) {
    case 'Text':
    case 'Number':
    case 'Link':
    case 'Date':
      result = variable.values.map((v) => displayValue(v, placeholder)).join(separator);
      break;
    case 'Image':
      result = `${variable.values.length} ${strings.IMAGES}`;
      break;
    case 'Table':
      result = `${variable.values.length} ${strings.ENTRIES}`;
      break;
    case 'Select':
      const selectedValues = (variable.values[0] as VariableValueSelectValue)?.optionValues;
      result =
        variable.options
          .filter((o) => selectedValues?.includes(o.id))
          .map((o) => o.name)
          .join(', ') ||
        (placeholder ?? '');
      break;
  }

  return (result || (placeholder ?? '')) + (reference ? ` (${strings.REFERENCE})` : '');
};

export const displayValue = (value: VariableValueValue, placeholder?: string): string => {
  switch (value.type) {
    case 'Text':
      return value.textValue;
    case 'Number':
      return String(value.numberValue);
    case 'Link':
      return value.title ?? value.url;
    case 'Date':
      return value.dateValue;
    default:
      return placeholder ?? '';
  }
};

// From https://github.com/ianstormtaylor/slate/blob/main/site/examples/ts/markdown-preview.tsx
export const decorateMarkdown = ([node, path]: NodeEntry): Range[] => {
  const ranges: Range[] = [];

  if (!isCustomText(node)) {
    return ranges;
  }

  const getLength = (token: TokenStream): number => {
    if (token.length || typeof token === 'string') {
      return token.length;
    } else if (Array.isArray(token)) {
      return token.reduce((length, _token) => length + getLength(_token), 0);
    } else if (typeof token.content === 'string') {
      return token.content.length;
    }
    return 0;
  };

  const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
  let start = 0;

  for (const token of tokens) {
    const length = getLength(token);
    const end = start + length;

    if (typeof token !== 'string') {
      ranges.push({
        [token.type]: true,
        anchor: { path, offset: start },
        focus: { path, offset: end },
      });
    }

    start = end;
  }

  return ranges;
};

const getTokenContent = (token: TokenStream): string => {
  if (typeof token === 'string') {
    return token;
  } else if (Array.isArray(token)) {
    return token.map(getTokenContent).join('');
  } else {
    if (token.type && token.type === 'punctuation') {
      return '';
    }
    return getTokenContent(token.content);
  }
};

export const scrubMarkdown = (input: string): string => {
  const tokens = Prism.tokenize(input, Prism.languages.markdown);
  // We want to remove any tokens that are markdown punctuation
  return tokens.flatMap(getTokenContent).join('');
};

export const editorValueFromVariableValue = (
  variableValue: VariableValueValue,
  allValues: VariableWithValues[]
): Descendant => {
  switch (variableValue.type) {
    case 'SectionText':
      return { text: variableValue.textValue ?? '' } as CustomText;
    case 'SectionVariable':
      const value = allValues.find((v) => v.id === variableValue.variableId);
      return {
        type: 'variable',
        variableId: value?.id,
        children: [{ text: '' }],
        reference: variableValue.usageType === 'Reference',
      };
    default:
      return { text: '' } as CustomText;
  }
};

// This is the function used to format editor text into a format that can be embedded into the section text on the server
// For now, we are going to use Markdown https://www.markdownguide.org/basic-syntax/
const formatEditorChildren = (children: CustomText[]): string =>
  children.reduce((acc: string, textNode: CustomText) => {
    let text = textNode.text;
    if (textNode.bold) {
      // Going with asterisk bold
      // https://www.markdownguide.org/basic-syntax/#bold
      text = `**${textNode.text}**`;
    }

    return `${acc}${text}`;
  }, '');

export const variableValueFromEditorValue = (
  editorValue: VariableElement | TextElement,
  listPosition: number
): VariableValueValue => {
  if (isVariableElement(editorValue)) {
    return {
      id: -1,
      listPosition,
      type: 'SectionVariable',
      variableId: editorValue.variableId!,
      displayStyle: editorValue.reference ? undefined : 'Inline',
      usageType: editorValue.reference ? 'Reference' : 'Injection',
    };
  }
  return {
    id: -1,
    listPosition,
    type: 'SectionText',
    textValue: formatEditorChildren(editorValue.children),
  };
};
