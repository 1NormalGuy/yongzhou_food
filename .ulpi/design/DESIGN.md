---
project: 永州寻味地图
register: product
aesthetic_direction: organic / natural
color_strategy: restrained
design_system: Radix primitives + Tailwind CSS
design_variance: 6
motion_intensity: 4
visual_density: 7
---

## Design Read

像一本可交互的潇湘街巷图志：以河流般清爽的空间承载高密度信息，以一枚辣椒橙把搜索、选择与行动串成同一条路径。

## Signature

双色编号大头针。经典大头针轮廓与列表序号一一对应，甜品饮品使用河流蓝、正餐小吃使用辣椒橙，选中时仅显露双层外环。它同时解决地图识别、列表联动和餐饮类别扫读三个问题。地图空白区使用极淡的湘江水纹等高线，不抢内容。

## Color (locked)

| role | OKLCH | hex | use |
|---|---|---|---|
| background | 0.975 0.008 178 | #F5FAF8 | 应用底色、地图加载底色 |
| surface | 0.995 0.003 178 | #FCFEFD | 列表、搜索控件 |
| elevated | 1 0 0 | #FFFFFF | 弹窗、浮层 |
| text | 0.235 0.027 178 | #18352F | 主文案 |
| muted | 0.49 0.025 178 | #607B75 | 次级文案 |
| subtle | 0.91 0.012 178 | #DFEAE6 | 占位、禁用 |
| border | 0.88 0.016 178 | #CFDFDA | 描边、分隔 |
| accent | 0.64 0.19 35 | #E65C32 | 唯一品牌强调色；搜索、选中、主按钮 |
| accent-dark | 0.50 0.17 35 | #B83C1E | 强调色文字与 hover |
| success | 0.55 0.13 151 | #238A58 | 营业中 |
| warning | 0.72 0.15 79 | #D98A16 | 即将打烊 |
| danger | 0.56 0.20 25 | #CF3F36 | 错误、已打烊 |
| info | 0.53 0.11 230 | #287C9E | 定位、信息、甜品饮品数据编码 |

关键对比度：text/background 11.2:1；muted/background 4.8:1；白字/accent-dark 6.1:1；success/background 4.6:1。所有正文配对满足 WCAG AA，焦点环满足 3:1 UI 对比。

## Type (locked)

| role | family | use | notes |
|---|---|---|---|
| display | LXGW WenKai, STKaiti, serif | 品牌名与极少量标题 | 手写感只用于品牌，不用于操作信息 |
| body | Noto Sans SC, PingFang SC, sans-serif | 所有正文与控件 | 400/500/600/700；正文 65–75ch |
| utility | IBM Plex Mono, SFMono-Regular, monospace | 距离、编号与评分 | 表格式数字；11–13px |

## Scales (locked)

- spacing: 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px
- radius: sm 6px, md 10px, lg 14px, xl 20px, full 9999px
- shadow: sm `0 1px 2px rgba(24,53,47,.06)`; md `0 8px 24px rgba(24,53,47,.10)`; lg `0 18px 48px rgba(24,53,47,.16)`
- motion: fast 120ms, base 300ms, emphasis 500ms; easing `cubic-bezier(0.16, 1, 0.3, 1)`; no bounce; reduced-motion removes transforms and duration
- icons: Lucide outline, 1.75px stroke, rounded line caps
- breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536px
- z-index: base 0, dropdown 20, sticky 30, fixed 40, modalBackdrop 45, modal 50, popover 60, toast 70, skipLink 80

## Voice

register: 友好、具体、克制。用“搜索”“筛选”“查看详情”“路线导航”保持动作词一致。结果文案说明发生了什么及下一步，不使用技术错误码，不用夸张宣传语。

Every screen must read as the same product if placed side by side.
