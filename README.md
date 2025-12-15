# Design System Manager - Figma Plugin

피그마 플러그인을 활용한 디자인 시스템 관리 도구

## 개요

이 플러그인은 Figma에서 체계적인 디자인 시스템을 쉽게 생성하고 관리할 수 있도록 도와주는 도구입니다. 색상 팔레트, 타이포그래피, 스페이싱 시스템 등 디자인 토큰을 자동으로 생성하고 관리할 수 있습니다.

## 주요 기능

### 1. 색상 시스템
- **Primary 색상**: 메인 브랜드 컬러 (10단계 shade)
- **Secondary 색상**: 보조 브랜드 컬러 (10단계 shade)
- **Neutral 색상**: 회색조 컬러 (10단계 shade)
- 각 색상은 Figma Color Style로 자동 생성

### 2. 타이포그래피 시스템
- 제목 스타일 (H1-H6)
- 본문 스타일 (Body1, Body2)
- 캡션 스타일
- 각 스타일은 Figma Text Style로 자동 생성

### 3. 스페이싱 시스템
- 4px 기반 스페이싱 시스템
- 6단계 간격 (xs: 4px ~ xxl: 48px)
- 시각적 참조 가이드 자동 생성

### 4. 디자인 토큰 내보내기
- JSON 형식으로 모든 디자인 토큰 내보내기
- 개발팀과의 협업을 위한 표준화된 토큰 포맷

## 설치 및 사용

### 개발 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/kaineus/figma-plugin.git
cd figma-plugin
```

2. 의존성 설치
```bash
npm install
```

3. 플러그인 빌드
```bash
npm run build
```

개발 모드 (자동 재빌드):
```bash
npm run dev
```

### Figma에서 플러그인 로드

1. Figma Desktop 앱 실행
2. 메뉴에서 `Plugins` > `Development` > `Import plugin from manifest...` 선택
3. 프로젝트의 `manifest.json` 파일 선택
4. 플러그인이 개발 플러그인 목록에 추가됨

### 플러그인 사용 방법

1. Figma에서 플러그인 실행: `Plugins` > `Development` > `Design System Manager`
2. 플러그인 UI에서 원하는 기능 선택:
   - **색상 팔레트 생성**: 모든 색상을 Color Style로 생성
   - **타이포그래피 생성**: 타이포그래피 Text Style 생성
   - **스페이싱 가이드 생성**: 스페이싱 참조 프레임 생성
   - **디자인 토큰 내보내기**: JSON 파일로 토큰 다운로드

## 프로젝트 구조

```
figma-plugin/
├── src/
│   ├── code.ts          # 플러그인 메인 로직
│   ├── ui.html          # 플러그인 UI 레이아웃
│   └── ui.ts            # UI 상호작용 스크립트
├── dist/                # 빌드 결과물 (자동 생성)
├── manifest.json        # Figma 플러그인 설정
├── package.json         # npm 패키지 설정
├── tsconfig.json        # TypeScript 설정
├── webpack.config.js    # 빌드 설정
└── README.md           # 프로젝트 문서
```

## 개발

### 스크립트

- `npm run build`: 프로덕션 빌드
- `npm run dev`: 개발 모드 (watch 모드)
- `npm run lint`: 코드 린팅

### 기술 스택

- **TypeScript**: 타입 안전성
- **Webpack**: 번들링
- **Figma Plugin API**: Figma 연동
- **ESLint**: 코드 품질 관리

## 커스터마이징

디자인 토큰을 커스터마이징하려면 `src/code.ts` 파일에서 다음 객체들을 수정하세요:

- `colorPalette`: 색상 정의
- `typography`: 타이포그래피 스타일
- `spacing`: 스페이싱 값

## 라이선스

MIT

## 기여

이슈나 풀 리퀘스트를 환영합니다!
