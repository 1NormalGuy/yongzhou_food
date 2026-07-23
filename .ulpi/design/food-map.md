# 永州寻味地图：搜索与地图联动规范

绑定 `.ulpi/design/DESIGN.md`。Every screen must read as the same product if placed side by side.

## 页面结构

- 桌面 ≥1024px：72px 单层顶栏；左侧 432px 结果栏；右侧地图填满剩余视口。结果栏不做卡片套卡片，使用带分隔线的媒体列表。
- 平板 768–1023px：72px 单层顶栏；结果栏 360px；地图保留主视野。
- 手机 <768px：地图全屏；顶部搜索悬浮；结果为三段式底部面板（peek 132px / half 52vh / full calc(100dvh - 92px)），有明确拖拽把手与安全区内边距。
- 三种布局族：工具栏条带、分隔媒体列表、地图浮层信息卡。禁止嵌套卡片。

## 核心流程

### 搜索与筛选

用户输入店名、菜系或菜品并提交。系统进入 500–800ms 模拟加载，地图标记淡出，列表显示 4 行骨架。成功后同时更新结果数量、列表、地图边界与 aria-live。关键词“错误”触发可恢复错误态；无匹配显示空状态和“清除条件”。

筛选项：距离（不限/1/3/5km）、评分（不限/4.0/4.5）、价格（¥/¥¥/¥¥¥）、营业状态。桌面用横向筛选按钮打开 Radix Popover；移动端用 Radix Dialog bottom sheet。启用条件在按钮上显示橙色计数并可一键重置。

### 列表与地图联动

点击列表项：设置 selectedId；地图 flyTo 到 zoom 16；对应标记切换白色/深色双外环；弹出信息卡；列表项左边显示 3px 橙色选择条。点击标记执行相同行为，并将对应列表项滚动到可见。Escape 关闭弹窗但保留选择。

### 我的位置

点击“使用我的位置”后按钮显示旋转进度；调用 Geolocation。成功显示蓝色当前位置脉冲点，按当前位置重算 Haversine 距离、重新排序并调整地图视野。拒绝/失败显示 toast，提供“使用永州市中心”恢复选项。开发环境在权限不可用时可使用永州中心模拟位置。

### 详情与导航

“查看详情”打开 Radix Dialog，包含大图、招牌菜、营业时间、地址。“路线导航”先打开轻量的地图选择器，不再进入 OpenStreetMap 网页：

- iOS：高德地图使用 `iosamap://navi`；系统地图使用 Apple Maps URL，起点留空表示当前位置。
- Android：高德地图使用 `androidamap://navi`；系统地图使用 `geo:` URI，由系统交给已安装的地图应用。
- 桌面端：显示“高德地图网页版”和“Apple 地图”作为合理降级。
- 高德参数使用 `sourceApplication=yongzhou_food`、终点名称与坐标；当前模拟坐标视为 WGS84，设置 `dev=1` 由高德处理偏移。
- 列表、地图弹窗和详情弹窗的“路线导航”必须走同一个组件与 URL 生成器。

## 状态模型

| 状态 | 列表 | 地图 | 恢复 |
|---|---|---|---|
| 初始 | 推荐附近餐厅 | 全部标记，适配边界 | 可直接搜索 |
| 加载 | 4 个骨架，aria-busy | 标记降至 35% | 等待完成 |
| 成功 | 匹配结果与数量 | 对应标记 | 继续筛选/选择 |
| 空 | 插画式餐碗轮廓、当前条件摘要 | 无结果但保留当前位置 | 清除条件 |
| 错误 | 具体提示“暂时没能完成搜索” | 保留上次成功标记 | 重试 |
| 离线 | 顶部 toast | 国内底图瓦片可能保留缓存 | 恢复网络后重试 |

刷新时从 URL 读取 `q`, `distance`, `rating`, `price`, `open`；后退/前进恢复搜索条件。筛选切换后使用 replaceState，显式搜索使用 pushState。模拟数据不要求登录或会话。

## 组件规范

### SearchHeader

