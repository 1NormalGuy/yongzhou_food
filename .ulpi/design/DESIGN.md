---
project: 永州寻味地图
register: product
aesthetic_direction: organic / natural
color_strategy: restrained
design_system: Radix primitives + Tailwind CSS + Leaflet controls
design_variance: 6
motion_intensity: 2
visual_density: 7
---

## Design Read

像一本可交互的潇湘街巷图志：以河流般清爽的空间承载高密度信息，以一枚辣椒橙把搜索、选择与行动串成同一条路径。

## Signature

**四色精确落点缩放大头针**。经典轮廓不承载数字，烧烤使用辣椒橙、粉面使用稻穗金、小吃使用河流蓝、其他使用青菜绿；远景收小以显露街区，近景随缩放展开，针尖、图标锚点与缩放原点始终在同一像素。它同时解决地图识别、拥挤与餐饮类别扫读，选中只使用稳定双层外环。

移动端底部视图切换栏是功能性的“观察窗”，不是第二个视觉签名。用户明确要求透明玻璃质感，因此仅该控件可使用半透明 `surface`、背景模糊与 `md` 阴影；列表、地图控件、弹窗和卡片继续使用不透明锁定表面。禁止把玻璃效果扩散到其他容器。

## Register and system

This is a task-first product interface. Use the existing Radix Dialog/Popover primitives and Leaflet controls, themed with the locked tokens below. Do not hand-recreate Radix behavior or introduce a second component system.

## Color (locked)

The palette comes from Yongzhou street food: deep river-green structure, pale green-gray surfaces, and one chili-clay accent. The four marker category colors are data encoding, not additional UI accents.

| role | OKLCH | hex | use |
|---|---|---|---|
| background | `oklch(98.1% 0.006 170.5)` | `#F5FAF8` | application background |
| surface | `oklch(99.5% 0.002 165.1)` | `#FCFEFD` | list and control surfaces |
| elevated | `oklch(100% 0 0)` | `#FFFFFF` | popups and dialogs |
| text | `oklch(30.4% 0.037 178.6)` | `#18352F` | primary copy |
| muted | `oklch(56.0% 0.033 180)` | `#607B75` | secondary copy |
| border | `oklch(89.0% 0.018 175.3)` | `#CFDFDA` | dividers and control borders |
| subtle | `oklch(93.2% 0.012 172.7)` | `#DFEAE6` | placeholders and disabled surfaces |
| accent | `oklch(64.7% 0.181 37.1)` | `#E65C32` | the sole brand accent, search and selection |
| accent-dark | `oklch(53.2% 0.165 34.6)` | `#B83C1E` | accessible accent text and primary button |
| success | `oklch(48.4% 0.105 157.9)` | `#167047` | open/success text |
| warning | `oklch(56.2% 0.126 65.5)` | `#A66300` | closing/caution text |
| danger | `oklch(50.1% 0.178 28.7)` | `#B3261E` | error text |
| info | `oklch(55.2% 0.094 229.4)` | `#287C9E` | location and neutral system info |

Recorded WCAG contrast ratios: text/background 12.53:1; text/surface 13.05:1; muted/surface 4.52:1; accent/elevated 5.67:1; elevated/accent 5.67:1; warning/elevated 4.77:1; danger/elevated 6.54:1; info/elevated 4.70:1. Success text uses `#167047` rather than the previous lighter green so normal text remains AA.

Marker encoding remains locked to barbecue `#E65C32`, noodles `#D98A16`, snack `#287C9E`, other `#238A58`; marker shapes, legend labels, and ARIA labels duplicate the color meaning. The darker success and warning values above are for small semantic text, not marker fills.

## Type (locked)

| role | family | use | notes |
|---|---|---|---|
| display | `"LXGW WenKai", STKaiti, serif` | brand mark only | local handwritten character; never used for dense UI |
| body | `"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif` | controls, lists, detail copy | quiet Chinese UI face |
| utility | `"IBM Plex Mono", SFMono-Regular, monospace` | counts, distance, compact context | data contrast axis |

Body copy stays compact and left aligned. Headings use at most `-0.02em` tracking. No decorative numbered eyebrows; fixed source numbers are permitted only where they identify restaurants.

## Scales (locked)

- Spacing: `0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128`.
- Radius: `sm 6, md 10, lg 14, xl 20, full 9999`.
- Elevation: `sm 0 1px 2px rgba(24,53,47,.06)`, `md 0 8px 24px rgba(24,53,47,.10)`, `lg 0 18px 48px rgba(24,53,47,.16)`.
- Glass exception: mobile view switcher only, `rgba(252,254,253,.78)` over `surface`, `backdrop-filter: blur(18px) saturate(1.2)`, `1px` border using `border` at 82%, and the locked `md` elevation. Its active segment uses opaque `elevated`; no gradients or colored glow.
- Z layers: base 0, map overlay 20, sheet 30, fixed header 40, modal backdrop 45, modal 50, popover 60, toast 70, skip link 80.
- Breakpoints: mobile `<768`, tablet `768–1023`, desktop `≥1024`.
- Motion: fast `120ms`, base `220ms`, emphasis `300ms`; easing `cubic-bezier(0.16, 1, 0.3, 1)`. No bounce, elastic, or infinite decorative motion. `prefers-reduced-motion` disables nonessential transitions.
- Mobile targets: interactive controls at least 44 CSS px; sheets respect bottom safe-area inset.
- Icons: Lucide outline, 1.75px stroke, rounded line caps.

## Voice

Register: 友好、具体、克制。Use the action vocabulary `搜索`, `查看详情`, `高德看店`, `使用我的位置`, `筛选`. Never call a search-results jump “导航”. Feedback states name what changed and, on error, the next action.

## Cross-session consistency

Every screen must read as the same product if placed side by side.

Read this file before any later feature work. Any new visual value outside these tokens is a defect and must be deliberately added here before use.
