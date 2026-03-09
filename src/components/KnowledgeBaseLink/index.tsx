import React, { type JSX, useMemo } from 'react';
import { useLocation } from 'react-router';

import { IconButton, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import { useKnowledgeBaseLinks } from 'src/knowledgeBaseLinks';
import strings from 'src/strings';

export default function KnowledgeBaseLink(): JSX.Element {
  const theme = useTheme();
  const knowledgeBaseLinks = useKnowledgeBaseLinks();
  const location = useLocation();

  const currentLink = useMemo(() => {
    let link = knowledgeBaseLinks['/home'];
    for (const key in knowledgeBaseLinks) {
      if ((location.pathname + location.search).match(key)) {
        link = knowledgeBaseLinks[key as keyof typeof KnowledgeBaseLink];
      }
    }
    return link;
  }, [knowledgeBaseLinks, location]);

  const onClick = () => {
    window.open(currentLink, '_blank');
  };

  return (
    <Tooltip title={strings.KNOWLEDGE_BASE}>
      <IconButton id='knowledge-base' onClick={onClick}>
        <Icon name='iconHelp' size='medium' fillColor={theme.palette.TwClrIcn} />
      </IconButton>
    </Tooltip>
  );
}
