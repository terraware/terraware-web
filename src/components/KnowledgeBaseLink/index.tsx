import React, { type JSX } from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { IconButton, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import { useKnowledgeBaseLinks } from 'src/knowledgeBaseLinks';
import strings from 'src/strings';

export default function KnowledgeBaseLink(): JSX.Element {
  const theme = useTheme();
  const knowledgeBaseLinks = useKnowledgeBaseLinks();
  const [currentLink, setCurrentLink] = useState(knowledgeBaseLinks['/home']);
  const location = useLocation();

  const onClick = () => {
    window.open(currentLink, '_blank');
  };

  useEffect(() => {
    setCurrentLink(knowledgeBaseLinks['/home']);
    for (const key in knowledgeBaseLinks) {
      if ((location.pathname + location.search).match(key)) {
        setCurrentLink(knowledgeBaseLinks[key as keyof typeof KnowledgeBaseLink]);
      }
    }
  }, [knowledgeBaseLinks, location]);

  return (
    <Tooltip title={strings.KNOWLEDGE_BASE}>
      <IconButton id='knowledge-base' onClick={onClick}>
        <Icon name='iconHelp' size='medium' fillColor={theme.palette.TwClrIcn} />
      </IconButton>
    </Tooltip>
  );
}
