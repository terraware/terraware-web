import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Checkbox, Chip, MenuItem, TextField } from '@mui/material';

import DatePicker from 'src/components/common/DatePicker';

export type SelectOption = { label: string; value: string };

export type MatrixEditorProps = {
  value: unknown;
  onSave: (value: string | string[]) => void;
  onCancel: () => void;
};

export const DateEditor = ({ value: initialValue, onSave, onCancel }: MatrixEditorProps) => {
  const [value, setValue] = useState(initialValue ? String(initialValue) : '');

  return (
    <DatePicker
      value={value ? new Date(value) : null}
      onDateChange={(date) => {
        setValue(date ? date.toLocaleString() : '');
        if (date) {
          onSave(date.toISODate() ?? '');
        } else {
          onCancel();
        }
      }}
      aria-label={''}
      id={''}
      label={undefined}
    />
  );
};

type SelectEditorProps = MatrixEditorProps & { options: SelectOption[] };

export const MultiSelectEditor = ({ value, onSave, options }: SelectEditorProps) => {
  const optionsMap = useMemo(
    () => new Map<string, string>(options.filter((opt) => opt.value && opt.label).map((opt) => [opt.value, opt.label])),
    [options]
  );
  const [selections, setSelections] = useState<string[]>(() =>
    (typeof value === 'string' && value.trim() ? value.trim().split(',') : [])
      .map((item) => item.trim())
      .map((label) => options.find((opt) => opt.label === label)?.value || '')
  );
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const onAdd = (optionValue: string | null) => {
    if (optionValue && !selections.includes(optionValue)) {
      setSelections([...selections, optionValue]);
    }
  };

  const onRemove = (optionValue: string | null) => {
    setSelections(selections.filter((selection) => selection !== optionValue));
  };

  const handleOpen = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setIsOpen(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    onSave(selections);
    setIsOpen(false);
  }, [onSave, selections]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        portalRef.current &&
        triggerRef.current &&
        !portalRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClose, isOpen]);

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          minHeight: '40px',
          cursor: 'pointer',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {selections.map((selection) => (
          <Chip
            key={selection}
            label={optionsMap.get(selection) || selection}
            size='small'
            onDelete={(e) => {
              e.stopPropagation();
              onRemove(selection);
            }}
          />
        ))}
        {selections.length === 0 && <span style={{ color: '#999' }}>Select options...</span>}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={portalRef}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 9999,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              maxHeight: '200px',
              overflowY: 'auto',
              minWidth: '200px',
            }}
          >
            {Array.from(optionsMap.entries()).map(([optionValue, label]) => (
              <div
                key={optionValue}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selections.includes(optionValue)) {
                    onRemove(optionValue);
                  } else {
                    onAdd(optionValue);
                  }
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #f0f0f0',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
                }}
              >
                <Checkbox checked={selections.includes(optionValue)} size='small' style={{ marginRight: '8px' }} />
                {label}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export const SelectEditor = ({ value, onSave, onCancel, options }: SelectEditorProps) => {
  const [selectedValue, setSelectedValue] = useState(
    () => options.find((opt) => opt.label === (value || ''))?.value || ''
  );

  const handleSave = () => onSave(selectedValue);

  return (
    <TextField
      select
      value={selectedValue}
      onChange={(e) => {
        setSelectedValue(e.target.value);
      }}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSave();
        } else if (e.key === 'Escape') {
          onCancel();
        }
      }}
      size='small'
      fullWidth
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

type TextEditorProps = MatrixEditorProps & { type: 'number' | 'url' };

export const TextEditor = ({ value: initialValue, onSave, onCancel, type }: TextEditorProps) => {
  const [value, setValue] = useState(() =>
    type === 'number' ? String(initialValue || 0) : initialValue ? String(initialValue) : ''
  );

  const handleSave = () => onSave(value);

  return (
    <TextField
      type={type}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={handleSave}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSave();
        } else if (e.key === 'Escape') {
          onCancel();
        }
      }}
      size='small'
      fullWidth
      placeholder={type === 'url' ? 'https://...' : undefined}
    />
  );
};