- 改为紧凑的单层“搜索台”：40px 简化餐碗品牌标、最大 680px 搜索框、紧邻的当前位置按钮、单一筛选按钮；所有筛选摘要移出顶栏，放进结果标题下方的横向条件行。
- 搜索框本身是视觉焦点：52px 高，边框清晰；搜索图标位于左侧，提交按钮是右侧完整的橙色文字按钮。禁止原有两行网格、迷你品牌副标题和散落在第二行的四个筛选胶囊。
- 搜索表单四列固定为 `搜索图标 / 输入区 / 清空按钮预留位 / 搜索按钮`。搜索按钮显式占据第 4 列并始终贴紧最右侧；清空按钮只能占第 3 列。禁止让条件渲染触发 CSS Grid 自动改列。
- 输入 `type=search`，label 对屏幕阅读器可见；Enter 提交；Escape 清空建议/取消焦点。
- 手机触控目标 ≥48px；搜索按钮是唯一主操作，其余为描边/文本层级。
- loading 时提交按钮显示 spinner 且保留文字语义；错误用 aria-live toast。

### FilterBar / FilterSheet

- Radix Popover（桌面）和 Dialog（移动）实现焦点管理、Escape 与 focus trap。
- 单选项用原生 radio 语义；营业状态用 checkbox；“应用筛选”在移动端关闭面板。
- 价格筛选可多选；无选择代表不限。焦点环 2px accent + 2px surface offset。

### RestaurantListItem

- `button` 或可聚焦 `article`，整项可点击；内部链接阻止事件冒泡。
- 图片 112×92（移动 96×82），`loading=lazy`，语义 alt；失败时显示菜系首字占位。
- 信息顺序：编号+名称；评分/评论；菜系/价格；营业/距离；地址；操作。
- hover 只改变背景与序号边框；selected 使用选择条和浅橙背景，不靠颜色 alone（编号显示勾选）。

### FoodMap / FoodMarker

- Leaflet 保持不变，默认底图改为中国境内可访问的高德标准瓦片；标记为可键盘聚焦按钮，aria-label 包含名称、评分、距离。
- 地图服务必须集中在独立配置模块，支持 `VITE_MAP_TILE_URL`、`VITE_MAP_ATTRIBUTION`、`VITE_MAP_SUBDOMAINS` 与 `VITE_MAP_COORDINATE_SYSTEM` 覆盖。默认值用于无需 Key 的演示部署；正式商用应换成已获授权的高德 JS API、天地图或其他合规服务。
- 高德底图使用 GCJ-02。餐厅模拟数据、浏览器 Geolocation 和导航目标继续保存为 WGS84；渲染地图中心、边界、餐厅标记及当前位置前统一转换为 GCJ-02，距离计算与导航参数不得使用转换后的显示坐标。自定义 WGS84 瓦片时可通过环境变量关闭转换。
- 地图 attribution 必须显示“高德地图”并链接到供应商，不得继续显示 OpenStreetMap。
- 只设置 `scrollWheelZoom=false`；鼠标滚轮和触控板上下滚动不缩放地图。保留 `touchZoom=true`、`doubleClickZoom=true`、`boxZoom=true`、明确的 `+ / −` 控件与程序化列表定位。
- 标记保留 38×48 的可点击 wrapper，但内部视觉大头针缩为 28×36，中心不得出现编号或其他文字。选中只增加白色/深色双描边，不额外放大、不上移。
- 分类严格改为图片中的四类：`barbecue`（烧烤）使用 accent `#E65C32`；`noodles`（粉面）使用 warning `#D98A16`；`snack`（小吃）使用 info `#287C9E`；`other`（其他）使用 success `#238A58`。这些颜色仅作地图数据编码，不改变按钮与营业状态的语义。地图图例同步显示“烧烤 / 粉面 / 小吃 / 其他”，标记 aria-label 必须读出文字类别，不能只靠颜色表达。
- 大头针必须随地图 zoom 改变视觉尺寸：zoom ≤11 为基础视觉尺寸的 0.62，12/13/14/15 依次约为 0.70/0.78/0.86/0.94，zoom ≥16 为 1.0。通过监听 Leaflet `zoom`/`zoomend`，直接在地图容器写 CSS 变量 `--pin-scale`，不得因缩放 setState 或重建全部标记；缩放中心为针尖 `transform-origin: 50% 100%`。marker wrapper 的定位、宽高、margin 与 Leaflet transform 不得添加 transition，避免重现缩放抖动。
- 使用 Leaflet 原生 zoom control，自定义为 44px 点击区并提供中文 aria-label；程序化 `flyTo` 可移动地图，但标记内部不得再叠加动画。
- 瓦片失败时显示不遮挡列表的地图错误横幅，仍可用列表。

### RestaurantPopup / DetailDialog

