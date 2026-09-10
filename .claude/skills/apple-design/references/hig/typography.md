# Typography — Apple Human Interface Guidelines

## Key Principles

Three core objectives: **legibility, hierarchy, and brand expression**.

## Legibility Standards

Minimum font sizes:
- iOS/iPadOS: 17 pt default, 11 pt minimum
- macOS: 13 pt default, 10 pt minimum

Avoid thin weights — they can be difficult to see, especially when text is small. Test across different viewing conditions (bright sunlight, dim rooms, high contrast mode).

## Hierarchy Strategy

Adjust font weight, size, and color to emphasize important information. Minimize the number of distinct typefaces — mixing too many different typefaces can obscure your information hierarchy. Use size, weight, and color variations within a single family before introducing another.

## System Fonts

**San Francisco (SF)** — Primary sans-serif family:
- SF Pro (iOS, iPadOS, macOS default)
- SF Compact (watchOS, widgets)
- Rounded variants coordinate with soft UI elements

**New York (NY)** — Serif family that works independently or alongside SF fonts. Suitable for reading contexts.

Both fonts are variable fonts supporting dynamic optical sizing — letterforms automatically adjust to specific point sizes without requiring discrete size selections.

## Dynamic Type

This accessibility feature allows users to adjust text sizes system-wide. Requirements:
- Layouts must adapt properly at all size steps
- Meaningful interface icons must scale alongside text
- Minimize text truncation at larger accessibility sizes
- Multi-column layouts may need reduction at increased sizes
- Support xSmall through xxxLarge and the five AX (accessibility) categories

## Custom Fonts

When using custom typefaces:
- Replicate Dynamic Type support manually
- Ensure accessibility feature compatibility (VoiceOver labels, contrast)
- Provide all weight variants needed for your hierarchy
- Test at minimum sizes and maximum Dynamic Type sizes

## Web / CSS Equivalent Guidance

For web UIs targeting Apple users:
- Use `clamp()` for fluid type scaling
- Prefer `system-ui` or `-apple-system` to match platform conventions
- Line height: 1.4–1.6 for body text; tighter (1.1–1.2) for large display text
- Letter spacing: slightly negative for large headings (≥ 32px); normal or slightly positive for small caps/labels
- Font weight: 400 for body, 600–700 for subheadings, 700–800 for headings
