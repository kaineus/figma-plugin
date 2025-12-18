# PF Design System Generator

Figma 플러그인으로 디자인 시스템을 자동 생성합니다.

## Features

### Foundations
- **Variables** - Color Primitives, Semantic Colors, Size, Typography
  - Light/Dark 모드 지원
  - Variable Alias로 토큰 참조 구조
- **Typography** - Display, Heading, Body, Caption 스케일
- **Color Palette** - Primary, Secondary, Success, Warning, Danger, Gray

### Icons
- **82개 시스템 아이콘** - 5가지 사이즈 카테고리
  - 10px (7개) - Mini icons for compact UI elements
  - 14px (44개) - Small icons for buttons and interface elements
  - 18px (21개) - Medium icons for emphasis
  - 24px (2개) - Large icons for headers
  - Weather (8개) - Weather condition icons
- SVG 포맷으로 코드에 직접 포함 (외부 링크 의존성 없음)
- Documentation 스타일의 깔끔한 레이아웃
- 자동 줄바꿈 그리드 형식
- **정적 리소스**: 초기 생성 후 icons-data.json에 고정, 디자이너가 Figma에서 직접 수정 가능

### Components (Atoms) - 20개
- **Alerts** - Type (Info, Success, Warning, Error)
- **Avatars** - Size variants (XS, SM, MD, LG, XL)
- **Badges** - Type (Primary, Success, Warning, Danger, Gray) × Size
- **Buttons** - Type (Primary, Secondary, Outline, Ghost) × State × Size
- **Cards** - Style (Default, Outlined, Elevated) × Size (SM, MD, LG)
- **Checkboxes** - State (Unchecked, Checked, Disabled) × Size (SM, MD, LG)
- **Chips** - State (Default, Active, Disabled) × Size (SM, MD, LG)
- **Inputs** - State (Default, Focus, Error, Disabled) × Size (SM, MD, LG)
- **Labels** - State (Default, Required, Disabled) × Size (SM, MD, LG)
- **Links** - State (Default, Hover, Visited, Disabled) × Size (SM, MD, LG)
- **Progress** - Value (0%, 25%, 50%, 75%, 100%) × Size (SM, MD, LG)
- **Radios** - State (Unchecked, Checked, Disabled) × Size (SM, MD, LG)
- **Separators** - Orientation (Horizontal, Vertical) × Weight (Thin, Medium, Thick)
- **Skeletons** - Type (Text, Circle, Rectangle) × Size (SM, MD, LG)
- **Sliders** - Value (0%, 50%, 100%) × Size (SM, MD, LG)
- **Spinners** - Size variants (SM, MD, LG, XL)
- **Switches** - State (Off, On, Disabled) × Size (SM, MD, LG)
- **Textareas** - State (Default, Focus, Error, Disabled) × Size (SM, MD, LG)
- **Toggles** - Options (2, 3) × Size (SM, MD, LG) - Segmented controls

### Design Token Structure

```
Color Primitives (50-900)
    ↓ alias
Semantic Colors (bg/*, text/*, border/*)
    ↓ bind
Components
```

## Installation

### 1. Dependencies 설치

```bash
cd figma-plugin
npm install
```

### 2. 빌드

```bash
npm run build
```

### 3. Figma에서 플러그인 로드

1. Figma Desktop 실행
2. Menu → Plugins → Development → Import plugin from manifest...
3. `figma-plugin/manifest.json` 선택
4. Plugins → Development → PF Design System Generator 실행

## Usage

1. 플러그인 실행
2. Primary/Secondary 색상 선택
3. 개별 컴포넌트 생성 또는 전체 생성:
   - **1. Foundations** - 페이지 구조, Variables, Typography, Color Palette 생성
   - **3. Icons** - 82개 시스템 아이콘 생성 (10px~24px, Weather)
   - **5. Components - Display** - 20개 Atoms 컴포넌트 (알파벳 순 정렬)
     - Alerts, Avatars, Badges, Buttons, Cards, Checkboxes, Chips
     - Inputs, Labels, Links, Progress, Radios, Separators, Skeletons, Sliders
     - Spinners, Switches, Textareas, Toggles
   - **6. Components - Layout** - Separators, Spinners, Alerts
4. 또는 **전체 디자인 시스템 생성** 클릭 (모든 Foundations + Icons + 20개 Atoms)

각 컴포넌트는 Component Set(숨김)과 Documentation Frame으로 구성되며, Library로 publish하면 정상적으로 사용 가능합니다.

## Project Structure

```
figma-plugin/
├── manifest.json      # 플러그인 메타데이터
├── code.ts            # 플러그인 메인 코드
├── ui.html            # 플러그인 UI
├── icons-data.json    # 82개 아이콘 SVG 데이터 (정적 리소스)
├── icons-data.ts      # 아이콘 데이터 TypeScript
├── package.json
├── tsconfig.json
└── dist/
    └── code.js        # 빌드 출력

archive/
└── extract-icons.py   # 아이콘 추출 스크립트 (초기 생성 시 사용, 참고용 보관)
```

## Development

### Watch 모드

```bash
npm run watch
```

### 주요 함수

| 함수 | 설명 |
|------|------|
| `createPages()` | 페이지 구조 생성 (Cover, Foundations, Icons, 12개 컴포넌트 페이지, Templates, Playground) |
| `createVariables()` | Variable Collections 생성 |
| `createTypography()` | Typography 문서화 |
| `createColors()` | Color Palette 문서화 |
| `createButtons()` | Button 컴포넌트 생성 |
| `createInputs()` | Input 컴포넌트 생성 |
| `createCheckboxes()` | Checkbox 컴포넌트 생성 |
| `createRadios()` | Radio 컴포넌트 생성 |
| `createToggles()` | Toggle 컴포넌트 생성 |
| `createCards()` | Card 컴포넌트 생성 |
| `createBadges()` | Badge 컴포넌트 생성 |
| `createAvatars()` | Avatar 컴포넌트 생성 |
| `createChips()` | Chip 컴포넌트 생성 |
| `createDividers()` | Divider 컴포넌트 생성 |
| `createSpinners()` | Spinner 컴포넌트 생성 |
| `createAlerts()` | Alert 컴포넌트 생성 |

## Variable Collections

### Color Primitives
원시 색상값 (50-900 스케일)
- `primary/50` ~ `primary/900`
- `secondary/50` ~ `secondary/900`
- `success/50` ~ `success/900`
- `warning/50` ~ `warning/900`
- `danger/50` ~ `danger/900`
- `gray/50` ~ `gray/900`

### Color (Semantic)
기능별 색상 (Light/Dark 모드)
- `bg/primary`, `bg/secondary`, `bg/brand`, `bg/brand-solid`
- `text/primary`, `text/secondary`, `text/brand`
- `border/default`, `border/brand`
- Success, Warning, Danger 계열

### Size
- `space/1` ~ `space/12`, `space/05`
- `radius/sm`, `radius/md`, `radius/lg`, `radius/full`

### Typography
- `font-size/xs` ~ `font-size/4xl`
- `line-height/tight`, `line-height/normal`, `line-height/relaxed`
- `letter-spacing/tight`, `letter-spacing/normal`, `letter-spacing/wide`

## Tech Stack

- TypeScript
- Figma Plugin API
- esbuild

## License

MIT
