# PF Design System Generator

## 프로젝트 개요

Figma 플러그인으로 디자인 시스템을 자동 생성하는 도구

**GitHub:** https://github.com/kaineus/figma-plugin

## 현재 상태 (2024-12-15)

### 완료된 작업

#### Foundations
- [x] **Variables** - 4개 Collection 구현
  - Color Primitives: 원시 색상 (50-900 스케일)
  - Color: Semantic 색상 (Light/Dark 모드, Variable Alias)
  - Size: spacing, radius
  - Typography: font-size, line-height, letter-spacing
- [x] **Typography** - Display, Heading, Body, Caption 문서화
- [x] **Color Palette** - Primary, Secondary, Success, Warning, Danger, Gray

#### Components
- [x] **Buttons** - Type × State × Size variants, Component Set
- [x] **Cards** - Style (Default, Outlined, Elevated) × Size (SM, MD, LG)
- [x] **Badges** - Type (Primary, Success, Warning, Danger, Gray) × Size

#### 인프라
- [x] GitHub 저장소 연결 및 푸시
- [x] README 작성

### 다음 작업 (TODO)

#### 추가 컴포넌트
- [ ] Inputs (Text, Password, Search)
- [ ] Checkbox, Radio, Toggle
- [ ] Select, Dropdown
- [ ] Modal, Dialog
- [ ] Toast, Notification
- [ ] Tabs, Navigation

#### 개선 사항
- [ ] `bg/brand-subtle`, `bg/tertiary` Variable 추가 (코드에서 참조하지만 미생성)
- [ ] `createBadges`에 Bold, Regular 폰트 로드 추가
- [ ] 컴포넌트에 Variable 바인딩 강화

#### MCP 연동 (Phase 2)
- [ ] MCP Server 구현
- [ ] Claude ↔ Figma Plugin 실시간 통신
- [ ] 프롬프트 기반 디자인 생성

## 프로젝트 구조

```
FIGMA_MCP/
├── CLAUDE.md                 # 프로젝트 문서 (이 파일)
├── README.md                 # GitHub README
├── .gitignore
└── figma-plugin/
    ├── manifest.json         # 플러그인 메타데이터
    ├── code.ts               # 플러그인 메인 코드 (~1200줄)
    ├── ui.html               # 플러그인 UI
    ├── package.json
    ├── tsconfig.json
    └── dist/
        └── code.js           # 빌드 출력 (43kb)
```

## 핵심 코드 구조 (code.ts)

### 주요 함수

| 함수 | 설명 | 라인 |
|------|------|------|
| `createPages()` | 페이지 구조 생성 | ~60 |
| `createVariables()` | Variable Collections 생성 | ~100-400 |
| `createTypography()` | Typography 문서화 | ~400-550 |
| `createColors()` | Color Palette 문서화 | ~550-680 |
| `createButtons()` | Button 컴포넌트 생성 | ~680-870 |
| `createCards()` | Card 컴포넌트 생성 | ~870-1020 |
| `createBadges()` | Badge 컴포넌트 생성 | ~1020-1180 |

### Variable 헬퍼 함수

```typescript
// Variable 찾기
function findVariable(name: string): Variable | null

// Fill에 Variable 적용
function applyVariableToFill(node, variableName, fallbackColor): void

// Stroke에 Variable 적용
function applyVariableToStroke(node, variableName, fallbackColor): void
```

### Design Token 구조

```
Color Primitives (50-900)
    ↓ VARIABLE_ALIAS
Color (Semantic - bg/*, text/*, border/*)
    ↓ setBoundVariableForPaint
Components
```

**Semantic Color 매핑 규칙:**
- `bg/*` → 밝은 톤 (예: primary/50)
- `border/*` → 중간 톤 (예: primary/500)
- `text/*` → 어두운 톤 (예: primary/700)
- `*-solid` → 채워진 배경 (예: primary/500)

## 개발 명령어

```bash
# 빌드
cd figma-plugin && npm run build

# Watch 모드
cd figma-plugin && npm run watch

# Git 커밋 (Conventional Commits)
git commit -m "feat: description"
git commit -m "fix: description"
git commit -m "docs: description"
```

## Figma에서 테스트

1. Figma Desktop 실행
2. Menu → Plugins → Development → Import plugin from manifest...
3. `figma-plugin/manifest.json` 선택
4. Plugins → Development → PF Design System Generator 실행
5. Variables 먼저 생성 → 컴포넌트 생성

## 참조

### Simple Design System (Community)
- **URL:** https://www.figma.com/design/vTN7EhiXreOi6Dc8DGubuW/Simple-Design-System--Community-
- 참고용 디자인 시스템 (페이지 구조, 컴포넌트 레이아웃)

### 글로벌 스킬스
- `~/.claude/skills/github-pr-workflow` - Git 커밋/PR 워크플로우
- `~/.claude/skills/github-issue-manager` - GitHub 이슈 생성

## 알려진 이슈

1. **Missing Variables**: `bg/brand-subtle`, `bg/tertiary`가 코드에서 참조되지만 `createVariables()`에서 생성되지 않음 → fallback 색상 사용됨
2. **Font Load**: `createBadges()`에서 Bold, Regular 폰트 미로드 → 문서 섹션 생성 시 에러 가능
