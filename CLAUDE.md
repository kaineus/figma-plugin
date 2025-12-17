# PF Design System Generator

## 프로젝트 개요

Figma 플러그인으로 디자인 시스템을 자동 생성하는 도구

**GitHub:** https://github.com/kaineus/figma-plugin

## 현재 상태 (2025-12-17)

### 완료된 작업

#### Foundations
- [x] **Variables** - 4개 Collection 구현
  - Color Primitives: 원시 색상 (50-900 스케일)
  - Color: Semantic 색상 (Light/Dark 모드, Variable Alias)
  - Size: spacing, radius
  - Typography: font-size, line-height, letter-spacing
- [x] **Typography** - Display, Heading, Body, Caption 문서화
- [x] **Color Palette** - Primary, Secondary, Success, Warning, Danger, Gray

#### Icons (82개 완료)
- [x] **10px Icons** - 7개 (Mini icons for compact UI)
- [x] **14px Icons** - 44개 (Small icons for interface elements)
- [x] **18px Icons** - 21개 (Medium icons for emphasis)
- [x] **24px Icons** - 2개 (Large icons for headers)
- [x] **Weather Icons** - 8개 (Weather condition icons)
- [x] SVG 코드 직접 포함 (외부 링크 의존성 없음)
- [x] Documentation 스타일 레이아웃 적용
- [x] Python 스크립트로 Figma API에서 자동 추출

#### Atom Components (12개 완료)
- [x] **Buttons** - Type × State × Size variants, Component Set + Documentation
- [x] **Cards** - Style (Default, Outlined, Elevated) × Size (SM, MD, LG) + Documentation
- [x] **Badges** - Type (Primary, Success, Warning, Danger, Gray) × Size + Documentation
- [x] **Inputs** - State (Default, Focus, Disabled) × Size (SM, MD, LG) + Documentation
- [x] **Checkboxes** - State (Unchecked, Checked, Disabled) × Size (SM, MD, LG) + Documentation
- [x] **Radios** - State (Unchecked, Checked, Disabled) × Size (SM, MD, LG) + Documentation
- [x] **Toggles** - State (Off, On, Disabled) × Size (SM, MD, LG) + Documentation
- [x] **Avatars** - Size variants (XS, SM, MD, LG, XL) + Documentation
- [x] **Chips** - State (Default, Active, Disabled) × Size (SM, MD, LG) + Documentation
- [x] **Dividers** - Orientation (Horizontal, Vertical) × Weight (Thin, Medium, Thick) + Documentation
- [x] **Spinners** - Size variants (XS, SM, MD, LG, XL) + Documentation
- [x] **Alerts** - Type (Info, Success, Warning, Error) + Documentation

#### 페이지 구조
- [x] 컴포넌트별 독립 페이지 (Icons, Buttons, Inputs, Checkboxes, Radios, Toggles, Cards, Badges, Avatars, Chips, Dividers, Spinners, Alerts)
- [x] Component Set 숨김 처리 (Documentation만 표시, Library publish 가능)
- [x] Icons 페이지는 Documentation 스타일로 단일 프레임 구조

#### 인프라
- [x] GitHub 저장소 연결 및 푸시
- [x] README 작성
- [x] figma-design-plugin-fresh를 .gitignore에 추가
- [x] Python 스크립트로 Figma API 아이콘 추출 자동화 (extract-icons.py)

### 다음 작업 (TODO)

#### 추가 컴포넌트 (Molecules/Organisms)
- [ ] Select, Dropdown
- [ ] Modal, Dialog
- [ ] Toast, Notification
- [ ] Tabs, Navigation
- [ ] Form 컴포넌트 조합
- [ ] Navigation Bar
- [ ] Side Menu

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

# 아이콘 추출 (Figma API에서 SVG 가져오기)
# 1. .env 파일 생성 (처음 한 번만)
cp figma-plugin/.env.example figma-plugin/.env
# 2. .env 파일에 실제 토큰 입력
# 3. python-dotenv 설치 (선택사항)
pip install python-dotenv
# 4. 아이콘 추출 실행
cd figma-plugin && python extract-icons.py

# Git 커밋 (Conventional Commits)
git commit -m "feat: description"
git commit -m "fix: description"
git commit -m "docs: description"
```

### Figma Access Token 설정

**소스 파일:** https://www.figma.com/design/dY6cJ28An8Rmkp2QpPClLr (스마트건설 세이퍼스 - 호반 용인)

**설정 방법:**
1. `.env.example`을 복사하여 `.env` 파일 생성
   ```bash
   cp figma-plugin/.env.example figma-plugin/.env
   ```
2. `.env` 파일에 실제 Figma Access Token 입력
   ```
   FIGMA_ACCESS_TOKEN=your_actual_token_here
   ```
3. (선택사항) python-dotenv 설치
   ```bash
   pip install python-dotenv
   ```

**토큰 발급:** Figma Settings → Account → Personal access tokens

**참고:**
- `.env` 파일은 `.gitignore`에 포함되어 Git에 커밋되지 않음
- `.env.example`은 템플릿 파일로 Git에 포함됨
- python-dotenv가 없어도 환경 변수로 동작 가능

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
