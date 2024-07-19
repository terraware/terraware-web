import React, { useCallback, useEffect, useState } from 'react';

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
import { requestListVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Document as DocumentType } from 'src/types/documentProducer/Document';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';

const isHTMLElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

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
    const element = document.getElementById(section.sectionNumber);
    if (!element) {
      // exit if element not found
      return;
    }

    if (!isHTMLElementInViewport(element)) {
      // scroll to section heading in the document, if not already in view
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [section.id, selectedSectionId, setSelectedSectionId]);

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
            marginRight: '8px',
            width: '16px',
          }}
        />
        <StyledTooltip arrow placement='left' title={label}>
          <Typography
            component='span'
            style={{
              color: isSelected ? theme.palette.TwClrTxtBrand : theme.palette.TwClrTxtSecondary,
              cursor: 'pointer',
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
  document: DocumentType;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DocumentOutlinePanel = ({ document, open, setOpen }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const [selectedSectionId, setSelectedSectionId] = useState<number>();
  const [sections, setSections] = useState<SectionVariableWithValues[]>();
  const [variables, setVariables] = useState<(VariableWithValues | SectionVariableWithValues)[]>();
  const result = useAppSelector((state) =>
    selectVariablesWithValues(state, document.variableManifestId, document.projectId)
  );

  useSelectorProcessor(result, setVariables);

  useEffect(() => {
    dispatch(requestListVariables(document.variableManifestId));
    dispatch(requestListVariablesValues({ projectId: document.projectId }));
  }, [dispatch, document.variableManifestId, document.projectId]);

  useEffect(() => {
    if (!selectedSectionId && variables) {
      const sectionVariables = variables.filter((variable) => variable.type === 'Section');
      setSections(sectionVariables as SectionVariableWithValues[]);
      if (sectionVariables.length) {
        setSelectedSectionId(sectionVariables[0].id);
      }
    }
  }, [selectedSectionId, variables]);

  return (
    <Box paddingTop='56px' width={open ? '200px' : '60px'}>
      <IconButton id='toggle-outline-panel-open' onClick={() => setOpen(!open)} sx={{ marginLeft: '16px' }}>
        <Icon name='iconIndex' size='medium' />
      </IconButton>

      {open && sections?.length && (
        <Box sx={{ overflowY: 'auto' }}>
          {sections.map((section, index) => (
            <SectionItem
              key={index}
              section={section}
              selectedSectionId={selectedSectionId}
              setSelectedSectionId={setSelectedSectionId}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DocumentOutlinePanel;
