import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useTheme } from '@mui/material';

import { AnnotationProps } from './Annotation';

interface AnnotationPanelProps {
  annotation: AnnotationProps | null;
  // Screen position (and rendered diameter) of the associated hotspot, relative
  // to the viewer, used to draw the connector line. Null until the hotspot's
  // position is known.
  hotspotPosition?: { x: number; y: number; size?: number } | null;
  onClose: () => void;
}

// Fallback hotspot diameter (px) when the rendered size isn't reported yet.
const DEFAULT_HOTSPOT_DIAMETER = 35;

// Horizontal gap (px) kept between the panel's right edge and the hotspot so
// the connector line stays visible.
const PANEL_HOTSPOT_GAP = 48;

// Minimum distance from the left edge of the viewer, as a fraction of its
// width, so the panel never drifts further left than this.
const MIN_LEFT_FRACTION = 0.02;

const CONNECTOR_STYLE: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'visible',
  zIndex: 5002,
};

const PANEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '2%',
  top: '50%',
  transform: 'translateY(-50%)',
  maxHeight: '80vh',
  zIndex: 5003,
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

const AnnotationPanel = ({ annotation, hotspotPosition, onClose }: AnnotationPanelProps) => {
  const theme = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<SVGSVGElement>(null);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);
  const [panelLeft, setPanelLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!annotation) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [annotation, onClose]);

  // Position the panel just to the left of the hotspot (clamped so it never
  // goes further left than MIN_LEFT_FRACTION of the viewer) and anchor the
  // connector line at the vertical center of the panel's right edge, in the
  // connector SVG's coordinate space.
  useLayoutEffect(() => {
    if (!annotation || !hotspotPosition || !panelRef.current || !connectorRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPanelLeft(null);
      setLineStart(null);
      return;
    }
    const panelWidth = panelRef.current.getBoundingClientRect().width;
    const connectorRect = connectorRef.current.getBoundingClientRect();
    const minLeft = connectorRect.width * MIN_LEFT_FRACTION;
    const desiredLeft = hotspotPosition.x - PANEL_HOTSPOT_GAP - panelWidth;
    const left = Math.max(desiredLeft, minLeft);
    setPanelLeft(left);
    setLineStart({
      x: left + panelWidth,
      y: connectorRect.height / 2,
    });
  }, [annotation, hotspotPosition]);

  if (!annotation) {
    return null;
  }

  const panelStyle: React.CSSProperties = {
    ...PANEL_STYLE,
    ...(annotation.imageUrl ? { width: '60vw' } : { width: 'fit-content', maxWidth: '50vw' }),
    ...(panelLeft !== null ? { left: `${panelLeft}px` } : {}),
  };

  // Stop the line at the edge of the hotspot circle
  let lineEnd: { x: number; y: number } | null = null;
  if (lineStart && hotspotPosition) {
    const dx = hotspotPosition.x - lineStart.x;
    const dy = hotspotPosition.y - lineStart.y;
    const dist = Math.hypot(dx, dy);
    const radius = (hotspotPosition.size ?? DEFAULT_HOTSPOT_DIAMETER) / 2;
    const t = dist > radius ? (dist - radius) / dist : 0;
    lineEnd = { x: lineStart.x + dx * t, y: lineStart.y + dy * t };
  }

  return (
    <>
      <svg ref={connectorRef} data-testid='annotation-panel-connector' style={CONNECTOR_STYLE}>
        {lineStart && lineEnd && (
          <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} stroke='#ffffff' strokeWidth={2} />
        )}
      </svg>
      <div ref={panelRef} data-testid='annotation-panel' style={panelStyle}>
        {annotation.imageUrl && <img src={annotation.imageUrl} alt={annotation.title} style={IMAGE_STYLE} />}
        <div style={TEXT_BLOCK_STYLE}>
          {annotation.label && (
            <span
              data-testid='annotation-panel-label'
              style={{
                alignSelf: 'flex-start',
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
