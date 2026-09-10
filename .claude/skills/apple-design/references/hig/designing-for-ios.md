# Designing for iOS — Apple Human Interface Guidelines

## Core Device Characteristics

iPhone users interact with a medium-size, high-resolution display while holding the device in one or both hands, typically at a viewing distance of one to two feet. They frequently switch between landscape and portrait orientations.

## Primary Input Methods

- Multi-Touch gestures (tap, swipe, pinch, long-press)
- Virtual keyboards
- Voice control (Siri, Voice Control accessibility feature)
- Hardware sensors: gyroscope, accelerometer, Face ID / Touch ID

## Usage Patterns

iOS app sessions range from brief check-ins lasting just a minute or two to extended sessions of an hour or more. Users typically maintain multiple apps running simultaneously and switch between them regularly.

## Design Priorities

**Minimize visible controls** — keep secondary options accessible through minimal interaction (swipe, long-press, context menu) rather than cluttering the primary UI.

**Respond fluidly to appearance changes** — device orientation, Dark Mode, Dynamic Type, and increased contrast must all be handled gracefully.

**Comfortable reach zones** — position frequently used controls in the middle and bottom areas of the screen. Avoid placing critical actions in the top corners, especially on large phones.

**Leverage platform capabilities** — biometric authentication, location services (with explicit permission), camera, and haptics reduce friction and feel native.

**Content, not chrome** — UI controls should feel subordinate to content. Prefer system controls, which users already know, over custom reimplementations.

## Interaction Patterns

- Minimum touch target: 44 × 44 pt
- Use swipe-to-go-back; don't block it with custom gesture recognizers
- Bottom sheets and action sheets for contextual actions
- Navigation bar for hierarchical navigation; tab bar for peer-level sections
- Pull-to-refresh for list updates
- Haptic feedback to confirm actions (UIImpactFeedbackGenerator)

## Web / PWA Considerations

When building web apps targeting iOS Safari:
- Respect `env(safe-area-inset-*)` for notch and home indicator
- Use `touch-action: manipulation` to eliminate 300ms tap delay
- Avoid `position: fixed` overlays that conflict with Safari's elastic scrolling
- Test at both standard and zoomed display sizes
- Dark Mode via `prefers-color-scheme: dark`