- Popup 宽 320px；信息密度高，图片与文本左右布局；两个按钮不等权，详情主按钮、导航次按钮。
- Dialog 初始焦点在标题，关闭后回到触发源；图片缺失降级；营业时间逐日列出。
- 手机端 DetailDialog 与 NavigationChooser 均为底部弹层：必须显式设置 `left: 0; right: 0; width: 100%; transform: none`，不能仅覆盖桌面端 `transform` 而遗留 `left: 50%`。弹层任何边缘不得超出视觉视口。
- DetailDialog 使用 `max-height: calc(100dvh - 28px)` 与内部纵向滚动，底部操作区计入 `safe-area-inset-bottom`；NavigationChooser 在 320–767px 宽度下完整展示标题、说明、两个地图选项、坐标提示和关闭按钮，不允许横向滚动或裁切。

### MobileResultsSheet

- 拖拽把手是 48×24 的按钮，可点击在三档间循环；上下箭头改变档位；aria-expanded 和当前档位文本。
- drag end 按最近档位吸附；滚动列表位于 sheet 内，只有从顶部继续下拉才拖动面板。
- safe-area-bottom 必须计入；面板 full 时顶部不覆盖搜索栏。
- 性能硬约束：`pointermove` 期间禁止调用 React `setState`。使用 `requestAnimationFrame` 合并事件，并直接在面板 DOM 上写入 `--drag-y`；只有 pointerup/cancel 时才更新 `level`。销毁时取消未完成的 animation frame。
- 拖动开始/结束用 `classList` 切换 `is-dragging`；面板使用 `translate3d`、`will-change: transform`、`backface-visibility: hidden` 与合适的 `contain`，确保合成层移动而不是让 89 条列表参与布局/绘制。
- 拖动位移按屏幕和当前档位做边界限制，禁止把面板拉出顶部或底部；点击阈值 8px 保持不变。

## 数据接口

```ts
type Restaurant = {
  id: string; name: string; category: 'barbecue' | 'noodles' | 'snack' | 'other'; image: string; rating: number; reviews: number;
  cuisine: string[]; price: '¥' | '¥¥' | '¥¥¥'; openStatus: 'open' | 'closing' | 'closed';
  address: string; lat: number; lng: number; featuredDish: string[];
  hours: string; phone?: string;
}
```

距离从位置实时计算，不写死。模拟搜索匹配 name/cuisine/featuredDish/address 的小写字符串。原 1–45 的 45 家必须全部保留并重新归入四类；本轮五张图只增加 44 个去重后的名称，最终严格为 89 家，`sourceIndex` 连续 1–89 且不受距离排序影响。重复规则为去空格/标点后的标准化名称加人工别名：图片中的“矮子王烧烤”更新既有记录而不新增；“马拉古”视为既有“马拉古烧烤”并更新地址/分类而不新增；同名多分店合并为一个记录，地址字段列出主要分店，地图使用一个代表点。缺失的精确坐标、评分和营业数据可合理模拟并在 README 声明。

原45家分类必须显式写入数据，不依赖运行时关键词猜测：

- `barbecue`：帝王烧烤、湘永汇、矮子王烧烤、客串烧烤、河马夜市。
- `noodles`：尹新粉店、和擀面庄、屈麻子牛肉粉、刘记大西门凉拌粉、肖蒲罐罐米线、德一牛肉粉、胖大帅爆炒浇头盖浇面、呆呆螺蛳粉、王记古城面馆。
- `snack`：舒心冷饮、大树咖啡、不可炸鸡、7080、盛小姐与偏爱、湘城一品·河西点、上海手工灌汤包、红豆沙桂花小丸子、真宝卤味、梅干菜扣肉饼、湘城一品·冷水滩点、分子跳动、香酥鸡柳饼、清补凉、西门里、脆皮烧鸡。
- `other`：其余原记录；其中马拉古烧烤按新图“其他”分类并更新为帝皇广场1栋马拉古吃喝铺子。

### 本轮新增地点清单（严格 44 个）

