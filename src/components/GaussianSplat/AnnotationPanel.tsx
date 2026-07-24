import React, { useEffect } from 'react';

import { useTheme } from '@mui/material';

import { AnnotationProps } from './Annotation';

interface AnnotationPanelProps {
  annotation: AnnotationProps | null;
  onClose: () => void;
}

const BACKDROP_STYLE: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 5001,
  cursor: 'pointer',
};

const PANEL_STYLE: React.CSSProperties = {
  position: 'fixed',
  left: '2%',
  top: '10%',
  width: '60vw',
  height: '80vh',
  zIndex: 5002,
  backgroundColor: '#ffffff',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
};

const IMAGE_STYLE: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
  borderRadius: '12px 12px 0 0',
  flexShrink: 0,
};

const TEXT_BLOCK_STYLE: React.CSSProperties = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const AnnotationPanel = ({ annotation, onClose }: AnnotationPanelProps) => {
  const theme = useTheme();

  useEffect(() => {
    if (!annotation) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [annotation, onClose]);

  if (!annotation) {
    return null;
  }

  return (
    <>
      <div data-testid='annotation-panel-backdrop' style={BACKDROP_STYLE} onClick={onClose} />
      <div data-testid='annotation-panel' style={PANEL_STYLE}>
        {annotation.imageUrl && <img src={annotation.imageUrl} alt={annotation.title} style={IMAGE_STYLE} />}
        <div style={TEXT_BLOCK_STYLE}>
          {annotation.label && (
            <span
              data-testid='annotation-panel-label'
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: theme.palette.TwClrTxtSuccess,
                margin: 0,
                padding: theme.spacing(0.5, 1),
                backgroundColor: theme.palette.TwClrBgSuccessTertiary,
                border: `1px solid ${theme.palette.TwClrBrdrSuccess}`,
                borderRadius: theme.spacing(1),
              }}
            >
              {annotation.label}
            </span>
          )}
          <h2
            data-testid='annotation-panel-title'
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: theme.palette.TwClrTxt,
              margin: 0,
            }}
          >
            {annotation.title}
          </h2>
          {annotation.bodyText && (
            <p
              data-testid='annotation-panel-description'
              style={{
                fontSize: 16,
                color: theme.palette.TwClrTxt,
                lineHeight: '24px',
                margin: 0,
              }}
            >
              {annotation.bodyText}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default AnnotationPanel;
