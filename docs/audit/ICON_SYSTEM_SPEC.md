# ICON_SYSTEM_SPEC

## Library

- Primary library: `lucide-react`
- Reason: Already installed, already used in the shell and multiple screens, consistent stroke-based style, broad coverage for navigation and task actions.

## Style Contract

- Stroke style: line icons only
- Stroke width: `1.75`
- Corner feel: rounded defaults from Lucide
- Fill usage: none except brand-required external marks such as Google

## Size Scale

| Token | Size | Usage |
| --- | --- | --- |
| `xs` | `14px` | inline status chips, dense metadata |
| `sm` | `16px` | buttons, compact labels |
| `md` | `18px` | sidebar items, section cues |
| `lg` | `20px` | prominent page cues, empty states |
| `xl` | `24px` | major hero or primary action emphasis when needed |

## Placement Rules

- Navigation items: icon always appears before label.
- Buttons: primary and secondary actions should place the icon before the text.
- Cards: cards may use one cue icon in header or status area, not multiple decorative icons.
- Inputs: optional leading icon only when it adds semantic meaning.
- Audio/mic controls: icon is required.
- Debug/log entries: one category/status icon per row is allowed, but do not over-decorate log cards.

## Color Rules

- Default icon color: inherit from text color
- Muted icon color: use the same muted text color as nearby copy
- Active nav icon: inherit active nav text color
- Error icon: use existing error palette
- Success icon: use existing success palette
- Brand exception: Google button may keep its branded multicolor mark

## Screen-Level Mapping

| Surface | Icon |
| --- | --- |
| Home | `House` |
| Practice | `BookOpen` |
| Vocabulary | `Type` |
| Grammar | `Layers3` |
| Phrases | `MessageSquare` |
| Conversation | `Mic` |
| YKI Exam | `ClipboardCheck` |
| Professional Finnish | `BriefcaseBusiness` |
| Settings | `Settings` |
| Debug | `TerminalSquare` |
| Refresh | `RefreshCw` |
| Exit/stop | `CircleStop` |
| Forward/next | `ArrowRight` |
| Restart/resume | `RotateCcw` |

## Interaction States

- Hover: mild opacity or transform change only, never icon swap for its own sake
- Active: use the surrounding component’s active state styling
- Disabled: reduce opacity with the parent control
- Error/success: use color change, not different icon families

## Current Gaps To Fix Later

- `/home/vitus/kielitaika/frontend/app/screens/CardsScreen.tsx` still uses emoji/text markers instead of Lucide.
- There is no code-level icon token file yet; icon choices are currently local to components.
