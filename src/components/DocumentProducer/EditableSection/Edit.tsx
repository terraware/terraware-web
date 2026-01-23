import React, { type JSX, useCallback, useMemo, useRef, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Autocomplete, Button, DropdownItem } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { isKeyHotkey } from 'is-hotkey';
import { BaseEditor, Descendant, Element as SlateElement, Transforms, createEditor } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';

import strings from 'src/strings';
import { Section, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import InsertOptionsDropdown from './InsertOptionsDropdown';
import TextChunk from './TextChunk';
import TextVariable from './TextVariable';
import { editorValueFromVariableValue, variableValueFromEditorValue } from './helpers';

// Required type definitions for slatejs (https://docs.slatejs.org/concepts/12-typescript):
export type CustomElement = {
  type?: 'text' | 'variable';
  children: CustomText[];
  variableId?: number;
  docId: number;
  reference?: boolean;
};
export type CustomText = { text: string };
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

type EditableSectionEditProps = {
  section: Section;
  sectionValues?: VariableValueValue[];
  setSectionValues: (values: VariableValueValue[] | undefined) => void;
  allVariables: VariableWithValues[];
  docId: number;
  onEditVariableValue: (variable?: VariableWithValues) => void;
};

const SectionEdit = ({
  section,
  sectionValues,
  setSectionValues,
  allVariables,
  docId,
  onEditVariableValue,
}: EditableSectionEditProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const variableDropdownRef = useRef(null);

  const [editor] = useState(() => withInlines(withReact(createEditor())));
  const [insertOptionsDropdownAnchor, setInsertOptionsDropdownAnchor] = useState<HTMLElement | null>(null);
  const [variableToBeInserted, setVariableToBeInserted] = useState<VariableWithValues>();

  const initialValue: Descendant[] = useMemo(() => {
    const editorValue =
      sectionValues !== undefined && sectionValues.length > 0
        ? [
            {
              children: [
                { text: '' },
                ...sectionValues.map((value) => editorValueFromVariableValue(value, allVariables)),
                { text: '' },
              ],
            },
          ]
        : [{ children: [{ text: '' }] }];
    return editorValue as Descendant[];
  }, [sectionValues, allVariables]);

  const onChange = useCallback(
    (value: Descendant[]) => {
      const newVariableValues: VariableValueValue[] = [];
      value.forEach((v) => {
        const children = (v as SlateElement).children;
        if (children.length === 1 && children[0].text === '') {
          newVariableValues.push({
            id: -1,
            listPosition: newVariableValues.length,
            type: 'SectionText',
            textValue: '\n',
          });
        } else {
          children.forEach((c) => {
            if (c.text === undefined || c.text !== '') {
              newVariableValues.push(variableValueFromEditorValue(c, allVariables, newVariableValues.length));
            }
          });
        }
      });
      setSectionValues(newVariableValues);
    },
    [allVariables, setSectionValues]
  );

  const recommendedVariables = useMemo(
    () => allVariables.filter((v) => section.recommends?.includes(v.id)),
    [section, allVariables]
  );

  const renderElement = useCallback(
    (props: any) => {
      switch (props.element.type) {
        case 'variable': {
          const variable = allVariables.find((v) => v.id === props.element.variableId);
          return (
            <TextVariable
              isEditing
              icon='iconVariable'
              onClick={() => onEditVariableValue(variable)}
              reference={props.element.reference}
              variable={variable}
              {...props}
            />
          );
        }
        default:
          return <TextChunk {...props} />;
      }
    },
    [allVariables, onEditVariableValue]
  );

  const insertVariable = useCallback(
    (variable: VariableWithValues, reference?: boolean) => {
      Transforms.insertNodes(editor, {
        type: 'variable',
        children: [{ text: '' }],
        variableId: variable.id,
        docId,
        reference,
      });
    },
    [editor, docId]
  );

  const onInsertOptionSelection = (reference: boolean) => {
    if (variableToBeInserted) {
      insertVariable(variableToBeInserted, reference);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { selection } = editor;

      // This lets the user step into and out of the inline without stepping over characters.
      if (selection) {
        const { nativeEvent } = event;
        if (isKeyHotkey('left', nativeEvent)) {
          event.preventDefault();
          Transforms.move(editor, { unit: 'offset', reverse: true });
          return;
        }
        if (isKeyHotkey('right', nativeEvent)) {
          event.preventDefault();
          Transforms.move(editor, { unit: 'offset' });
          return;
        }
        if (isKeyHotkey('enter', nativeEvent)) {
          event.preventDefault();
          Transforms.insertNodes(editor, { text: '\n' });
          return;
        }
      }
    },
    [editor]
  );

  return (
    <>
      {recommendedVariables && recommendedVariables.length > 0 && (
        <>
          <InsertOptionsDropdown
            anchorElement={insertOptionsDropdownAnchor}
            setAnchorElement={setInsertOptionsDropdownAnchor}
            onSelect={onInsertOptionSelection}
          />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', paddingTop: theme.spacing(2) }}>
            <Typography fontSize='14px' fontWeight={400} paddingRight='3px'>
              {strings.RECOMMENDED}:
            </Typography>
            <Box sx={{ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }}>
              {recommendedVariables.map((variable) => (
                <Button
                  key={`variable-${variable.id}`}
                  rightIcon='iconAdd'
                  priority='ghost'
                  type='productive'
                  label={variable.name}
                  onClick={(event) => {
                    if (variable.type === 'Image' || variable.type === 'Table') {
                      setInsertOptionsDropdownAnchor(event?.currentTarget ?? null);
                      setVariableToBeInserted(variable);
                    } else {
                      insertVariable(variable);
                    }
                  }}
                  sx={{
                    borderRadius: 0,
                    padding: `0 ${theme.spacing(1)}`,
                    margin: 0,
                    backgroundColor: '#e9e2ba',
                    color: theme.palette.TwClrTxt,
                    fontWeight: 400,
                    minHeight: 'fit-content',
                    minWidth: 'fit-content',
                  }}
                />
              ))}
            </Box>
          </Box>
        </>
      )}

      <Box
        sx={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : '50%', marginTop: theme.spacing(2) }}
      >
        <Typography fontSize='14px' fontWeight={400} marginRight={theme.spacing(0.5)}>
          {strings.ALL_VARIABLES}:
        </Typography>
        <Box ref={variableDropdownRef} flexGrow={1}>
          <Autocomplete
            onChange={(value) => {
              if (!value || !(value as DropdownItem).value) {
                return;
              }

              const variable = (value as DropdownItem).value as VariableWithValues;
              insertVariable(variable);
            }}
            options={allVariables.map((v) => ({
              label: v.name,
              value: v,
            }))}
            sx={{
              background: theme.palette.TwClrBg,
              borderRadius: '8px',
            }}
          />
        </Box>
      </Box>

      <Box marginTop={theme.spacing(2)}>
        <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
          <Editable
            renderElement={renderElement}
            onKeyDown={onKeyDown}
            placeholder={strings.PLACEHOLDER}
            renderPlaceholder={({ children, attributes }) => (
              <Box sx={{ top: `${theme.spacing(1)} !important` }} {...attributes}>
                {children}
              </Box>
            )}
            style={{
              borderRadius: '8px',
              border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
              padding: theme.spacing(1),
              backgroundColor: theme.palette.TwClrBg,
              fontFamily: 'Inter',
              fontSize: '16px',
              overflow: 'scroll',
              resize: 'vertical',
            }}
          />
        </Slate>
      </Box>
    </>
  );
};

const withInlines = (editor: any) => {
  const { isInline, isElementReadOnly, isSelectable } = editor;

  editor.isInline = (element: any) => ['text', 'variable'].includes(element.type) || isInline(element);

  editor.isElementReadOnly = (element: any) => element.type === 'variable' || isElementReadOnly(element);

  editor.isSelectable = (element: any) => element.type !== 'variable' && isSelectable(element);

  return editor;
};

export default SectionEdit;
