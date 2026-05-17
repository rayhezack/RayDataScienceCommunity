# Realta Landing Page — 复刻Prompt文档

## 1. 项目概述

构建一个单页、长滚动式的机构级Landing Page。设计哲学为**"极简深绿、大量留白、精致微动效"**。整体气质冷静、专业、具有资本基础设施的厚重感，同时通过模糊渐变、等距SVG插图和悬浮动画注入现代科技感。

**页面结构（自上而下）**：

1. 粘性导航栏（Header）
2. Hero首屏
3. Assets资产展示（三栏粘性+3张卡片）
4. Selection Principles（原则+Marquee）
5. Trust & Transparency（2×2网格卡片）
6. Announcements公告（4列博客卡片）
7. Contact Us联系表单（深色分栏）
8. Footer页脚

------

## 2. 设计系统（Design System）

### 2.1 色彩体系

严格使用以下色值，禁止随意替换：

Table





| 用途                   | 色值      | Tailwind类参考                   |
| :--------------------- | :-------- | :------------------------------- |
| **页面背景**           | `#f5f7f6` | `bg-[#f5f7f6]`                   |
| **主文字/深色背景**    | `#132a24` | `text-[#132a24]`, `bg-[#132a24]` |
| **强调绿**             | `#274f44` | `text-[#274f44]`                 |
| **次要文字**           | `#4b615a` | `text-[#4b615a]`                 |
| **弱化/标签/辅助线**   | `#879f98` | `text-[#879f98]`                 |
| **Logo/点缀绿**        | `#78A184` | `fill-[#78A184]`                 |
| **区块背景（浅绿灰）** | `#eef5f1` | `bg-[#eef5f1]`                   |
| **深色卡片背景**       | `#173028` | `bg-[#173028]`                   |
| **输入框背景**         | `#1d3a31` | `bg-[#1d3a31]`                   |
| **页脚背景**           | `#0b1713` | `bg-[#0b1713]`                   |
| **纯白**               | `#ffffff` | `bg-white`, `text-white`         |

### 2.2 字体系统

- **字体族**：`Satoshi`（通过 `https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap` 引入）
- **全局字重偏好**：极轻。正文大量使用 `font-thin` (300)，标题使用 `font-light` (400)
- **字距**：全局标题与正文均使用 `tracking-tight`
- **字号层级**：
  - Hero标题：`text-[40px] sm:text-6xl md:text-7xl lg:text-[80px]`
  - 区块标题：`text-[40px] sm:text-[64px]`
  - 卡片标题：`text-2xl sm:text-3xl xl:text-4xl`
  - 正文/描述：`text-sm sm:text-lg xl:text-xl` 或 `text-base sm:text-2xl`
  - 标签/辅助：`text-xs` 或 `text-sm`，`uppercase`，`tracking-widest`

### 2.3 间距与容器

- **全局容器边距**：`px-4 sm:px-8 lg:px-16 2xl:px-24`
- **区块纵向间距**：`py-16 sm:py-40`
- **卡片内边距**：`p-8` 或 `p-8 sm:p-10`
- **卡片圆角**：统一 `rounded-[2rem]`（32px）
- **按钮圆角**：`rounded-full`
- **输入框圆角**：`rounded-2xl`（16px）
- **卡片阴影默认**：`shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]`
- **卡片阴影Hover**：`shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]`

### 2.4 图标

使用 `iconify-icon` 组件（`@iconify-icon/solar` 图标集），通过 CDN `https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js` 引入。

------

## 3. 全局交互与动画规范

### 3.1 必须定义的Keyframes

在全局 `<style>` 中精确定义以下动画：

css

Copy

