export interface TextWithLinkProps {
  className?: string;
  href?: string;
  onClick?: () => void;
  text: string;
}

/**
 * Renders a string with an embedded link.
 *
 * @param className
 * @param text The text to render. The link should be surrounded by square brackets. For
 * example, `'See [Jane] run'` would be rendered as `See <a href=...>Jane</a> run`. If there are
 * no square brackets, [text] is rendered as a link. For example, `'See Jane run'` would be rendered
 * as, `<a href=...>See Jane run</a>`.
 */
export default function TextWithLink({ className, href, onClick, text }: TextWithLinkProps): JSX.Element {
  const linkStart = text.indexOf('[');
  const linkEnd = text.indexOf(']');
  let prefix: string;
  let linkText: string;
  let suffix: string;

  if (linkStart >= 0 && linkEnd >= 0) {
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
      {prefix}
      <a className={className} href={href} onClick={onClick}>
        {linkText}
      </a>
      {suffix}
    </>
  );
}
