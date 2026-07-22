# HomeTogether Admin Design System

## 0. Research Log

- Embedded references: shortlisted Linear, Sentry, and IBM Carbon for dense operational grammar; selected `minimalist-skill.md` + `linear.app.md` because the approved direction calls for Linear-like precision without copying its dark palette or brand. HomeTogether keeps the density, restrained accent, tight hierarchy, and subtle boundaries, then converts them to a light-first Korean admin surface.
- Lazyweb: ran 3 queries for desktop admin tables, support dashboard states, and mobile admin navigation; viewed 4 downloaded screens (Retool, Semgrep, Deepnote, Wix), of which 3 rendered useful UI and 1 showed a source error. Retained grammar: compact tool chrome, table-first work areas, plainly centered recovery states, grouped mobile navigation, and persistent accessible action placement. Screens are research-only and are not shipped or copied.
- Palette/type sanity check: the approved cool-neutral, single-cobalt-accent, Geist direction already resolves the project owner decisions and matches the selected operational references. No database-generated alternative overrides those locked choices.
- Imagen drafts: skipped by explicit task direction; no image generation is needed for an operational primitive system and no generated image is a fidelity target.

## 1. Atmosphere & Identity

HomeTogether Admin is a light-first operations desk: compact, composed, and unambiguous under data pressure. Its signature is a cool paper-and-ink stack with a single HomeTogether cobalt thread that marks focus, selection, and primary action. The system borrows Linear's precise density and alignment, not its dark appearance, purple brand, marketing language, or component shapes. Information hierarchy comes from type weight, spacing, and quiet tonal steps before decoration.

The primary users are administrative operators who scan long tables, compare identifiers, inspect structured details, and perform consequential actions. Temporary or situational stress cases include keyboard-only work, 200% zoom, reduced motion, long Korean copy, unbroken identifiers, slow responses, and destructive-action hesitation. The interface must keep task location, next action, validation error, and recovery path visible without relying on memory.

## 2. Color

### Palette

The shipping system is light-only. There is no dark-mode token set or color-scheme toggle.

| Role | CSS token | Value | Usage |
| --- | --- | --- | --- |
| Canvas | `--ht-surface-canvas` | `#F4F6F8` | Page background and shell gutters |
| Surface | `--ht-surface-default` | `#FFFFFF` | Primary panels, controls, table body |
| Surface subtle | `--ht-surface-subtle` | `#F8FAFC` | Table headers and grouped regions |
| Surface muted | `--ht-surface-muted` | `#EEF1F5` | Neutral emphasis and disabled wells |
| Surface pressed | `--ht-surface-pressed` | `#E5EAF0` | Active neutral controls |
| Overlay | `--ht-surface-overlay` | `rgb(17 24 39 / 48%)` | Modal isolation only |
| Text strong | `--ht-text-strong` | `#17202B` | Page titles and critical values |
| Text default | `--ht-text-default` | `#344054` | Body and control labels |
| Text subtle | `--ht-text-subtle` | `#667085` | Supporting text and metadata |
| Text disabled | `--ht-text-disabled` | `#98A2B3` | Disabled labels only |
| Text inverse | `--ht-text-inverse` | `#FFFFFF` | Primary/destructive controls |
| Border subtle | `--ht-border-subtle` | `#E7EBF0` | Row dividers and quiet groups |
| Border default | `--ht-border-default` | `#8893A3` | Essential control and container boundaries; 3.11:1 on white |
| Border strong | `--ht-border-strong` | `#667085` | Hover and high-priority separation; 4.98:1 on white |
| HomeTogether accent | `--ht-accent-default` | `#3659D9` | Primary actions, links, selection, focus |
| Accent hover | `--ht-accent-hover` | `#2D4DBD` | Hovered accent controls |
| Accent pressed | `--ht-accent-pressed` | `#253F9B` | Active accent controls |
| Accent soft | `--ht-accent-soft` | `#EEF2FF` | Selected or informational background |
| Accent soft text | `--ht-accent-soft-text` | `#3146A6` | Text on accent-soft |
| Success | `--ht-success-default` | `#16794D` | Completed or healthy state |
| Success soft | `--ht-success-soft` | `#EAF7F0` | Success badge/alert background |
| Warning | `--ht-warning-default` | `#9A5B13` | Attention state |
| Warning soft | `--ht-warning-soft` | `#FFF6E8` | Warning badge/alert background |
| Error | `--ht-error-default` | `#C0343D` | Validation and destructive action |
| Error hover | `--ht-error-hover` | `#A42B34` | Hovered destructive control |
| Error soft | `--ht-error-soft` | `#FFF0F1` | Error badge/alert background |
| Info | `--ht-info-default` | `#126A8C` | Non-action informational state |
| Info soft | `--ht-info-soft` | `#EAF6FA` | Information badge/alert background |

