# RealWorldLLM - 太空态势感知 3D 可视化 Demo

一个基于 WebGL 的太空态势感知演示项目，在浏览器中实时渲染地球轨道上的卫星与太空碎片，呈现电影级的 3D 视觉效果。

## 预览

- 高精度地球模型，带大气层散射光晕与晨昏线效果
- 20,000+ 轨道物体实时渲染（碎片、卫星、目标光学卫星）
- 点击金色目标卫星触发丝滑运镜，从宏观视角无缝切入微观跟踪
- 赛博朋克风格 HUD 界面，模拟 TLE 数据流与光学传感器锁定效果

## 技术栈

- **框架**：React + TypeScript + Vite
- **3D 渲染**：Three.js / React Three Fiber (@react-three/fiber)
- **辅助组件**：@react-three/drei
- **后期特效**：@react-three/postprocessing（Bloom 泛光、色差、扫描线等）
- **动画引擎**：GSAP（相机运镜与过渡动画）
- **状态管理**：Zustand

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── App.tsx                  # 应用入口
├── store.ts                 # Zustand 全局状态
├── components/
│   ├── Scene.tsx            # 3D 场景容器
│   ├── Earth.tsx            # 地球模型与大气层
│   ├── SolarSystem.tsx      # 太阳系环境光照
│   ├── Starfield.tsx        # 星空背景
│   ├── OrbitalObjects.tsx   # 轨道物体（碎片/卫星）
│   ├── Airplanes.tsx        # 飞行器
│   ├── CameraController.tsx # 相机控制与运镜
│   ├── HUD.tsx              # 抬头显示界面
│   ├── StartScreen.tsx      # 启动画面
│   └── ErrorBoundary.tsx    # 错误边界
└── utils/
    └── mockOrbits.ts        # 模拟轨道数据生成
```

## 许可证

MIT
