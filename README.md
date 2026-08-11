# Starpath Solar System 

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
