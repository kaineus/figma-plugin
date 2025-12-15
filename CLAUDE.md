# Figma MCP Project

## 프로젝트 목표

MCP(Model Context Protocol)를 활용하여 Claude가 프롬프트 기반으로 Figma에 직접 디자인할 수 있는 시스템 구축

## 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐     ┌─────────┐
│   사용자     │     │   Claude    │     │ PLX_FIGMA_PLUGIN │     │  Figma  │
│  프롬프트    │ ──▶ │             │ ──▶ │   (MCP Server)   │ ──▶ │   API   │
└─────────────┘     └─────────────┘     └──────────────────┘     └─────────┘
```

## 핵심 컴포넌트

### 1. PLX_FIGMA_PLUGIN (MCP Server)
- Figma Plugin 형태로 동작
- MCP 프로토콜을 통해 Claude와 통신
- Figma Plugin API를 사용하여 디자인 생성/수정
- 디자인 시스템 규칙 적용

### 2. MCP Tools (예상)
- `create_frame` - 프레임/아트보드 생성
- `create_component` - 컴포넌트 생성
- `apply_style` - 스타일 적용
- `get_design_tokens` - 디자인 토큰 조회
- `place_component` - 기존 컴포넌트 배치

### 3. 디자인 시스템 연동
- 참조 디자인 시스템의 컴포넌트 활용
- 디자인 토큰(색상, 타이포, 스페이싱) 자동 적용
- 일관된 디자인 규칙 유지

## 참조 Figma 파일

### Simple Design System (Community)
- **File Key:** `vTN7EhiXreOi6Dc8DGubuW`
- **URL:** https://www.figma.com/design/vTN7EhiXreOi6Dc8DGubuW/Simple-Design-System--Community-

#### 페이지 구조
| 카테고리 | 페이지 |
|---------|--------|
| 기본 | Cover, Foundations, Icons |
| 가이드 | Examples, Composition guide |
| 컴포넌트 | Accordion, AI Chat, Avatars, Buttons, Calendar, Cards, Dialog, Inputs, Menu, Navigation, Notification, Pagination, Tabs, Tags, Text, Tooltip |
| 템플릿 | Forms, Sections |
| 기타 | Utilities, Component Playground |

## Figma API 사용법

### 인증
```bash
curl -H "X-Figma-Token: <ACCESS_TOKEN>" "https://api.figma.com/v1/files/<FILE_KEY>"
```

### 주요 엔드포인트
- `GET /v1/files/:key` - 파일 전체 조회
- `GET /v1/files/:key/nodes?ids=:ids` - 특정 노드 조회
- `GET /v1/files/:key/components` - 컴포넌트 목록
- `GET /v1/files/:key/styles` - 스타일 목록
- `GET /v1/files/:key/variables/local` - 로컬 변수 조회

## 프로젝트 구조

```
PLX_FIGMA_PLUGIN/
├── package.json              # 프로젝트 설정 및 의존성
├── tsconfig.json             # TypeScript 설정
├── tsconfig.server.json      # MCP Server용 TypeScript 설정
├── CLAUDE.md                 # 프로젝트 문서
├── plugin/                   # Figma Plugin
│   ├── manifest.json         # 플러그인 메타데이터
│   ├── code.ts               # 플러그인 메인 코드 (Figma API)
│   ├── ui.html               # 플러그인 UI (WebSocket 클라이언트)
│   └── dist/                 # 빌드 출력
│       └── code.js
└── server/                   # MCP Server
    └── index.ts              # MCP Server + WebSocket Server
```

## 개발 환경

- **작업 디렉토리:** `C:\DEV\CLAUDE\FIGMA_MCP`
- **플랫폼:** Windows
- **Node.js:** >= 18.0.0

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 플러그인 빌드
```bash
npm run build:plugin
```

### 3. MCP Server 실행
```bash
npm run dev:server
```

### 4. Figma에서 플러그인 로드
1. Figma Desktop 앱 실행
2. Menu > Plugins > Development > Import plugin from manifest...
3. `plugin/manifest.json` 선택
4. Plugins > Development > PLX Figma Plugin 실행

## MCP Server 설정

Claude Desktop의 `claude_desktop_config.json`에 추가:

```json
{
  "mcpServers": {
    "plx-figma": {
      "command": "node",
      "args": ["C:\\DEV\\CLAUDE\\FIGMA_MCP\\dist\\server\\index.js"]
    }
  }
}
```

## MCP Tools (구현됨)

| Tool | 설명 |
|------|------|
| `check_connection` | Figma Plugin 연결 상태 확인 |
| `create_frame` | 프레임(아트보드) 생성 |
| `create_rectangle` | 사각형 도형 생성 |
| `create_text` | 텍스트 요소 생성 |
| `get_selection` | 현재 선택된 요소 조회 |
| `get_current_page` | 현재 페이지 정보 조회 |

## TODO

### Phase 1: PLX_FIGMA_PLUGIN 개발
- [x] Figma Plugin 프로젝트 초기 설정
- [x] MCP Server 프로토콜 구현
- [x] 기본 MCP Tools 구현 (create_frame, create_rectangle, create_text)
- [ ] npm install 및 빌드 테스트
- [ ] Figma에서 플러그인 테스트

### Phase 2: 디자인 시스템 연동
- [ ] 디자인 토큰 추출 및 매핑
- [ ] 컴포넌트 라이브러리 연동
- [ ] 스타일 자동 적용 로직

### Phase 3: 고급 기능
- [ ] 프롬프트 기반 레이아웃 생성
- [ ] 디자인 시스템 문서 자동 생성
- [ ] Skills 개발 (재사용 가능한 디자인 패턴)