| 分类 | 地点 | 图片地址/说明 |
|---|---|---|
| 烧烤 | 野肆烧烤 | 冷水滩区菱角山街道湘江西路北侧香河一品3栋3-105-1 |
| 烧烤 | 亮古子烧烤 | 冷水滩区菱角山街道春江路6号地；推荐牛油牛肉 |
| 烧烤 | 吴姐烧烤 | 冷水滩区鸿腾·御景；推荐烤五花肉 |
| 烧烤 | 曾老板烧烤 | 石牌楼街与零陵中路交叉口西北100米 |
| 烧烤 | 八一烧烤 | 建设路与百业街交叉口东南20米 |
| 烧烤 | 白眉烧烤 | 零陵路893号 |
| 烧烤 | 友得喝烧烤 | 梅湾街道麒麟公馆2-1栋104-110号 |
| 烧烤 | 欢老板烧烤 | 潇湘西路与湘江西路辅路交叉口西北80米 |
| 烧烤 | 褚秋东北烧烤 | 总店文昌路212号；分店永州大道西侧书雅东苑第二栋一层3-5号门面 |
| 烧烤 | 二元烧烤屋 | 舜皇路与零陵南路交叉口东20米；推荐烤五花肉、牛肉炒饭 |
| 粉面 | 天天过年粉店 | 育才一巷与育才路交叉口东北200米（近理想城） |
| 粉面 | 原之味卤粉 | 冷水滩区政府对面 |
| 粉面 | 唐记卤粉 | 翠竹路与南湖路交叉口东北40米 |
| 粉面 | 唐家面馆 | 冷水滩中医院对面 |
| 粉面 | 天成7号 | 零陵南路与亲水路交叉口西320米；推荐骨髓汤、猪蹄 |
| 粉面 | 佬卿猪杂粉 | 煤勘路与珍珠路交叉口东北20米 |
| 粉面 | 张氏牛肉粉 | 总店梧桐街道车站路120号；分点建设路与百业街交叉口南40米 |
| 粉面 | 和天下手擀面 | 梅湾街道湘永路体育中心湘永路280号 |
| 粉面 | 特色牛肉粉 | 原香都大酒店旁 |
| 粉面 | 石头火卤粉 | 富强小区3栋7-8号；梅湾街道三多亭471-473号楼 |
| 粉面 | 二中建设银行光头粉 | 永州二中建设银行旁摊位 |
| 粉面 | 老唐小炒店汤粉 | 仁湾镇长丰工业园长丰大道一汽大众4S店隔壁 |
| 粉面 | 常德牛肉粉 | 永州二中对面 |
| 粉面 | 晓善桂林米粉 | 冷水滩城市绿岛对面 |
| 小吃 | 子艺麻糍 | 17点左右二中对面出摊；19点左右步步高夏埠村对面 |
| 小吃 | 老椰记清补凉 | 愿景、中邦均有 |
| 小吃 | 张记伢家泡菜 | 肖家园街道零陵中路823号 |
| 小吃 | 二中炸串 | 永州二中对面小吃街第一家 |
| 小吃 | 凤凰园城标凉粉 | 凤凰园城标菜市场老爷爷摊位 |
| 小吃 | 屿大师包子铺 | 包子均为自制；图片未给精确门牌 |
| 小吃 | 唐氏泡菜 | 梅湾街道双洲路银丰广场3号门面 |
| 小吃 | 媛媛麻辣烫 | 桥头市场对面往三医院巷子门面 |
| 其他 | 猴子炒饭 | 零陵北路云恒至尊1号门面；也有砂锅饭 |
| 其他 | 金秋小灶 | 传芳路与西冲塘路交汇处 |
| 其他 | 李二麻辣烫 | 城市绿岛、体育中心、创发城对面；可烫可烤 |
| 其他 | 小宝干锅狗肉火锅 | 零陵北路与万寿路交叉口西100米 |
| 其他 | 妈妈柴火灶 | 进贤一巷与进贤路交叉口北150米；河西书香名邸 |
| 其他 | 笨富贵下饭菜 | 富园一区32栋6号门面 |
| 其他 | 胖辣椒居民楼菜馆 | 愿景香港道101号门面；富园二区4栋1-2号门面 |
| 其他 | 小小食府 | 湘永路208号（河东体育馆斜对面） |
| 其他 | 矮子红薯粉血鸭 | 兴旺路43号 |
| 其他 | 唐太公烤鱼 | 凤凰园汽车站十字路口 |
| 其他 | 济州岛烤肉 | 中央新城B区127号济州岛韩国料理 |
| 其他 | 商务酒店门口盒饭店 | 图片描述：以前商务酒店门口；推荐煎水豆腐、煮鱼块 |

## 无障碍与性能

