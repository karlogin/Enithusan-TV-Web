# Accessibility — Apple Human Interface Guidelines

Well-designed interfaces benefit everyone. Accessibility is not a separate concern — it is good design.

## Vision

- Support larger text: ideally up to 200% enlargement via Dynamic Type
- Maintain color contrast ratios of at least 4.5:1 for text smaller than 18pt (or 14pt bold); 3:1 for larger text
- Convey information with more than color alone — use icons, labels, or patterns alongside color coding
- Support Reduce Transparency and Increase Contrast system settings
- All images and icons used to convey meaning must have descriptive accessibility labels

## Hearing

- Provide captions, subtitles, and audio descriptions for multimedia content
- Provide transcripts for audio-only content
- Pair audio cues with haptics and visual indicators so deaf and hard-of-hearing users don't miss important events
- Never use audio as the sole means of communicating critical information

## Mobility

- Minimum touch/click target size: 44 × 44 pt on iOS/iPadOS
- Offer gesture alternatives — complex gestures (multi-finger swipes, force touch) should have simpler alternatives
- Support Switch Control and Full Keyboard Access for users with limited motor control
- Support Voice Control — interactive elements must have unique, descriptive labels
- Avoid time-limited interactions unless the time limit can be extended

## Cognitive

- Simplify navigation — minimize decision points and keep pathways consistent
- Avoid auto-dismissing alerts or toasts that users haven't had time to read
- Allow users to pause, stop, or hide automatically moving or updating content
- Respect `prefers-reduced-motion` — disable or reduce parallax, auto-play, and animated transitions when the setting is active
- Optimize for Assistive Access where applicable (streamlined interface for cognitive disabilities)

## Speech / Keyboard Navigation

- Let people use the keyboard alone to navigate and interact with your app
- All interactive elements must be focusable and operable via keyboard
- Logical focus order that follows reading order
- Visible focus indicators (never remove the focus ring without providing a better replacement)

## VoiceOver / Screen Reader

- Every interactive control needs an accessible label (not just a tooltip)
- Group related elements with accessibility containers
- Announce dynamic content changes with live regions (ARIA on web; accessibility notifications on native)
- Custom controls must communicate their role, state (selected/expanded/checked), and value

## Testing

- Use Accessibility Inspector (Xcode) to audit native apps
- Use axe, Lighthouse, or browser DevTools accessibility panel for web
- Test with VoiceOver on iOS/macOS
- Test at maximum Dynamic Type size (xxxLarge + AX5)
- Test with Increase Contrast and Reduce Transparency enabled
- Provide Accessibility Nutrition Labels on App Store listings
