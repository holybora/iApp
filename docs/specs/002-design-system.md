# 002 — Design System

## Purpose
Token vocabulary and component rules every UX spec references. Built ON
the Obytes UI kit (`src/components/ui`) — extended, never replaced.

## Tokens
Palette source of truth: `src/components/ui/colors.js` (referenced by
NativeWind/Uniwind classes).
- **primary** (orange scale 50–900): brand, CTAs, active tab, streaks.
- **charcoal**: dark-mode surfaces (850/900/950 backgrounds).
- **neutral**: light-mode surfaces, borders, secondary text.
- **success**: green scale — completed checkmarks/rings (added in M2 if
  not present).
- **danger**: red scale — destructive actions, errors.
- Goal accent colors: users pick from 8 named tokens (defined in spec 011).

Typography: Inter (already loaded). Scale: text-xs/sm/base/lg/xl/2xl only.
Spacing: Tailwind default scale; screen edge padding `px-4`.
Radius: `rounded-xl` cards, `rounded-full` pills/checkmarks.

## Dark mode
Every screen supports light and dark (Uniwind `dark:` classes). Theme
switch lives in Settings (exists in template).

## Component rules
- Reuse `src/components/ui` primitives (Button, Input, Text, Modal,
  Select, Checkbox, ProgressBar) before creating new ones.
- New shared primitives land in `src/components/ui`; feature-local
  composites in `src/features/<feature>/components/`.
- Icons: 24×24 react-native-svg components in `src/components/ui/icons/`,
  single `color` prop, exported from the icons index.

## Required states
Every screen spec must define: empty (first-use, with a CTA), loading,
and error. No screen ships without all three designed.

## Accessibility
- Touch targets ≥ 44×44pt.
- WCAG AA contrast in both themes.
- `accessibilityLabel`/`accessibilityRole` on every interactive element.
- Tab bar: label + icon, `tabBarButtonTestID` per tab.

## Navigation map (M1 shell)
Tabs: Today (`/`), Goals (`/goals`), Stats (`/stats`),
Settings (`/settings`). Modals (M2+): goal create/edit, schedule picker.
