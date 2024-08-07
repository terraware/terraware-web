import React from 'react';

import { DatePicker, Dropdown, Textfield } from '@terraware/web-components';

import {
  ImageVariableWithValues,
  NumberVariable,
  SelectVariable,
  TableColumn,
} from 'src/types/documentProducer/Variable';
import { VariableValueImageValue } from 'src/types/documentProducer/VariableValue';

import DeliverableEditImages from '../DeliverableEditImages';
import { PhotoWithAttributesAndUrl } from '../EditImagesModal/PhotoSelector';

export type DeliverableEditableCellProps = {
  id: string;
  column: TableColumn;
  onChange: (value: unknown) => void;
  projectId: number;
  setDeletedImages: (variableId: number, values: VariableValueImageValue[]) => void;
  setImages: (variableId: number, values: VariableValueImageValue[]) => void;
  setNewImages: (variableId: number, values: PhotoWithAttributesAndUrl[]) => void;
  value?: string | number;
};

export const DeliverableEditableCell = ({
  id,
  column,
  onChange,
  projectId,
  setDeletedImages,
  setImages,
  setNewImages,
  value,
}: DeliverableEditableCellProps) => {
  switch (column.variable.type) {
    case 'Text':
      return <Textfield label='' id={id} type='text' onChange={onChange} value={value} />;
    case 'Number':
      return (
        <Textfield
          label=''
          id={id}
          type='number'
          min={(column.variable as NumberVariable).minValue}
          max={(column.variable as NumberVariable).maxValue}
          onChange={onChange}
          value={value}
        />
      );
    case 'Date':
      return (
        <DatePicker id={id} label='' onChange={onChange} value={value as string} aria-label={`${id}-datepicker`} />
      );
    case 'Select':
      const options = (column.variable as SelectVariable).options;
      return (
        <Dropdown
          onChange={onChange}
          options={options.map((opt) => ({
            label: opt.name,
            value: opt.id,
          }))}
          selectedValue={value}
          fullWidth={true}
        />
      );
    case 'Image':
      return (
        <DeliverableEditImages
          projectId={projectId}
          setDeletedImages={setDeletedImages}
          setImages={setImages}
          setNewImages={setNewImages}
          variable={column.variable as ImageVariableWithValues}
        />
      );
    default:
      return null;
  }
};

export default DeliverableEditableCell;