### Rules

- Cobalt is the only product accent. Use it for interaction and selected state, never decorative fill.
- Success, warning, error, and info are semantic colors, not alternate brand accents. Every semantic state also has text/icon wording and never relies on color alone.
- Kakao yellow is reserved for the future Kakao provider login button in Todo 6. It is not a general token, primitive variant, navigation color, status color, or showcase decoration.
- Primary surfaces remain white or cool neutral. Large chromatic panels, gradients, glass, and ambient glows are prohibited.
- Do not introduce raw color values in components. Add a genuine semantic role here first.

## 3. Typography

### Font stacks

- UI: `var(--font-geist-sans), "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", system-ui, sans-serif`.
- Mono: `var(--font-geist-mono), "SFMono-Regular", Consolas, "Liberation Mono", monospace` for identifiers and technical values only.
- Geist remains the Latin face. Korean system fallbacks are ordered for native metrics and reliable glyph coverage; no remote Korean font dependency is added.

### Scale

| Token | Size | Weight | Line height | Tracking | Usage |
| --- | ---: | ---: | ---: | ---: | --- |
| `--text-page-title` | 24px | 600 | 1.25 | -0.02em | Page title |
| `--text-section` | 18px | 600 | 1.35 | -0.015em | Section and dialog title |
| `--text-subsection` | 16px | 600 | 1.4 | -0.01em | Group heading |
| `--text-body` | 14px | 400 | 1.5 | 0 | Body, control, table content |
| `--text-body-strong` | 14px | 600 | 1.5 | 0 | Emphasis and row anchors |
| `--text-compact` | 13px | 400 | 1.4 | 0 | Metadata and compact navigation |
| `--text-label` | 12px | 600 | 1.35 | 0.01em | Field label, badge, table heading |

### Rules

- Korean copy uses `word-break: keep-all` and pretty wrapping for natural phrase boundaries without orphaned final words. Page titles do not exceed two lines; controls do not split a short verb phrase.
- Body and actionable text remain at least 14px. The 12–13px levels are limited to labels and secondary metadata.
- Identifiers use the mono stack, `font-variant-numeric: tabular-nums`, and `overflow-wrap: anywhere` when they cannot truncate safely.
- Page headings are compact; giant display type, decorative hero copy, and editorial serif faces do not belong in this operational system.

## 4. Spacing & Layout

### Base and spacing

The base unit is 4px. Intent tokens map to that grid.

| Token | Value | Usage |
| --- | ---: | --- |
| `--ht-space-1` | 4px | Tight icon/label relation |
| `--ht-space-2` | 8px | Inline clusters and compact rows |
| `--ht-space-3` | 12px | Control padding and dense groups |
| `--ht-space-4` | 16px | Standard panel padding |
| `--ht-space-5` | 20px | Mobile page gutter |
| `--ht-space-6` | 24px | Desktop page gutter and section gap |
| `--ht-space-8` | 32px | Major group separation |
| `--ht-space-10` | 40px | Empty-state breathing room |
| `--ht-space-12` | 48px | Maximum operational section break |

### Control and frame sizing

| Token | Value | Usage |
| --- | ---: | --- |
| `--ht-control-sm` | 32px | Compact desktop toolbar control |
| `--ht-control-default` | 36px | Default desktop control |
| `--ht-control-lg` | 40px | Prominent desktop action |
| `--ht-touch-target` | 44px | Mobile/coarse-pointer minimum where appropriate |
| `--ht-sidebar-width` | 240px | Future compact desktop sidebar-ready frame |
| `--ht-content-max` | 1,440px | Operational content limit |
| `--ht-table-min` | 720px | Default intended horizontal table scroller floor |

### Breakpoints

| State | Width | Behavior |
| --- | --- | --- |
| Narrow | `<640px` | One content column, 20px gutter, 44px touch targets, drawer-ready mobile navigation region |
| Medium | `640–1,023px` | 24px gutter, denser two-column detail groups where content allows |
| Wide | `≥1,024px` | Desktop sidebar-ready navigation region and compact controls |
| Max | `≥1,280px` | Content remains limited to 1,440px; tables may expose more columns |

