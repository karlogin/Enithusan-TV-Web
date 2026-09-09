# Layout — Apple Human Interface Guidelines

## Core Principles

**Organization & Hierarchy**: Group related items to help people find the information they want, using techniques like negative space, colors, and separator lines. Important information requires sufficient space to avoid being obscured by secondary details.

**Content Extension**: Backgrounds and full-screen artwork must extend to display edges. Scrollable layouts continue to screen boundaries. Controls like sidebars appear as overlay elements rather than part of the content plane.

**Visual Differentiation**: The Liquid Glass material provides distinct appearance for controls. Scroll edge effects create transitions between content and control areas. Proper alignment and indentation communicate organizational hierarchy.

## Adaptability Requirements

Apps must handle multiple device variations:
- Screen sizes and orientations
- Dynamic Island features
- Dynamic Type text adjustments
- Internationalization / localization

Test layouts at common window sizes and preview on multiple devices, using different orientations, localizations, and text sizes.

## Platform-Specific Guidance

**iPhone**
- Support both portrait and landscape when feasible
- Avoid full-width buttons; respect system margins
- Hide the status bar only when it genuinely enhances the experience
- Place frequently used controls in the middle and bottom reachable zones

**iPad**
- Design full-screen layouts first, then defer compact views
- Test at common system-provided sizes (halves, thirds, quadrants)
- Consider convertible tab bars for adaptive navigation

**Mac**
- Avoid placing controls at window bottoms — users frequently reposition windows below the screen edge
- Maximize large displays to present more content in fewer nested levels
- Support flexible window management (resize, hide, show, move)

## Safe Areas and Margins

Respect safe area insets on all platforms. Never place interactive controls where system chrome (notch, Dynamic Island, home indicator, menu bar) obscures them. Use standard system margins rather than hard-coded pixel values so layouts adapt automatically.

## Grid and Spacing

Use consistent spacing increments (multiples of 4 or 8 pt). Align elements to a grid to create visual rhythm. Leave adequate breathing room between groups of controls — negative space is a design element, not wasted space.
