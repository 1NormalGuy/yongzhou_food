# 永州寻味地图

一个可直接运行的永州美食探索前端。使用 React、TypeScript、Tailwind CSS、React Leaflet 与国内可访问的高德标准瓦片，实现搜索、筛选、定位、列表—地图双向联动、餐厅详情和移动端三档结果面板。

## 本地启动

```bash
npm install
npm run dev
```

打开终端显示的本地地址（通常为 `http://localhost:5173`）。生产构建：

```bash
npm run build
npm run preview
```

## 可演示功能

- 搜索店名、菜系、地址或招牌菜，例如“火锅”“咖啡厅”“牛肉粉”。
- 本地搜索和筛选会立即更新结果、地图与 URL；无匹配关键词会显示可恢复的空状态。
- 按距离、评分、多选价格和营业状态筛选，并同步 URL 参数。
- 点击列表项或地图标记可双向选中、定位和弹出信息卡。
- 地图只关闭鼠标滚轮/触控板上下滚动缩放，仍支持双击、双指、框选和左上角 `+ / −` 控件。
- 地图以四色无字大头针区分烧烤、粉面、小吃和其他，并提供文字图例；图钉视觉尺寸会随地图缩放调整，筛选或距离排序不会改变列表与弹窗中的来源编号。
- “使用我的位置”调用浏览器 Geolocation；拒绝权限后可一键使用永州市中心模拟位置。
- 手机端底部使用透明玻璃质感的“店家 / 地图”切换栏：店家视图按当前位置或永州中心由近到远排序，地图视图保持完整画布；选择店家后自动返回地图并打开对应标记。
- 列表、地图弹窗和餐厅详情中的“高德看店”会直接打开高德地图的商户名搜索结果，不会自动开始路线导航。

## 地图服务配置

地图服务与坐标处理集中在 `src/map/config.ts` 和 `src/map/coordinates.ts`。默认使用中国境内可访问的高德标准瓦片，演示环境无需 API Key：

```text
https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}
```

默认子域为 `1–4`，attribution 显示并链接到高德地图。可通过以下 Vite 环境变量替换服务，而无需修改组件：

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `VITE_MAP_TILE_URL` | 高德标准瓦片 URL | Leaflet 瓦片模板 |
| `VITE_MAP_ATTRIBUTION` | 高德地图链接 | Leaflet attribution HTML |
| `VITE_MAP_SUBDOMAINS` | `1234` | 子域字符串，也支持 `1,2,3,4` |
| `VITE_MAP_COORDINATE_SYSTEM` | `gcj02` | 可选 `gcj02` 或 `wgs84` |

餐厅数据、浏览器 Geolocation 和高德搜索中心始终保存为 WGS84。默认高德瓦片为 GCJ-02，因此只有传入 Leaflet 的初始中心、视野边界、餐厅标记和当前位置会转换为 GCJ-02；中国境外坐标不会转换。距离计算与高德搜索链接仍使用原始 WGS84。替换为 WGS84 瓦片时请设置：

```bash
VITE_MAP_TILE_URL="https://你的服务/{z}/{x}/{y}.png" \
VITE_MAP_ATTRIBUTION="你的地图服务" \
VITE_MAP_SUBDOMAINS="" \
VITE_MAP_COORDINATE_SYSTEM=wgs84 \
npm run dev
```

默认直连瓦片仅用于演示。正式生产或商用部署需按照地图供应商的授权条款接入已获许可的服务。若改用高德官方 JavaScript API，需要申请 Web 端 Key 并配置安全密钥；密钥应通过部署环境注入，不要提交到仓库。

## 高德看店

商户搜索链接集中在 `src/components/AMapSearchLink.tsx` 生成，统一使用高德官方 URI 搜索端点：

```text
https://uri.amap.com/search
```

`keyword` 始终传入完整商户名；原始经纬度只用于 `center` 偏置搜索范围，同时传入 `city=永州`、`view=map`、`src=yongzhou_food` 与 `callnative=1`。链接在新浏览上下文打开；支持的手机可交给高德 App，但意图始终是商户搜索结果，而不是立即导航。

## GitHub Pages 部署

仓库已提供 `.github/workflows/deploy-pages.yml`。推送到 `main` 后会自动执行 `npm ci`、生产构建并发布 `dist`：

1. 在 GitHub 仓库打开 **Settings → Pages**。
2. 将 **Build and deployment → Source** 设为 **GitHub Actions**。
3. 推送到 `main`，或在 **Actions → Deploy to GitHub Pages** 中手动运行。

Vite 的 `base` 由 `VITE_BASE_PATH` 控制，本地默认使用相对路径 `./`。工作流默认按仓库名称生成项目页路径，例如仓库名为 `yongzhou_food` 时使用 `/yongzhou_food/`。

- 普通项目页 `https://用户名.github.io/仓库名/`：无需额外配置。
- 用户站点 `用户名.github.io` 或自定义域：在仓库 **Settings → Secrets and variables → Actions → Variables** 新建 `VITE_BASE_PATH`，值设为 `/`。
- 需要其他子路径时，将同一变量设为 `/你的路径/`，并保留首尾斜杠。

也可在本地验证项目页构建：

```bash
VITE_BASE_PATH=/test-repo/ npm run build
```

## 模拟数据

`src/data/restaurants.ts` 严格包含 89 个餐厅地点：完整保留原编号 1–45，并加入本轮图片去重后的 44 个名称，`sourceIndex` 连续为 1–89。所有地点均显式归入 `barbecue`（烧烤）、`noodles`（粉面）、`snack`（小吃）或 `other`（其他），不使用关键词运行时猜测。

数据按去空格和标点后的标准化店名去重：“矮子王烧烤”与“马拉古”只更新既有记录，没有重复新增；同名多分店合并为一个记录，并在地址中列出主要分店。新增地点缺少精确经纬度时，使用冷水滩城区内互不重复的合理模拟坐标。评分、评论数、营业状态及未明确给出的门牌同样用于交互演示，不代表实时商业信息。