### Layout and scroll ownership

- Pages use the document as the vertical scroll owner until Todo 6 introduces an explicitly bounded application shell.
- The table wrapper is the only default horizontal scroll owner. It gets an accessible region label and keyboard focus; the page itself must not scroll horizontally.
- Tables keep a readable minimum inline size and reveal horizontal overflow inside their wrapper. At narrow widths, primary content outside tables reflows to one column.
- Navigation primitives are assembly-ready: a compact desktop aside region, a mobile header/drawer trigger region, and a shared navigation list. Todo 6 owns session-aware shell composition and open/close drawer behavior.
- Intrinsic mechanics such as `auto`, `%`, `minmax()`, `clamp()`, and container units remain raw CSS mechanics rather than false design tokens.

## 5. Components

### Button

- **Structure**: semantic `button` with optional leading Phosphor icon, label, and loading indicator.
- **Variants**: primary, secondary, ghost, destructive; sizes small and default only.
- **States**: default, hover, active, visible focus, disabled, loading.
- **Accessibility**: native keyboard activation; loading sets `aria-busy` and blocks duplicate activation; disabled remains visibly distinct.
- **Motion**: color, opacity, and 1px `transform` press response within micro timing; no decorative motion.

### IconButton

- **Structure**: semantic `button` with a Phosphor icon and required accessible label.
- **Variants**: neutral and destructive.
- **States**: same control states as Button.
- **Accessibility**: required `aria-label`; 36px desktop and 44px narrow/coarse target.

### Input, Textarea, Select

- **Structure**: visible label, control, optional hint, and located error message.
- **States**: default, hover, visible focus, disabled, required, error.
- **Accessibility**: explicit required `id` and label; hint/error wired with `aria-describedby`; error sets `aria-invalid`; Select uses native keyboard behavior.
- **Layout**: full-width field stack with no placeholder-only labeling.

### Badge

- **Variants**: neutral, accent, success, warning, error, info.
- **States**: static semantic label only; it never looks clickable.
- **Accessibility**: text always names the state; color is supplemental.

### TableShell

- **Structure**: labelled focusable scroll region containing a semantic table, caption, headings, and consumer rows.
- **States**: populated, empty, loading supplied by page composition, long text, unbroken ID.
- **Accessibility**: caption and column headings are required; intended horizontal scroll region is keyboard reachable.
- **Layout**: table wrapper owns horizontal overflow; cells align top and preserve row scanning.

### Pagination

- **Structure**: labelled navigation with first/previous/current/next/last positions when available.
- **States**: available link, current page, disabled boundary.
- **Accessibility**: current status uses `aria-current`; unavailable controls use `aria-disabled`; no client state is required.

### DefinitionList

- **Structure**: semantic `dl` with label/value pairs.
- **States**: present, missing value supplied as explicit text, long value, long unbroken ID.
- **Layout**: one column on narrow widths; paired label/value grid when space allows.

### Alert

- **Variants**: success, warning, error, info.
- **Structure**: Phosphor status icon, optional concise title, actionable copy.
- **Accessibility**: error uses alert semantics; passive status messaging uses status semantics.

### EmptyState and LoadingState

- **Empty**: quiet outlined region, Phosphor archive icon, concise reason, optional recovery action.
- **Loading**: status region with visible label and Phosphor spinner; no fake skeleton data.
- **Accessibility**: live-region wording is short; loading motion stops under reduced motion.

### ConfirmDialog

- **Structure**: native modal `dialog`, explicit title/description, cancel and confirm actions, internal trigger.
- **States**: closed, open, confirm, cancel, destructive, disabled confirm.
- **Accessibility**: native focus containment; Escape closes; cancel is initial focus; closing returns focus to the exact trigger; backdrop blocks accidental outside work.
- **Motion**: opacity/transform only, standard timing; removed under reduced motion.

### ActionFeedback

- **Contract**: consumes the Todo 4 `AdminActionResult` discriminated union directly.
- **States**: idle renders nothing; success and error render explicit feedback through Alert.
- **Accessibility**: success is status; error is alert; never exposes raw API bodies.

### PageHeader

- **Structure**: title, supporting description, optional action cluster, optional breadcrumb/back slot.
- **Layout**: stack on narrow widths; aligned action cluster on wider widths.
- **Accessibility**: one clear page-level heading; actions remain adjacent in reading order.

### Responsive navigation building blocks

