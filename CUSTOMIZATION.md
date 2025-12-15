# 커스터마이징 가이드

## 색상 팔레트 수정

`src/code.ts` 파일의 `colorPalette` 객체를 수정하여 브랜드 색상으로 변경할 수 있습니다:

```typescript
const colorPalette = {
  primary: {
    50: '#YOUR_COLOR_HEX',
    100: '#YOUR_COLOR_HEX',
    // ... 더 많은 shade
  },
  // 새로운 색상 카테고리 추가 가능
  accent: {
    500: '#FF5722',
    // ...
  }
};
```

## 타이포그래피 시스템 수정

타이포그래피 스타일을 프로젝트에 맞게 조정:

```typescript
const typography = {
  // 제목 스타일 수정
  h1: { fontSize: 64, fontWeight: 800, lineHeight: 72 },
  
  // 새로운 스타일 추가
  subtitle: { fontSize: 18, fontWeight: 500, lineHeight: 26 },
};
```

## 스페이싱 시스템 수정

4px 대신 8px 기반 시스템 사용 예시:

```typescript
const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64
};
```

## 새로운 기능 추가하기

### 1. 새로운 UI 버튼 추가

`src/ui.html`에 버튼 추가:

```html
<button id="my-new-feature" class="button">새 기능</button>
```

### 2. 이벤트 핸들러 추가

`src/ui.ts`에 이벤트 리스너 추가:

```typescript
document.getElementById('my-new-feature')?.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'my-new-feature' } }, '*');
});
```

### 3. 플러그인 로직 구현

`src/code.ts`에 메시지 핸들러 추가:

```typescript
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'my-new-feature') {
    // 기능 구현
    await myNewFeature();
    figma.notify('작업이 완료되었습니다!');
  }
};

async function myNewFeature() {
  // 구현 내용
}
```

## 개발 워크플로우

1. 코드 수정
2. 빌드 실행: `npm run dev` (자동 watch 모드)
3. Figma에서 플러그인 재실행으로 변경사항 테스트
4. 만족스러우면 최종 빌드: `npm run build`

## 유용한 Figma API 참고사항

### 노드 생성
- `figma.createRectangle()` - 사각형
- `figma.createText()` - 텍스트
- `figma.createFrame()` - 프레임
- `figma.createComponent()` - 컴포넌트

### 스타일 생성
- `figma.createPaintStyle()` - 색상 스타일
- `figma.createTextStyle()` - 텍스트 스타일
- `figma.createEffectStyle()` - 이펙트 스타일

### 폰트 로딩
텍스트를 사용하기 전 반드시 폰트 로드:
```typescript
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
```

## 디버깅 팁

1. `console.log()` 사용 - Figma Desktop의 개발자 도구에서 확인
2. `figma.notify()` 사용 - 사용자에게 메시지 표시
3. TypeScript 에러 주의 - 빌드 시 타입 체크 활용

## 배포

플러그인을 Figma Community에 배포하려면:

1. 프로덕션 빌드: `npm run build`
2. Figma에서 플러그인 설정 > Publish 선택
3. 설명, 스크린샷, 태그 등 추가
4. 심사 제출

## 문의 및 지원

문제가 발생하면 GitHub Issues를 통해 제보해주세요.
