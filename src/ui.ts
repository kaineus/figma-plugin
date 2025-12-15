// UI 상호작용 처리

document.getElementById('create-colors')?.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'create-color-palette' } }, '*');
});

document.getElementById('create-typography')?.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'create-typography' } }, '*');
});

document.getElementById('create-spacing')?.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'create-spacing-frame' } }, '*');
});

document.getElementById('export-tokens')?.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'export-tokens' } }, '*');
});

// 플러그인으로부터 메시지 수신
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  
  if (msg.type === 'tokens-exported') {
    // JSON 파일로 다운로드
    const dataStr = JSON.stringify(msg.tokens, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'design-tokens.json';
    link.click();
    URL.revokeObjectURL(url);
  }
};
