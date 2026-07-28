import type React from 'react';

type StyleOverride = Record<string, string>;

/**
 * Returns onMouseOver/onMouseOut handlers that imperatively set inline styles,
 * replacing repeated onMouseOver/onMouseOut style mutations across the app.
 *
 * Usage:
 *   const brandHover = useHoverStyle(
 *     { background: 'var(--brand-hover, #8A9ABC)' },
 *     { background: 'var(--brand, #9EACCA)' },
 *   );
 *   <Link {...brandHover} to="/somewhere">Click me</Link>
 */
export function useHoverStyle<T extends HTMLElement = HTMLElement>(
  hoverStyle: Partial<StyleOverride>,
  defaultStyle: Partial<StyleOverride>,
): {
  onMouseOver: React.MouseEventHandler<T>;
  onMouseOut: React.MouseEventHandler<T>;
} {
  return {
    onMouseOver(e) { Object.assign(e.currentTarget.style, hoverStyle); },
    onMouseOut(e) { Object.assign(e.currentTarget.style, defaultStyle); },
  };
}

/**
 * Like useHoverStyle, but also adds a distinct "pressed" style while the
 * button/link is actively being clicked or tapped — giving clear visual
 * confirmation that the click registered, instead of the color barely
 * changing between hover and click.
 *
 * Usage:
 *   const brandPress = useHoverActiveStyle(
 *     { background: 'var(--brand-hover, #8A9ABC)' },   // hover
 *     { background: 'var(--brand-dark, #7B8BAF)' },    // active/pressed
 *     { background: 'var(--brand, #9EACCA)' },         // default (rest)
 *   );
 *   <Link {...brandPress} to="/somewhere">Click me</Link>
 */
export function useHoverActiveStyle<T extends HTMLElement = HTMLElement>(
  hoverStyle: Partial<StyleOverride>,
  activeStyle: Partial<StyleOverride>,
  defaultStyle: Partial<StyleOverride>,
): {
  onMouseOver: React.MouseEventHandler<T>;
  onMouseOut: React.MouseEventHandler<T>;
  onMouseDown: React.MouseEventHandler<T>;
  onMouseUp: React.MouseEventHandler<T>;
  onTouchStart: React.TouchEventHandler<T>;
  onTouchEnd: React.TouchEventHandler<T>;
} {
  return {
    onMouseOver(e) { Object.assign(e.currentTarget.style, hoverStyle); },
    onMouseOut(e) { Object.assign(e.currentTarget.style, defaultStyle); },
    onMouseDown(e) { Object.assign(e.currentTarget.style, activeStyle); },
    onMouseUp(e) { Object.assign(e.currentTarget.style, hoverStyle); },
    onTouchStart(e) { Object.assign(e.currentTarget.style, activeStyle); },
    onTouchEnd(e) { Object.assign(e.currentTarget.style, defaultStyle); },
  };
}
