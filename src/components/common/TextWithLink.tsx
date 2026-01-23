import React, { CSSProperties, type JSX } from 'react';

import Link from './Link';

export interface TextWithLinkProps {
  fontSize?: string | number;
  handlePrefix?: (prefix: string) => string | JSX.Element[];
  handleSuffix?: (suffix: string) => string | JSX.Element[];
  href?: string;
  isExternal?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  text: string;
}

/**
 * Renders a string with an embedded link.
 *
 * @param style The styles to render.
 * @param text The text to render. The link should be surrounded by square brackets. For
 * example, `'See [Jane] run'` would be rendered as `See <a href=...>Jane</a> run`. If there are
 * no square brackets, [text] is rendered as a link. For example, `'See Jane run'` would be rendered
 * as, `<a href=...>See Jane run</a>`.
 * @param href The location to link to.
 * @param isExternal Whether the href is an external url.
 */
export default function TextWithLink({
  fontSize,
  handlePrefix,
  handleSuffix,
  href,
  isExternal,
  onClick,
  style,
  text,
}: TextWithLinkProps): JSX.Element {
  const linkStart = text.indexOf('[');
  const linkEnd = text.indexOf(']');
  let prefix: string;
  let linkText: string;
  let suffix: string;

  if (linkStart >= 0 && linkEnd >= 0 && linkStart < linkEnd) {
    prefix = text.substring(0, linkStart);
    linkText = text.substring(linkStart + 1, linkEnd);
    suffix = text.substring(linkEnd + 1);
  } else {
    prefix = '';
    linkText = text;
    suffix = '';
  }

  return (
    <>
      {handlePrefix ? handlePrefix(prefix) : prefix}
      {isExternal ? (
        <Link onClick={() => window.open(href)} fontSize={fontSize ?? '16px'} style={style}>
          {linkText}
        </Link>
      ) : (
        <Link to={href} onClick={onClick} fontSize={fontSize ?? '16px'} style={style}>
          {linkText}
        </Link>
      )}
      {handleSuffix ? handleSuffix(suffix) : suffix}
    </>
  );
}
