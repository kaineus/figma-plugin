# PF Design System Generator

Figma 플러그인으로 디자인 시스템을 자동 생성합니다.

## Features

### Foundations
- **Variables** - Color Primitives, Semantic Colors, Size, Typography
  - Light/Dark 모드 지원
  - Variable Alias로 토큰 참조 구조
- **Typography** - Display, Heading, Body, Caption 스케일
- **Color Palette** - Primary, Secondary, Success, Warning, Danger, Gray

### Components
- **Buttons** - Type (Primary, Secondary, Outline, Ghost) × State × Size
- **Cards** - Style (Default, Outlined, Elevated) × Size (SM, MD, LG)
- **Badges** - Type (Primary, Success, Warning, Danger, Gray) × Size

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
3. 버튼 클릭:
   - **페이지 구조 생성** - Cover, Foundations, Components 페이지
   - **Variables 생성** - 4개 Collection (Color Primitives, Color, Size, Typography)
   - **Typography 생성** - 타이포그래피 스케일 문서화
   - **Color Palette 생성** - 색상 팔레트 문서화
   - **Buttons/Cards/Badges 생성** - 컴포넌트 생성
4. 또는 **전체 디자인 시스템 생성** 클릭

## Project Structure

```
figma-plugin/
├── manifest.json      # 플러그인 메타데이터
├── code.ts            # 플러그인 메인 코드
├── ui.html            # 플러그인 UI
├── package.json
├── tsconfig.json
└── dist/
    └── code.js        # 빌드 출력
```

## Development

### Watch 모드

```bash
npm run watch
```

### 주요 함수

| 함수 | 설명 |
|------|------|
| `createPages()` | 페이지 구조 생성 |
| `createVariables()` | Variable Collections 생성 |
| `createTypography()` | Typography 문서화 |
| `createColors()` | Color Palette 문서화 |
| `createButtons()` | Button 컴포넌트 생성 |
| `createCards()` | Card 컴포넌트 생성 |
| `createBadges()` | Badge 컴포넌트 생성 |

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
