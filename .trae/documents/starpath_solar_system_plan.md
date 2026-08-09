# Starpath Solar System — 产品规划 & 实现方案

> 一个以「星际航点导航」为叙事的交互式 3D 太阳系可视化 Demo

---

## 一、产品定位

### 一句话描述
**Starpath** 不是又一个太阳系模拟器，而是一款以「星轨导航」为故事线的 3D 宇宙探索产品 —— 用户扮演一名星际航海家，从地球出发，沿着行星航点探索我们的宇宙家园。

### 目标用户
- 天文爱好者 / 学生（教育场景）
- 前端开发者（Three.js 学习参考）
- 科技产品 Demo 展示

### 核心体验流
```
开场 → 自动环游太阳系（展示模式）
  → 用户点击任意行星 / 搜索 / 选择航点
    → 飞行过渡动画（Fly-through）
      → 行星详情面板 + 实时环境观察
        → 时间轴快进看天文现象
```

---

## 二、竞品分析 & 差异化设计

### GitHub 参考项目提炼

| 项目 | Star | 借鉴点 |
|------|------|--------|
| fgferre/3d-solar-system-simulation | — | NASA JPL 轨道数据、搜索导航、教育面板、时空弯曲 |
| gurr-i/CelestialNavigator | ⭐ | R3F + Drizzle ORM 后端、开普勒运动 |
| RKYT24/3D-Solar-System | — | 单行星速度控制、主题切换、10k 程序化恒星 |
| Moez-lab/theejs-project-solarsystem | — | CubeMap 背景、卫星系统 |
| syunyu1031/solar-system-threejs | ⭐⭐⭐ | 经典入门、OrbitControls 用法 |
| bu4t/solar-system-threejs | ⭐⭐ | 轨道数据可视化、UI 面板 |

### 🌟 Starpath 独特设计（竞品没有的）

| # | 独特设计 | 技术实现 | 为什么独特 |
|---|---------|---------|-----------|
| 1 | **星轨航点系统** | 每个行星是一个 Waypoint，自动生成「航行路线」贝塞尔曲线 | 竞品都是散点展示，我们有叙事引导 |
| 2 | **小行星带粒子风暴** | `THREE.Points` + InstancedMesh，50000+ 粒子 + 动态噪声 | 90% 竞品忽略小行星带 |
| 3 | **行星环境动态模拟** | Earth: 昼夜 shader + 云层；Jupiter: 大红斑纹理滚动；Saturn: 环倾角自转 | 竞品几乎都是静态贴图 |
| 4 | **飞行导航模式 (WASD)** | 自定义 FlyControls + 碰撞检测 + 速度衰减 | 竞品只有 OrbitControls 环绕 |
| 5 | **事件时间轴** | 可视化时间轴可看日食/月食/合相预测 | 竞品只有时间倍速，没有天象事件 |
| 6 | **你在这里 (You Are Here)** | 在太阳系中标注当前地球位置 + 实时时钟 | 连接用户和宇宙的情感纽带 |

---

## 三、技术选型

```
构建工具:   Vite 5.x (极速 HMR, 零配置 TS)
前端框架:   原生 ES6+ (无 React/Vue, 轻量)
3D 引擎:    Three.js 0.160+ (WebGL2, ES Modules)
后处理:     Three.js EffectComposer + UnrealBloomPass
轨道控制:   自定义 FlyControls + OrbitControls 混合
粒子系统:   THREE.Points + BufferGeometry
着色器:     原生 GLSL (昼夜循环、云层、大气光晕)
纹理来源:   远程加载 (Three.js 官方) + 程序化生成
UI 层:      原生 HTML/CSS (不引入 UI 框架)
字体:       Inter (Google Fonts)
```

### 为什么不选 React + R3F
- Demo 单页应用，原生 JS 更轻、更快启动
- Three.js 原生 API 更直观学习
- 减少打包体积（R3F + React 约 200KB gzip）

---

## 四、产品结构（文件树）

