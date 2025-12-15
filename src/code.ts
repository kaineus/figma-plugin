// Design System 관리를 위한 Figma 플러그인 메인 코드

// 디자인 시스템 색상 팔레트
const colorPalette = {
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1'
  },
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0',
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C'
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  }
};

// 타이포그래피 스타일
const typography = {
  h1: { fontSize: 48, fontWeight: 700, lineHeight: 56 },
  h2: { fontSize: 40, fontWeight: 700, lineHeight: 48 },
  h3: { fontSize: 32, fontWeight: 600, lineHeight: 40 },
  h4: { fontSize: 24, fontWeight: 600, lineHeight: 32 },
  h5: { fontSize: 20, fontWeight: 600, lineHeight: 28 },
  h6: { fontSize: 16, fontWeight: 600, lineHeight: 24 },
  body1: { fontSize: 16, fontWeight: 400, lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: 400, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: 400, lineHeight: 16 }
};

// 스페이싱 시스템
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// UI 표시
figma.showUI(__html__, { width: 400, height: 600 });

// 메시지 핸들러
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-color-palette') {
    await createColorStyles();
    figma.notify('색상 팔레트가 생성되었습니다.');
  }

  if (msg.type === 'create-typography') {
    await createTypographyStyles();
    figma.notify('타이포그래피 스타일이 생성되었습니다.');
  }

  if (msg.type === 'create-spacing-frame') {
    createSpacingReference();
    figma.notify('스페이싱 가이드가 생성되었습니다.');
  }

  if (msg.type === 'export-tokens') {
    const tokens = exportDesignTokens();
    figma.ui.postMessage({ type: 'tokens-exported', tokens });
  }

  if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// 색상 스타일 생성
async function createColorStyles() {
  for (const [category, shades] of Object.entries(colorPalette)) {
    for (const [shade, hex] of Object.entries(shades)) {
      const style = figma.createPaintStyle();
      style.name = `${category}/${shade}`;
      
      const rgb = hexToRgb(hex);
      style.paints = [{
        type: 'SOLID',
        color: { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 }
      }];
    }
  }
}

// 타이포그래피 스타일 생성
async function createTypographyStyles() {
  for (const [name, style] of Object.entries(typography)) {
    const textStyle = figma.createTextStyle();
    textStyle.name = `Typography/${name}`;
    textStyle.fontSize = style.fontSize;
    textStyle.lineHeight = { value: style.lineHeight, unit: 'PIXELS' };
    
    // fontWeight는 폰트 패밀리에 따라 다르므로 기본값 사용
  }
}

// 스페이싱 참조 프레임 생성
function createSpacingReference() {
  const frame = figma.createFrame();
  frame.name = 'Spacing Reference';
  frame.resize(600, 400);
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  let yOffset = 20;
  for (const [name, value] of Object.entries(spacing)) {
    const rect = figma.createRectangle();
    rect.resize(value, value);
    rect.x = 20;
    rect.y = yOffset;
    rect.fills = [{ type: 'SOLID', color: { r: 0.13, g: 0.59, b: 0.95 } }];
    
    const text = figma.createText();
    text.x = value + 40;
    text.y = yOffset;
    text.characters = `${name}: ${value}px`;
    
    frame.appendChild(rect);
    frame.appendChild(text);
    
    yOffset += value + 20;
  }

  figma.currentPage.appendChild(frame);
  figma.viewport.scrollAndZoomIntoView([frame]);
}

// 디자인 토큰 내보내기
function exportDesignTokens() {
  return {
    colors: colorPalette,
    typography: typography,
    spacing: spacing
  };
}

// Hex를 RGB로 변환하는 헬퍼 함수
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}
