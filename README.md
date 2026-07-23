# 永州寻味地图

一个可直接运行的永州美食探索前端。使用 React、TypeScript、Tailwind CSS、React Leaflet 与 OpenStreetMap，实现搜索、筛选、定位、列表—地图双向联动、餐厅详情和移动端三档结果面板。

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
- 输入“错误”可演示可恢复错误状态；无匹配关键词可演示空状态。
- 按距离、评分、多选价格和营业状态筛选，并同步 URL 参数。
- 点击列表项或地图标记可双向选中、定位和弹出信息卡。
- 地图只关闭鼠标滚轮/触控板上下滚动缩放，仍支持双击、双指、框选和左上角 `+ / −` 控件。
- 地图以蓝色大头针标记甜品饮品、橙色大头针标记正餐小吃，并提供文字图例；筛选或距离排序不会改变原图编号。
- “使用我的位置”调用浏览器 Geolocation；拒绝权限后可一键使用永州市中心模拟位置。
- 手机端点击/拖动底板把手可在收起、半屏、全屏之间切换；拖动由 `requestAnimationFrame` 直接更新合成层，45 条列表不会在移动过程中反复渲染，键盘上下箭头同样可操作。
- 列表、地图弹窗和餐厅详情中的“路线导航”均打开同一地图选择器：iOS 可选高德地图或 Apple 地图，Android 可选高德地图或系统地图，桌面端提供高德地图网页版与 Apple 地图。

## 地图服务配置

默认瓦片源为 OpenStreetMap 标准服务，不需要 API Key，配置位于 `src/components/FoodMap.tsx`：

```tsx
<TileLayer
  attribution='&copy; OpenStreetMap contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

如果部署流量较大，请遵守 OpenStreetMap 的瓦片使用政策，并换成合规的商用瓦片提供商。只需替换 `url` 与 `attribution`；若服务需要令牌，建议通过 Vite 环境变量（如 `VITE_TILE_TOKEN`）注入，不要把密钥提交到仓库。

## 路线导航

导航链接集中在 `src/components/NavigationChooser.tsx` 生成。移动端的原生地图 URI 只会在用户明确选择地图应用时打开，不会自动跳转：

- iOS：`iosamap://navi` 或 Apple Maps HTTPS。
- Android：`androidamap://navi` 或 `geo:` 系统地图 URI。
- 桌面端：高德地图 URI 网页版或 Apple Maps HTTPS。

演示餐厅坐标按 WGS84 处理，高德链接设置 `dev=1`；实际路线和坐标偏移以地图应用为准。

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

`src/data/restaurants.ts` 严格包含需求图片编号 1–45 的 45 个餐厅点位，并保留图片中出现的店名与推荐菜。红房子下河线餐厅和湘城一品的多图信息按独立点位展示，`sourceIndex` 保证搜索、筛选及按距离排序后仍沿用原图编号。分类器会将甜品、饮品、咖啡、烘焙、冷饮和糖水归为 `dessert`，其余归为 `meal`。坐标、评分、营业状态等用于完整交互演示，不代表实时商业信息。