```css
/* 标准上浮 */
@keyframes fadeUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 模糊上浮（专用于文字） */
@keyframes blurFadeUp {
  0% { opacity: 0; filter: blur(16px); transform: translateY(30px); }
  100% { opacity: 1; filter: blur(0px); transform: translateY(0); }
}

/* 背景光晕流动1 */
@keyframes gradientFlow1 {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.2; }
  50% { transform: translate(-80px, 60px) scale(1.8); opacity: 0.95; }
}

/* 背景光晕流动2 */
@keyframes gradientFlow2 {
  0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.3; }
  50% { transform: translate(80px, -80px) scale(1.7); opacity: 0.95; }
}

/* 悬浮（用于SVG插图） */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

/* 无限横向滚动 */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

### 3.2 滚动触发显示类

css

Copy

```css
.reveal-up {
  opacity: 0; transform: translateY(30px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
.reveal-up.in-view { opacity: 1; transform: translateY(0); }

.reveal-blur {
  opacity: 0; filter: blur(16px); transform: translateY(30px);
  transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, filter, transform;
}
.reveal-blur.in-view { opacity: 1; filter: blur(0px); transform: translateY(0); }

/* 延迟类（必须与上述类同时使用） */
.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }
.delay-500 { transition-delay: 500ms; }
```

**触发机制**：使用 Intersection Observer，`threshold: 0.15`，元素进入视口时添加 `.in-view`，且只触发一次（`unobserve`）。

### 3.3 全局Hover规范

- **卡片**：`hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] transition-all duration-500`
- **按钮（深色）**：`hover:bg-[#1b3b33] hover:shadow-lg hover:-translate-y-0.5`
- **按钮（白色/浅色）**：`hover:bg-black/5 hover:border-[#132a24]/40 hover:-translate-y-1`
- **链接下划线**：使用 `after:` 伪元素实现从右向左展开的 `scaleX` 动画
- **图标按钮**：箭头图标 `group-hover:translate-x-1` 或 `group-hover:translate-x-1.5`

### 3.4 Header滚动行为

- 默认高度 `h-24`，向下滚动超过50px后变为 `h-20` 并添加 `shadow-md`
- 背景始终为 `bg-[#f5f7f6]/90 backdrop-blur-md`
- 过渡时间 `duration-500`

------

## 4. 逐区块详细规范

### 4.1 导航栏（Header）

- **结构**：Sticky top-0, z-50, flex justify-between items-center
- **Logo**：SVG图标（36×36px，sm:44×44px）+ "Realta" 文字。图标为圆角矩形（rx="22"）填充 `#78A184`，内含两个白色竖条。Hover时 `scale-110 rotate-3`，且矩形填充变为 `#132a24`
- **导航链接**：`hidden md:flex`, `gap-10`, `text-xl`, `text-[#546b64]`, `font-thin`
  - 当前页链接：底部有常驻1px下划线（`after:w-full`）
  - 非当前页：Hover时底部下划线从0展开至100%宽度
- **右侧CTA**："Contact us" 按钮，`bg-[#132a24] text-white px-6 py-3 rounded-full text-lg`，带 `solar:arrow-right-linear` 图标

### 4.2 Hero首屏

- **容器**：`min-h-[calc(100vh-8rem)]`, flex-col justify-center, relative, overflow-hidden
- **背景光晕**（绝对定位，-z-10）：
  - 右上：`bg-[#c8dbd2]`, 800×800px, `rounded-full blur-[100px]`, `animate-[gradientFlow1_8s_ease-in-out_infinite]`
  - 左中：`bg-[#b9cfc5]`, 600×600px, `rounded-full blur-[100px]`, `animate-[gradientFlow2_10s_ease-in-out_infinite]`
- **主标题**：`blurFadeUp` 动画，延迟100ms
  - 文案："Infrastructure for **Real-World** Capital."（Real-World使用 `text-[#274f44]`）
- **左下描述**：`blurFadeUp`，延迟300ms，`max-w-xl`
  - 文案包含一个带下划线的可点击词组："compliant on-chain access"
- **右下CTA区**：`fadeUp`，延迟500ms
  - 主按钮："Explore assets"，深色圆角按钮，带箭头图标
  - 次按钮："Docs & FAQs"，透明边框按钮
  - 底部小字：`uppercase tracking-widest text-[#879f98]`，"ACCESS, STRUCTURED FOR THE NEXT ERA OF MARKETS."

### 4.3 Assets资产展示区（最复杂区块）

**整体布局**：三栏结构，仅在大屏（`lg:`）显示左右Sticky，移动端为单列。

- **移动端顶部**：居中的标题区（`reveal-blur`），标签 "ASSETS" 带左右横线装饰
- **左栏（lg:flex-1）**：Sticky `top-[30vh]`，右对齐文字。包含小标签 "ASSETS"（带右横线）和大标题 "Institutional-Grade Asset **Access.**"（Access为强调色）。初始状态通过JS控制有横向偏移动画（与中间卡片滚动联动，可选实现）
- **中栏**：`w-full lg:w-[450px] xl:w-[500px]`，垂直排列3张卡片，`gap-10`
  - 每张卡片结构统一：
    - 外层：`group bg-white rounded-[2rem] border border-black/5 overflow-hidden shadow-... hover:shadow-... hover:-translate-y-2 transition-all duration-500 cursor-pointer reveal-up delay-100`
    - **上半区（图片/SVG区）**：`h-[320px]`, flex items-center justify-center, 渐变背景（每张卡片渐变方向不同：to-br / to-b / to-bl），带 `radial-gradient` 或 `linear-gradient` 装饰，底部 `border-b border-black/5`
      - 内部放置等距3D SVG插图（见下方SVG规范）
    - **下半区（文字区）**：`p-8`
      - 顶部小字：`text-xs tracking-widest uppercase text-[#879f98]`，如 "Asset 01 / 03"
      - 标题：`font-light text-2xl sm:text-3xl xl:text-4xl text-[#132a24] group-hover:text-[#274f44]`
      - 描述：`text-[#4b615a] font-thin`
  - **3张卡片内容**：
    1. **Pre-IPO Equity**：SVG为3个等距柱状体+虚线折线+节点，带动画 `float`（不同delay）
    2. **Private Credit**：SVG为3层等距堆叠平台，带动画 `float`
    3. **Structured Vaults**：SVG为多层嵌套六边形/多边形，带动画 `pulse`
- **右栏（lg:flex-1）**：Sticky `top-[30vh]`，左对齐。一段描述文字："Institutional asset exposure, structured through compliant on-chain infrastructure."

#### Assets SVG插图规范（3张卡片）

**通用SVG特征**：

- ViewBox `0 0 400 400`
- 使用 `<defs>` 定义渐变：`eq-top`（白到浅灰）、`eq-left`（浅绿到深绿）、`eq-right`（中绿到深绿）
- 使用 `feDropShadow` 滤镜创造悬浮阴影：`dx="0" dy="25" stdDeviation="20" flood-color="#132a24" flood-opacity="0.08"`
- 元素使用 `animate-[float_6s_ease-in-out_infinite]`，不同组设置 `animation-delay: -2s, -4s` 形成错开浮动
- 包含辅助网格线（opacity 0.1）增强科技感

#### Selection Principles子区块

- 位于3张卡片下方，`mt-24`
- 背景：`bg-[#eef5f1] rounded-[2rem] border border-black/5`
- 内部网格：`grid grid-cols-1 xl:grid-cols-12 gap-16 xl:gap-24`
  - 左侧（xl:col-span-5）：标题 "Selection Principles." + 描述
  - 右侧（xl:col-span-7）：2×2网格，4条原则。每条为 `flex gap-5 items-start`
    - 编号：`text-xl text-[#a5b7b1] font-mono font-light`，Hover时变 `text-[#132a24]`
    - 文字：`text-base sm:text-3xl text-[#4b615a] font-thin`，Hover时 `translate-x-1`
    - 延迟：分别为 delay-100 至 delay-400

#### Marquee子区块

- 位于Selection Principles底部，作为视觉分隔
- 无限横向滚动圆形Logo墙
- 容器：`overflow-hidden flex`，内部 `flex gap-8 sm:gap-12 items-center pr-8 sm:pr-12 w-max`
- 动画：`animation: marquee 35s linear infinite;`，`hover:[animation-play-state:paused]`
- **两侧渐变遮罩**：绝对定位，左 `bg-gradient-to-r from-[#eef5f1] to-transparent`，右 `bg-gradient-to-l`
- **圆形元素**：`w-20 h-20 sm:w-[96px] sm:h-[96px] rounded-full`，包含：
  - 渐变灰圆形 + 交叉线SVG
  - 橙色 `#dfb28e` 圆形 + "AI" 文字
  - 白色圆形 + 抽象图标
  - 深灰/黑色圆形 + 几何图标
  - 蓝色 `#1851f5` 圆形
  - 共9个不同图标，**复制一份实现无缝循环**（共18个）

#### Request Access按钮

- 居中，`bg-[#1b2e28] text-white px-10 py-5 rounded-full text-base sm:text-2xl`
- 上方间距 `py-16`

### 4.4 Trust & Transparency

- 顶部边框：`border-t border-black/5`
- 标题区：居中，`reveal-blur`
  - 标签："TRUST & TRANSPARENCY" 带横线
  - 标题："Built for **Confidence.**"
  - 描述：max-w-4xl，居中
- **卡片网格**：`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8`
  - **卡片1**（lg:col-span-6）："Verifiable Assets"
    - 白底卡片，内部右下角有抽象3D盾牌/方块视觉区
    - 使用 `solar:shield-check-bold-duotone` 图标作为中心元素
    - 背景有 `linear-gradient` 网格（`bg-[size:40px_40px]`）+ `mask-image` 径向渐变淡出
    - 浮动装饰方块：`animate-[float_4s_ease-in-out_infinite]` 等
  - **卡片2**（lg:col-span-6）："Compliant Access"
    - 白底卡片，内部有**轨道系统**：3个同心圆，border-dashed，`animate-[spin_30s_linear_infinite]` 和 `40s reverse`
    - 中心Hub：`w-20 h-20 sm:w-24 sm:h-24 rounded-full` 白色，带 `solar:lock-keyhole-bold-duotone` 图标
    - 4个轨道节点：浮动小圆，各带不同图标（shield-keyhole, global, user-check, document-text）
    - Hover时中心出现绿色对勾徽章（`bg-[#2aa168]`，`scale-0 group-hover:scale-100`）
  - **卡片3**（lg:col-span-5）："Valuation Discipline"
    - 白底卡片，内部有3层堆叠的"NAV Update"卡片视觉
    - 最上层卡片：白色圆角矩形，左侧图标+文字"Real-time"，右侧绿色"Synced"标签
    - 背景有 `animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]` 的扩散圆环
  - **卡片4**（lg:col-span-7）："Transparent Reporting"
    - **深色卡片**：`bg-[#132a24]`，文字全白/灰
    - 内部有图表视觉：SVG面积图（绿色渐变填充 `#2aa168`），底部4个柱状体，高度递增，顶部带百分比标签（+3%, +12%, +24%, +50%）
    - 柱状体使用 `backdrop-blur-sm` 和 `bg-white/5` 玻璃质感，最高柱使用 `bg-gradient-to-t from-[#2aa168]/10 to-[#2aa168]/40`

### 4.5 Announcements公告

- 背景透明，顶部边框
- 标题区：左对齐，"BLOG" 标签 + "Announcement." 标题
- **4列网格**：`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10`
- **单张卡片结构**：
  - 外层：`<a href="#" class="group block cursor-pointer flex flex-col h-full w-full reveal-up delay-xxx">`
  - 图片区：`aspect-[1.5/1] bg-[#132a24] rounded-[1.5rem] mb-8 overflow-hidden relative`
    - 背景图：Unsplash外链图，`bg-cover bg-center opacity-40 mix-blend-overlay`
    - 渐变遮罩：`bg-gradient-to-t from-[#132a24] via-[#132a24]/40 to-transparent`
    - 中央Logo：白色Realta Logo SVG，`group-hover:scale-110 transition-transform duration-700`
  - 文字区：
    - 日期：`text-[#879f98] font-thin`，如 "Mar 26, 2026"
    - 标题：`text-[#132a24] font-light group-hover:text-[#274f44] line-clamp-3`

### 4.6 Contact Us联系表单

- **背景**：`bg-[#132a24] py-16 sm:py-40`
- **布局**：`grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-32 items-start`
  - **左栏**（lg:col-span-5）：Sticky `top-36`
    - 标题："Contact Realta." 白色大字
    - 描述：两段文字，含 `mailto:support@realta.finance` 链接（白色下划线）
  - **右栏**（lg:col-span-7）：
    - 卡片容器：`bg-[#173028] border border-white/5 rounded-[2rem] p-4 sm:p-14 shadow-2xl hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-1`
    - 表单：`grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10`
    - **输入框统一样式**：
      - `bg-[#1d3a31] border border-transparent rounded-2xl h-14 sm:h-16 px-4 sm:px-6 text-white`
      - Focus状态：`focus:border-white/30 focus:bg-[#204036] focus:ring-2 focus:ring-white/10`
      - Hover状态：`hover:bg-[#204036]`
      - 字体：`font-thin text-base sm:text-xl`
      - 占位符颜色：`placeholder-[#879f98]/50`
    - **字段**：First Name*, Last Name*, Email*, Organization, Inquiry Type*（自定义下拉）, Message*（textarea, h-32 sm:h-48, resize-none）
    - **自定义下拉菜单**：
      - 触发器：与输入框同样式的按钮，右侧箭头图标 `solar:alt-arrow-down-linear`
      - 下拉框：绝对定位，`bg-[#1d3a31] border border-white/10 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]`
      - 选项：白色文字，`hover:bg-[#204036]`，带 `border-b border-white/5` 分隔线
      - 交互：点击展开/收起，箭头旋转180°，点击外部关闭，选中后更新按钮文字
    - **提交按钮**：`bg-white text-[#132a24] px-8 sm:px-10 py-4 sm:py-5 rounded-full`，Hover `hover:bg-[#eef5f1]`
    - **底部声明**：`text-xs sm:text-lg text-[#879f98]`，含 reCAPTCHA 提示文字及 Privacy Policy / Terms of Service 链接

### 4.7 Footer页脚

- **背景**：`bg-[#0b1713] relative overflow-hidden`
- **网格背景装饰**：`bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]`
- **内容网格**：`grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-10`
  - **品牌区**（md:col-span-12 lg:col-span-4）：
    - Logo+文字（同Header，白色版本）
    - 描述："Infrastructure for Real-World Capital..."
    - 免责声明："Realta is an asset infrastructure platform..."
  - **链接列**（3列）：Assets, Infrastructure, Legal
    - 标题：`text-white text-lg font-light`
    - 链接：`text-[#879f98] hover:text-white hover:translate-x-1 transition-all duration-300`
  - 链接内容：
    - Assets: Pre-IPO Equity, Private Credit, Structured Vaults
    - Infrastructure: Eligibility, Tokenization Model, NAV Pricing Framework
    - Legal: Terms of Service, Privacy Policy, Risk Disclosure, Compliance Statement, Restricted Jurisdictions
- **底部免责声明**：`text-[#5c756d] text-xs sm:text-base`，max-w-5xl
- **版权栏**：`border-t border-white/10 pt-10 flex flex-col sm:flex-row justify-between items-center`，文字色 `#5c756d`

------

## 5. 技术栈要求

Table





| 项目        | 要求                                                         |
| :---------- | :----------------------------------------------------------- |
| **CSS框架** | Tailwind CSS（通过CDN或构建工具）                            |
| **字体**    | Satoshi（Fontshare CDN）                                     |
| **图标**    | Iconify Icon Web Component（Solar图标集）                    |
| **JS依赖**  | 原生JavaScript，无需框架                                     |
| **图片**    | Unsplash外链或自托管，保持 `auto=format&fit=crop&q=80&w=600` 参数 |

------

## 6. 响应式断点检查清单

- **<< 640px (Mobile)**：
  - 所有卡片单列，全宽按钮，隐藏左右Sticky栏
  - Hero标题 `text-[40px]`，区块标题 `text-[40px]`
  - 导航折叠为Hamburger菜单（原模板未展示移动端菜单，需自行补充或隐藏导航）
  - Marquee圆形 `w-20 h-20`
- **640px - 1024px (Tablet)**：
  - 公告卡片变为2列
  - Trust卡片变为2列（6+6, 6+6）
  - 表单输入框变为2列
- **> 1024px (Desktop)**：
  - Assets区域显示左右Sticky文字栏
  - 公告4列，Trust 2×2不规则网格（6+6, 5+7）
  - 联系表单左右分栏
- **> 1280px (XL)**：
  - Assets中间卡片宽度变为 `w-[500px]`
  - 容器边距增加

------

## 7. 关键实现提醒

1. **Intersection Observer**：必须在DOM加载完成后初始化，监听 `.reveal-up` 和 `.reveal-blur`，threshold 0.15，进入后添加 `.in-view` 并停止观察。
2. **Header滚动监听**：使用 `window.addEventListener('scroll', ...)` 切换高度类。
3. **自定义Select**：必须使用原生JS实现，不能用浏览器默认 `<select>`，以保持设计一致性。
4. **Marquee**：内容必须复制一份（双份相同HTML）以实现无缝循环。
5. **SVG插图**：3张Assets卡片内的SVG是设计灵魂，必须精确保留渐变定义、阴影滤镜和浮动动画类。
6. **字体加载**：确保 `font-['Satoshi',sans-serif]` 生效，若CDN失败需有系统字体回退（如 `font-sans`）。