- **Structure**: shared NavigationList plus DesktopNavigationRegion and MobileNavigationHeader slots.
- **States**: default, hover, active/current, focus, disabled/unauthorized items omitted by the caller.
- **Accessibility**: semantic `nav` label, current link with `aria-current`, 44px mobile targets.
- **Scope boundary**: these are presentation and layout primitives only. Todo 6 owns role-derived items, session identity, mobile drawer interaction, logout, and the final shell route.

## 6. Motion & Interaction

| Token | Duration | Easing | Usage |
| --- | ---: | --- | --- |
| `--ht-motion-micro` | 120ms | `cubic-bezier(0.2, 0, 0, 1)` | Hover, press, focus color/opacity |
| `--ht-motion-standard` | 180ms | `cubic-bezier(0.2, 0, 0, 1)` | Dialog opacity/transform |

- Motion communicates state change only. There are no page entrances, scroll reveals, ambient movement, or decorative hover animation.
- Animate only `transform`, `opacity`, and color paint. Never animate layout dimensions or position.
- `prefers-reduced-motion: reduce` removes transitions and loading rotation while preserving clear state changes.
- Hover is supplemental. Every action works by keyboard and touch, and visible focus is never replaced by hover styling.
- Focus uses a 2px accent outline plus a 2px surface-colored offset so it remains visible against white, neutral, semantic, and accent backgrounds.

## 7. Depth & Surface

### Strategy

Use mixed tonal shift plus quiet borders. Shadows are reserved for overlays.

| Token | Value | Usage |
| --- | --- | --- |
| `--ht-border-width` | `1px` | Controls, tables, panel separation |
| `--ht-radius-sm` | `4px` | Inline technical elements |
| `--ht-radius-control` | `6px` | Buttons and fields |
| `--ht-radius-panel` | `8px` | Panels and table shell |
| `--ht-radius-dialog` | `10px` | Modal dialog only |
| `--ht-shadow-subtle` | `0 1px 2px rgb(17 24 39 / 6%)` | Optional raised control edge |
| `--ht-shadow-dialog` | `0 16px 40px rgb(17 24 39 / 18%)` | Dialog only |

- Panels use surface contrast and 1px borders before shadow.
- Pills are reserved for compact badges/statuses. Buttons, cards, tables, and page panels are not pills.
- Excessive card nesting is prohibited. Use headings, dividers, and definition groups before inventing another container.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- Target WCAG 2.2 AA: 4.5:1 body text, 3:1 large text and essential UI boundaries.
- All controls and links have visible keyboard focus, accessible names, predictable focus order, and native semantics where available.
- Mobile/coarse-pointer controls reach 44px where appropriate; compact desktop density never shrinks the mobile target.
- Form errors are next to their field and state what to fix in plain Korean. Disabled controls remain legible and do not masquerade as available actions.
- Dialog cancellation is easy, Escape works, destructive confirmation is explicit, and focus returns to the initiating control.
- Reduced motion is honored without hiding content or losing state feedback.
- Long Korean content, 2,000-character copy, and unbroken identifiers wrap or scroll inside their named owner; the page itself does not overflow horizontally.
- Tables expose an intentionally labelled horizontal scroller rather than compressing columns until unreadable.
- At 200% zoom, primary work reflows without two-dimensional page scrolling. Table-only horizontal scrolling remains acceptable and labelled.
- No status relies on color, icon, or position alone. Icons are Phosphor only and decorative icons are hidden from assistive technology.

### Accepted Debt

| Item | Location | Why accepted | Owner / Exit |
| --- | --- | --- | --- |
| In-app Browser binding unavailable in the current worker context | Todo 5 QA execution environment | Not a product design debt and not accepted as a visual PASS; implementation continues with static gates and a permitted real-Chromium fallback only as provisional evidence | Todo 5 must receive separate actual in-app Browser QA before completion |

### Explicit anti-patterns

- No dark mode, gradient, glassmorphism, glow, decorative texture, illustration, hero, or giant KPI/Overview card.
- No notification center, fake metrics/data, domain fields, login surface, final app shell, or role/session behavior in Todo 5.
- No mixed icon set, emoji, manually drawn SVG, UI framework, global state manager, motion library, speculative variant, or barrel index.
- No hidden focus ring, placeholder-only label, desktop-only table, unconfirmed destructive action, optimistic destructive update, or silent error.
- No repeated magic color, radius, shadow, typography, control-height, or motion values outside this contract and `app/globals.css` tokens.