- skip link 跳到结果；地图之外始终有等价列表操作。
- 搜索结果数量用 `aria-live=polite`；错误 toast 用 assertive。
- 所有 icon-only 按钮有 aria-label；焦点始终可见；不使用 hover-only 信息。
- `prefers-reduced-motion` 禁止 fly 动画与 sheet transform 动画。
- React Leaflet 动态/直接加载均可；照片 lazy-load；89 个标记暂不聚类，列表编号继续使用稳定 `sourceIndex`，地图针内不渲染编号；不能因距离排序重新编号。
- 地图选择器必须有 Dialog 标题与说明；关闭后焦点返回原“路线导航”按钮。原生 URI 只能由明确的用户点击触发，不能通过计时器自动跳转。

## GitHub Pages 部署

- Vite `base` 由 `VITE_BASE_PATH` 控制，默认 `./`；GitHub Actions 构建项目页时传入 `/${{ github.event.repository.name }}/`。用户站点或自定义域可传 `/`。
- 添加 `.github/workflows/deploy-pages.yml`：默认分支 push 与 `workflow_dispatch` 触发；Node LTS；`npm ci`；`npm run build`；`actions/configure-pages`；`actions/upload-pages-artifact` 上传 `dist`；`actions/deploy-pages` 发布。
- 权限至少为 `contents: read`、`pages: write`、`id-token: write`；环境为 `github-pages`。README 写明 Settings → Pages → Source 选择 GitHub Actions，以及项目页和用户页的 base 差异。

## Design Pre-Flight

- Identity lock：0 个系统外色值；单一 accent、radius scale、Lucide 图标族、固定字体角色。
- Anti-slop：0 个禁用字体/渐变/玻璃拟态/三等分卡片/嵌套卡片/空泛文案；签名标记明确。
- 状态：初始、加载、成功、空、错误、定位失败、瓦片失败均覆盖。
- Accessibility：对比度已记录；键盘路径、焦点、ARIA、reduced-motion、48px 触控与 safe area 均覆盖；移动端详情与导航弹层在 320px、390px、430px 视口均完整位于屏幕内。
- Layout：工具栏、媒体列表、地图浮层三种布局族；每个视图只有搜索或当前详情一个主操作。
- Scored critique：distinctiveness 3; hierarchy 4; consistency 4; accessibility 4; state coverage 4; copy 3; restraint 4; motion 4。总分 30/32，无轴 ≤2。
- Revise-and-justify：将两行顶栏改为单层搜索台，固定搜索键第 4 列以消除条件渲染错位；只禁用滚轮缩放，保留用户明确发起的双击/双指/框选缩放；编号针改为无字四色缩放针，让89个点在远景收敛、近景可辨；移动面板由 React 高频状态更新改为 rAF 合成层位移，消除89项结果树反复渲染；导航从陌生网页改为用户主动选择高德或系统地图；移动端底部弹层显式归零左右定位，避免继承桌面 `left: 50%` 后只显示半屏；数据门槛修订为原45家保留并新增44个去重名称。

## Build handoff

- Target agent: `react-vite-tailwind-engineer`
- Stack: React 18+, TypeScript, Vite, Tailwind CSS, React Leaflet/Leaflet, Radix Dialog/Popover, Lucide React。
- Setup: 使用 Radix primitives 并以锁定 token 主题化；不要手工重实现其可访问组件。
- Acceptance: 可直接 `npm install && npm run dev`；原45家全部保留，新增清单恰好44个去重名称，总数严格89、`sourceIndex` 连续1–89；“矮子王烧烤”和“马拉古”只更新原记录而不重复新增；默认从中国境内可访问的高德瓦片加载底图，attribution 正确，WGS84 数据转 GCJ-02 后标记与底图对齐，并可用环境变量替换供应商/坐标系；搜索键始终位于搜索框最右列；只有滚轮/触控板上下滚动不缩放地图，双击/双指/框选和 `+ / −` 均可缩放；地图针内无任何数字或文字，四类颜色和图例完全一致，视觉针约28×36并通过CSS变量随zoom从0.62缩放到1.0，缩放过程不重建89个Marker且不抖动；移动面板拖动期间 React 状态更新为0次且使用rAF；列表、地图弹窗和详情均能选择高德/系统地图；DetailDialog 与 NavigationChooser 在320px、390px、430px手机宽度下左右边界均在视口内、内容可完整滚动查看且无横向溢出；搜索/筛选/加载/空/错误可演示；GitHub Pages Actions配置完整；无TypeScript/build错误；README含89家、四分类、模拟坐标与去重说明。

Implement exactly this spec. Theme the design system with our locked tokens; do NOT redesign or re-implement its components.