```
/workspace/
├── index.html                        # 入口 HTML (CSS + UI Overlay)
├── package.json                      # 依赖
├── vite.config.js                    # Vite 配置
├── public/
│   └── textures/                     # (远程加载则不需要)
├── src/
│   ├── main.js                       # 启动入口
│   ├── core/
│   │   ├── Scene.js                  # Three.js Scene + Camera + Renderer 初始化
│   │   ├── Controls.js               # OrbitControls + FlyControls 混合
│   │   ├── AnimationLoop.js          # requestAnimationFrame 循环 + 时钟
│   │   └── PostProcessing.js         # Bloom + 可选后处理
│   ├── data/
│   │   └── planets.js                # 行星数据（名称/大小/距离/轨道周期/颜色/描述）
│   ├── objects/
│   │   ├── Sun.js                    # 太阳（Mesh + PointLight + 光晕 Sprite）
│   │   ├── Planet.js                 # 行星基类（Sphere + 轨道组 + 自转公转）
│   │   ├── Earth.js                  # 地球（昼夜 shader + 云层 + 大气）
│   │   ├── Jupiter.js                # 木星（纹理滚动 + 大红斑）
│   │   ├── Saturn.js                 # 土星（环 Geometry + 倾角）
│   │   ├── Moon.js                   # 卫星基类
│   │   ├── AsteroidBelt.js           # 小行星带 (THREE.Points, 50k 粒子)
│   │   ├── KuiperBelt.js             # 柯伊伯带 (外圈粒子)
│   │   ├── Starfield.js              # 星空背景 (程序化生成 20k 星)
│   │   ├── OrbitLine.js              # 轨道线 (CircleGeometry 虚线)
│   │   └── WaypointPath.js           # 星轨航点连接曲线 (CatmullRomCurve3)
│   ├── shaders/
│   │   ├── earthDayNight.glsl        # 地球昼夜循环片元着色器
│   │   ├── atmosphere.glsl           # 大气光晕着色器
│   │   └── sunGlow.glsl              # 太阳辉光
│   ├── interaction/
│   │   ├── Raycaster.js              # 射线拾取 (点击/hover 行星)
│   │   ├── FlyTo.js                  # 平滑飞行过渡动画
│   │   └── Search.js                 # 搜索导航
│   ├── ui/
│   │   ├── HUD.js                    # 抬头显示（当前目标/坐标/速度）
│   │   ├── ControlPanel.js           # 控制面板（时间/显示切换）
│   │   ├── InfoPanel.js              # 行星详情面板
│   │   ├── Timeline.js               # 事件时间轴
│   │   └── LoadingScreen.js          # 加载界面
│   └── utils/
│       ├── Textures.js               # 纹理加载 + 错误回退
│       ├── MathUtils.js              # 天文单位转换/角度工具
│       └── Logger.js                 # 日志
```

### 架构依赖图

```
main.js
  ├── Scene.js  ←── Controls.js, PostProcessing.js
  ├── AnimationLoop.js
  │     ├── Sun.js
  │     ├── Planet.js ←── Earth.js, Jupiter.js, Saturn.js
  │     ├── Moon.js
  │     ├── AsteroidBelt.js
  │     ├── KuiperBelt.js
  │     ├── Starfield.js
  │     ├── OrbitLine.js
  │     └── WaypointPath.js
  ├── interaction/
  │     ├── Raycaster.js
  │     ├── FlyTo.js
  │     └── Search.js
  └── ui/
        ├── HUD.js
        ├── ControlPanel.js
        ├── InfoPanel.js
        ├── Timeline.js
        └── LoadingScreen.js
```

---

## 五、视觉设计风格

### 色彩方案
```
主背景:    #050510 (深空黑, 带 0.8 深蓝渐变)
主色调:    #6EE7F9 (青蓝, 科技感)
辅助色:    #F472B6 (霓虹粉, 航点标记)
航路线:    渐变色从 #6EE7F9 → #F472B6
高亮色:    #FDE047 (金, 太阳/焦点)
文字:      #E2E8F0 (浅灰白)
次级文字:  #94A3B8
面板背景:  rgba(15, 23, 42, 0.85)  backdrop-blur 12px
```

### 排版
- 字重: Inter 400 / 500 / 700
- HUD 大字号: 48-72px, tracking-widest
- 面板标题: 20-24px
- 正文: 14px

### 设计语言
- **毛玻璃面板** (backdrop-filter: blur)
- **霓虹发光边框** (box-shadow 多层 glow)
- **渐变航线路径**
- **无冗余装饰** — 纯粹的深空沉浸感

---

## 六、实现步骤（精确到每个文件）

### Phase 1: 脚手架 + 基础场景
1. `npm create vite@6 . -- --template vanilla` → 重命名为项目
2. 安装 `three`, `@types/three`
3. `src/main.js` — 启动入口，创建 Scene + Camera + Renderer
4. `src/core/Scene.js` — 封装初始化，加入 HemisphereLight + AmbientLight
5. `src/core/AnimationLoop.js` — 渲染循环 + THREE.Clock

