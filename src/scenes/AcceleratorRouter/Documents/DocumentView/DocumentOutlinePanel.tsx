import React, { type JSX, useCallback, useEffect, useRef, useState } from 'react';

import {
  Box,
  ButtonBase,
  IconButton,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses,
  useTheme,
} from '@mui/material';

import Icon from 'src/components/common/icon/Icon';
import { useIsVisible } from 'src/hooks/useIsVisible';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import { SectionVariableWithValues } from 'src/types/documentProducer/Variable';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.TwClrBgInverse,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.TwClrBgInverse,
  },
}));

type SectionItemProps = {
  ancestorSectionNumbers?: string[];
  section: SectionVariableWithValues;
  selectedSectionId: number | undefined;
  setSelectedSectionId: React.Dispatch<React.SetStateAction<number | undefined>>;
};

const SectionItem = ({
  ancestorSectionNumbers = [],
  section,
  selectedSectionId,
  setSelectedSectionId,
}: SectionItemProps): JSX.Element => {
  const theme = useTheme();
  const childSections = section.children.filter((child) => child.type === 'Section') as SectionVariableWithValues[];
  const label = `${section.sectionNumber}${section.parentSectionNumber ? '' : '.'} ${section.name}`;
  const isSelected = section.id === selectedSectionId;

  const onClick = useCallback(() => {
    // do nothing if already selected
    if (section.id === selectedSectionId) {
      return;
    }

    // update selected section id
    setSelectedSectionId(section.id);

    // exit if section has no section number
    if (!section.sectionNumber) {
      return;
    }

    // get document heading element
    const element = document.getElementById(section.sectionNumber) || document.getElementById(`${section.id}`);
    if (!element) {
      // exit if element not found
      return;
    }

    const currentPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    // get section heading in the document
    const newPosition = element.getBoundingClientRect();

    // if going up in the view, the header takes more space so more gap space is needed
    const headerGap = newPosition.top + window.scrollY - 146 < currentPosition ? 146 : 96;

    // scrolls to section heading with the gap
    window.scrollTo({ left: newPosition.left, top: newPosition.top + window.scrollY - headerGap, behavior: 'smooth' });
  }, [section.id, selectedSectionId, setSelectedSectionId, section.sectionNumber]);

  return (
    <Box>
      <ButtonBase
        disableRipple
        onClick={onClick}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          marginBottom: '24px',
          maxWidth: '100%',
        }}
      >
        <Box
          component='span'
          sx={{
            height: '4px',
            backgroundColor: isSelected ? theme.palette.TwClrBgBrand : 'transparent',
            borderBottomRightRadius: '2px',
            borderTopRightRadius: '2px',
            marginRight: '8px',
            width: '16px',
          }}
        />
        <StyledTooltip arrow placement='left' title={label}>
          <Typography
            component='span'
            style={{
              color: isSelected ? theme.palette.TwClrTxtBrand : theme.palette.TwClrTxtSecondary,
              fontSize: '14px',
              fontWeight: '600',
              paddingLeft: `${ancestorSectionNumbers.length * 24}px`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              userSelect: 'none',
              whiteSpace: 'noWrap',
            }}
          >
            {label}
          </Typography>
        </StyledTooltip>
      </ButtonBase>

      {!!childSections.length && (
        <Box>
          {childSections.map((childSection, childIndex) => (
            <SectionItem
              ancestorSectionNumbers={
                childSection.parentSectionNumber
                  ? [...ancestorSectionNumbers, childSection.parentSectionNumber]
                  : ancestorSectionNumbers
              }
              key={childIndex}
              section={childSection}
              selectedSectionId={selectedSectionId}
              setSelectedSectionId={setSelectedSectionId}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DocumentOutlinePanel = ({ open, setOpen }: Props): JSX.Element => {
  const visibilityBoxRef = useRef(null);
  const topIsVisible = useIsVisible(visibilityBoxRef);
  const { documentVariables } = useDocumentProducerData();

  const [selectedSectionId, setSelectedSectionId] = useState<number>();
  const [sections, setSections] = useState<SectionVariableWithValues[]>();

  useEffect(() => {
    if (!selectedSectionId && documentVariables) {
      const sectionVariables = documentVariables.filter((variable) => variable.type === 'Section');
      setSections(sectionVariables as SectionVariableWithValues[]);
      if (sectionVariables.length) {
        setSelectedSectionId(sectionVariables[0].id);
      }
    }
  }, [selectedSectionId, documentVariables]);

  return (
    <Box width={open ? '200px' : '60px'}>
      <Box ref={visibilityBoxRef} sx={{ height: '1px', marginBottom: '56px' }} />

      <Box
        sx={{
          bottom: !topIsVisible ? 0 : 'auto',
          maxWidth: '200px',
          position: !topIsVisible ? 'fixed' : 'relative',
          top: !topIsVisible ? '120px' : 'auto',
          transition: 'position 0.3s ease-in-out, top 0.3s ease-in-out',
        }}
      >
        <IconButton
          id='toggle-outline-panel-open'
          onClick={() => setOpen(!open)}
          sx={{
            marginLeft: '16px',
          }}
        >
          <Icon name='iconIndex' size='medium' />
        </IconButton>

        {open && sections?.length && (
          <Box sx={{ height: '100%', overflow: 'hidden' }}>
            <Box
              sx={{
                '&:hover': {
                  overflowY: 'auto',
                },
                maxHeight: '100%',
              }}
            >
              {sections.map((section, index) => (
                <SectionItem
                  key={index}
                  section={section}
                  selectedSectionId={selectedSectionId}
                  setSelectedSectionId={setSelectedSectionId}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DocumentOutlinePanel;
