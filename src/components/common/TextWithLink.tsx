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
 * example, `'See [Jane] run'` would be rendered as `See <a href=...>Jane</a> run`.
 */
export default function TextWithLink({ className, href, onClick, text }: TextWithLinkProps): JSX.Element {
  const linkStart = text.indexOf('[');
  const linkEnd = text.indexOf(']');
  const prefix = text.substring(0, linkStart);
  const linkText = text.substring(linkStart + 1, linkEnd);
  const suffix = text.substring(linkEnd + 1);

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
