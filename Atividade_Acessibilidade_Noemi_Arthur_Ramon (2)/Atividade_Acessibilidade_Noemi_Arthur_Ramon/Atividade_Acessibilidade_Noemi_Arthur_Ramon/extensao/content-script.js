(() => {
  if (document.querySelector('#a11y-ext-host')) {
    return;
  }

  const state = {
    guiaLeitura: false,
    fonteDislexia: false,
    modoFoco: false,
    espacamento: false,
    confortoVisual: false,
    leitorVoz: false,
    semAnimacoes: false,
    leituraBionica: false
  };

  const host = document.createElement('div');
  host.id = 'a11y-ext-host';
  const shadow = host.attachShadow({ mode: 'open' });

  shadow.innerHTML = `
    <style>
      :host {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 2147483647;
        font-family: Arial, sans-serif;
      }

      .toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 62px;
        height: 62px;
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, #1d4ed8, #3b82f6);
        color: #fff;
        font-weight: 800;
        letter-spacing: 0.08em;
        box-shadow: 0 12px 32px rgba(29, 78, 216, 0.38);
        cursor: pointer;
      }

      .panel {
        position: absolute;
        right: 0;
        bottom: 78px;
        width: min(360px, calc(100vw - 32px));
        background: rgba(255,255,255,0.98);
        border: 1px solid rgba(148,163,184,0.9);
        border-radius: 18px;
        box-shadow: 0 18px 48px rgba(15,23,42,0.2);
        padding: 1rem;
      }

      .panel[hidden] {
        display: none;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 0.5rem;
      }

      .panel-header h2 {
        margin: 0;
        font-size: 1.05rem;
      }

      .close-btn {
        border: none;
        border-radius: 999px;
        width: 32px;
        height: 32px;
        background: #e2e8f0;
        color: #0f172a;
        font-size: 1.3rem;
        cursor: pointer;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 8px;
        margin: 0.75rem 0 1rem;
      }

      .feature {
        border: 2px solid #1d4ed8;
        background: white;
        color: #1d4ed8;
        border-radius: 10px;
        padding: 0.75rem 0.5rem;
        font-weight: 700;
        cursor: pointer;
      }

      .feature.active {
        background: #1d4ed8;
        color: white;
      }

      .reset-btn {
        width: 100%;
        border: none;
        border-radius: 8px;
        background: #ef4444;
        color: white;
        padding: 0.8rem 1rem;
        font-weight: 700;
        cursor: pointer;
      }

      .regua-overlay {
        position: fixed;
        left: 0;
        width: 100vw;
        height: 42px;
        background: rgba(253, 224, 71, 0.35);
        border-top: 2px solid #ca8a04;
        border-bottom: 2px solid #ca8a04;
        pointer-events: none;
        display: none;
        z-index: 2147483646;
      }

      .regua-overlay.ativa {
        display: block;
      }
    </style>

    <button class="toggle" type="button" aria-expanded="false">A11y</button>
    <div class="panel" hidden>
      <div class="panel-header">
        <h2>Painel de Acessibilidade</h2>
        <button class="close-btn" type="button" aria-label="Fechar painel">×</button>
      </div>
      <div class="feature-grid">
        <button class="feature" type="button" data-key="guiaLeitura">1. Régua</button>
        <button class="feature" type="button" data-key="fonteDislexia">2. Fonte</button>
        <button class="feature" type="button" data-key="modoFoco">3. Foco</button>
        <button class="feature" type="button" data-key="espacamento">4. Espaço</button>
        <button class="feature" type="button" data-key="confortoVisual">5. Visual</button>
        <button class="feature" type="button" data-key="leitorVoz">6. Voz</button>
        <button class="feature" type="button" data-key="semAnimacoes">7. Sem animação</button>
        <button class="feature" type="button" data-key="leituraBionica">8. Biónica</button>
      </div>
      <button class="reset-btn" type="button">Restaurar padrão</button>
    </div>
    <div class="regua-overlay" aria-hidden="true"></div>
  `;

  document.body.appendChild(host);

  const toggleButton = shadow.querySelector('.toggle');
  const panel = shadow.querySelector('.panel');
  const closeButton = shadow.querySelector('.close-btn');
  const regua = shadow.querySelector('.regua-overlay');
  const featureButtons = [...shadow.querySelectorAll('.feature')];
  const resetButton = shadow.querySelector('.reset-btn');

  function setPanelVisible(visible) {
    panel.hidden = !visible;
    toggleButton.setAttribute('aria-expanded', String(visible));
  }

  function falarTexto(texto) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  }

  function aplicarLeituraBionica(ativar) {
    const blocos = document.querySelectorAll('p, li, blockquote, td, th, span');

    blocos.forEach((bloco) => {
      if (ativar) {
        if (!bloco.dataset.originalHtml) {
          bloco.dataset.originalHtml = bloco.innerHTML;
        }

        const palavras = bloco.innerText.split(/\s+/);
        const textoBionico = palavras.map((palavra) => {
          if (!palavra || palavra.length <= 3) {
            return `<b>${palavra || ''}</b>`;
          }
          const metade = Math.ceil(palavra.length / 2);
          return `<b style="font-weight: 800; color: #1d4ed8;">${palavra.slice(0, metade)}</b>${palavra.slice(metade)}`;
        }).join(' ');

        bloco.innerHTML = textoBionico;
      } else if (bloco.dataset.originalHtml) {
        bloco.innerHTML = bloco.dataset.originalHtml;
      }
    });
  }

  function aplicarEstado(recurso, ativo) {
    state[recurso] = ativo;
    const body = document.body || document.documentElement;

    switch (recurso) {
      case 'guiaLeitura':
        regua.classList.toggle('ativa', ativo);
        break;
      case 'fonteDislexia':
        body.style.fontFamily = ativo ? 'OpenDyslexic, sans-serif' : '';
        break;
      case 'modoFoco':
        body.style.filter = ativo ? 'saturate(0.7) contrast(1.05)' : '';
        break;
      case 'espacamento':
        body.style.lineHeight = ativo ? '2.1' : '';
        body.style.letterSpacing = ativo ? '0.08em' : '';
        body.style.wordSpacing = ativo ? '0.18em' : '';
        break;
      case 'confortoVisual':
        body.style.backgroundColor = ativo ? '#fef9c3' : '';
        body.style.color = ativo ? '#1c1917' : '';
        break;
      case 'semAnimacoes':
        body.style.transition = ativo ? 'none' : '';
        body.style.animation = ativo ? 'none' : '';
        break;
      case 'leituraBionica':
        aplicarLeituraBionica(ativo);
        break;
      default:
        break;
    }

    const button = featureButtons.find((item) => item.dataset.key === recurso);
    if (button) {
      button.classList.toggle('active', ativo);
    }
  }

  toggleButton.addEventListener('click', () => {
    const visible = panel.hidden;
    setPanelVisible(visible);
  });

  closeButton.addEventListener('click', () => setPanelVisible(false));

  featureButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.key;
      aplicarEstado(key, !state[key]);
    });
  });

  resetButton.addEventListener('click', () => {
    Object.keys(state).forEach((key) => {
      if (state[key]) {
        aplicarEstado(key, false);
      }
    });

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPanelVisible(false);
  });

  window.addEventListener('mousemove', (event) => {
    if (state.guiaLeitura) {
      regua.style.top = `${event.clientY - 20}px`;
    }
  });

  document.addEventListener('click', (event) => {
    const alvo = event.target.closest('p, li, h1, h2, h3, h4, h5, h6, span, td, th');

    if (state.leitorVoz && alvo) {
      const texto = alvo.innerText.trim();
      if (texto) {
        falarTexto(texto);
      }
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'toggleA11yPanel') {
      const visible = panel.hidden;
      setPanelVisible(visible);
      sendResponse({ ok: true });
    }

    if (message?.type === 'resetA11yPanel') {
      Object.keys(state).forEach((key) => {
        if (state[key]) {
          aplicarEstado(key, false);
        }
      });
      setPanelVisible(false);
      sendResponse({ ok: true });
    }
  });
})();