### Phase 2: 天体渲染
6. `src/data/planets.js` — 完整行星数据表（含中文描述）
7. `src/objects/Starfield.js` — `THREE.Points` + 20k 随机顶点 + 渐变着色器
8. `src/objects/Sun.js` — MeshBasicMaterial + PointLight + Sprite 光晕
9. `src/objects/OrbitLine.js` — 8 条 CircleGeometry 虚线轨道
10. `src/objects/Planet.js` — 基类，Group 嵌套实现公转自转
11. `src/objects/Earth.js` — 昼夜 shader + 云层 + 大气光晕 Sprite
12. `src/objects/Saturn.js` — RingGeometry + 半透明材质
13. `src/objects/AsteroidBelt.js` — 50k 粒子 + 噪声动画
14. `src/objects/KuiperBelt.js` — 外圈粒子

### Phase 3: 独特设计实现
15. `src/objects/WaypointPath.js` — CatmullRomCurve3 连接 8 个行星，动画描边
16. `src/shaders/earthDayNight.glsl` — 根据光源方向混合昼/夜纹理
17. `src/shaders/atmosphere.glsl` — Fresnel 边缘光晕
18. `src/core/Controls.js` — 自定义混合控制（Orbit + WASD FlyMode 切换）
19. `src/core/PostProcessing.js` — UnrealBloomPass 辉光

### Phase 4: 交互
20. `src/interaction/Raycaster.js` — hover 高亮 + click 选中
21. `src/interaction/FlyTo.js` — 阻尼缓动飞行过渡
22. `src/interaction/Search.js` — 名称搜索 → FlyTo

### Phase 5: UI Overlay
23. `index.html` — HUD + 控制面板 + 信息面板 + 时间轴 DOM 骨架
24. `src/ui/HUD.js` — 坐标/速度/当前目标
25. `src/ui/ControlPanel.js` — 时间倍速、显示切换开关
26. `src/ui/InfoPanel.js` — 行星详情（中文名/英文名/直径/公转周期/描述/小知识）
27. `src/ui/Timeline.js` — 天象时间轴（简易）
28. 内联 CSS 实现深空毛玻璃风格

### Phase 6: 收尾
29. 纹理远程加载 + 失败回退到纯色
30. 响应式适配（resize handler）
31. 移动端触摸支持
32. `npm run build` 构建验证

---

## 七、数据尺度处理

真实天文数据尺度差异巨大（太阳直径 1,391,400km vs 海王星距日 4,495,000,000km），**不适合按比例渲染**。我们采用：

| 参数 | 策略 | 公式 |
|------|------|------|
| 行星大小 | 对数压缩 | `size = log(actual_diameter) * 2 - 8` |
| 轨道距离 | 调整为可读性 | `distance = actual_au * 40`（1AU = 40 单位） |
| 轨道速度 | 真实相对比 | 地球 = 1x, 水星 ≈ 4.15x, 海王星 ≈ 0.06x |
| 自转速度 | 真实相对比 | 地球 = 1x, 木星 ≈ 2.4x |

---

## 八、风险 & 处理

| 风险 | 影响 | 处理 |
|------|------|------|
| 远程纹理加载失败 | 行星显示黑/白 | 回退到纯色 + Canvas 程序化纹理 |
| 50k 小行星带粒子性能 | 低端 GPU 掉帧 | 根据 `renderer.capabilities` 动态降级到 20k |
| 太阳 PointLight 照到全场景 | 移动端发热 | 移动端自动降低 light.intensity |
| 后处理 Bloom 开销 | 低性能设备卡 | 提供开关，默认开启，检测到 FPS < 30 自动关闭 |

---

## 九、验收标准

- [ ] `npm run dev` 启动无报错，首页 3 秒内可见星空
- [ ] 鼠标拖拽可旋转视角，滚轮缩放
- [ ] 点击任意行星 → 飞行过渡 → 显示信息面板
- [ ] 搜索框输入「木星」→ 自动定位
- [ ] WASD + Shift/Space 可进入飞行模式
- [ ] 控制面板时间倍速 0.1x ~ 50x 有效
- [ ] 小行星带/柯伊伯带可见且有动态效果
- [ ] 地球昼夜变化可见
- [ ] 星轨航点曲线渐变发光
- [ ] `npm run build` 产物 < 3MB gzip

---

## 十、产物

最终交付：
- `npm run dev` 本地开发服务器可预览
- `npm run build` 可部署到静态托管（GitHub Pages / Vercel）
- 所有源文件在 `/workspace/src/` 下按架构组织
- 单页应用，无后端依赖

---

*规划完成 · 待审批*
