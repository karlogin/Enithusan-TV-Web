# Color — Apple Human Interface Guidelines

## Key Principles

**Consistency and Clarity**: Use color consistently throughout your interface, especially when it communicates information like status or interactivity. An accent color used for links in one place should mean the same thing everywhere.

**Accessibility Across Contexts**: Ensure all colors work well in light, dark, and increased contrast contexts. System colors adapt automatically; custom colors require manual light/dark/high-contrast variants.

**Testing**: Test under various lighting conditions and on different devices — colors look different in direct sunlight, dim light, and on displays with varying color profiles.

## Accessibility

Never rely on color alone to convey information. When color communicates meaning (e.g., red = error, green = success), always provide the same information through an alternative — an icon, label, or pattern — so users with color blindness or other visual disabilities can understand it.

Minimum contrast ratios (WCAG AA):
- 4.5:1 for text smaller than 18pt regular / 14pt bold
- 3:1 for large text and UI components (borders, icons)
- 7:1 for AAA (enhanced) — target for critical text

## System Colors vs. Custom Colors

Prefer system-provided dynamic colors over hard-coded hex values:
- System colors automatically adapt to light/dark mode and contrast settings
- They carry semantic meaning users already understand (e.g., system red = destructive, system blue = interactive)
- Hard-coded colors break in dark mode unless you manually define variants

When you must use custom colors, define a color asset with light, dark, and high-contrast variants.

## Semantic Color Usage

- **Primary action / links**: system blue (iOS) or your brand's accent color
- **Destructive actions**: system red
- **Success / confirmation**: system green
- **Warning**: system orange or yellow
- **Labels**: system label colors (primary, secondary, tertiary, quaternary) — these adapt automatically
- **Backgrounds**: system background and grouped background colors

## Liquid Glass (visionOS / iOS 26+)

The Liquid Glass material has its own color behavior. Apply color sparingly — only for elements that truly benefit from emphasis, such as status indicators or primary actions. Over-tinting Liquid Glass degrades legibility and visual clarity.

## Dark Mode

All colors must have dark mode variants. General rules:
- Backgrounds get darker; foregrounds get lighter
- Avoid pure black backgrounds — use slightly elevated dark grays to create depth hierarchy
- Avoid pure white text on black — use near-white (e.g., rgba(255,255,255,0.85)) for softer contrast
- Shadows may need to be replaced with borders/glows in dark mode since dark shadows are invisible on dark backgrounds

## Web / CSS Equivalent

For web:
- Define all colors as CSS custom properties with light values on `:root` and dark overrides under `@media (prefers-color-scheme: dark)` plus `[data-theme="dark"]`
- Use `color-mix()` or OKLCH for perceptually uniform tinting
- Test with Chrome DevTools forced-colors emulation and Firefox's color blindness simulation
