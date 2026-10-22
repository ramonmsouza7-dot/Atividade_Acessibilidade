const enviarMensagem = async (tipo) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || typeof tab.id !== 'number') {
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: tipo }, () => {
    if (chrome.runtime.lastError) {
      console.warn('Mensagem sem resposta:', chrome.runtime.lastError.message);
    }
  });
};

document.getElementById('toggle-panel').addEventListener('click', () => {
  enviarMensagem('toggleA11yPanel');
});

document.getElementById('reset-panel').addEventListener('click', () => {
  enviarMensagem('resetA11yPanel');
});
