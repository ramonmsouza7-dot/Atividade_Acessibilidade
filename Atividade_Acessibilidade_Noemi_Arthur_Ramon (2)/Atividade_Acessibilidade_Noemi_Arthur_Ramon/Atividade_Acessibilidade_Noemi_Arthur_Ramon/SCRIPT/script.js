const estadoRecursos = {
  guiaLeitura: false,
  fonteDislexia: false,
  modoFoco: false,
  espacamento: false,
  confortoVisual: false,
  leitorVoz: false,
  semAnimacoes: false,
  leituraBionica: false
};

const classesRecursos = {
  guiaLeitura: 'regua-ativa',
  fonteDislexia: 'fonte-dislexia-ativa',
  modoFoco: 'modo-foco-ativo',
  espacamento: 'espacamento-ativo',
  confortoVisual: 'conforto-visual-ativo',
  semAnimacoes: 'sem-animacoes-ativas'
};

const mapaBotoes = {
  guiaLeitura: 'btn-recurso-1',
  fonteDislexia: 'btn-recurso-2',
  modoFoco: 'btn-recurso-3',
  espacamento: 'btn-recurso-4',
  confortoVisual: 'btn-recurso-5',
  leitorVoz: 'btn-recurso-6',
  semAnimacoes: 'btn-recurso-7',
  leituraBionica: 'btn-recurso-8'
};

function criarWidgetA11y() {
  let toggle = document.getElementById('a11y-toggle');
  let painel = document.getElementById('painel');

  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'a11y-toggle';
    toggle.type = 'button';
    toggle.className = 'a11y-floating-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'painel');
    toggle.textContent = 'A11y';
    document.body.appendChild(toggle);
  }

  if (!painel) {
    painel = document.createElement('div');
    painel.id = 'painel';
    painel.className = 'a11y-panel';
    painel.setAttribute('aria-live', 'polite');
    painel.hidden = true;
    painel.innerHTML = `
      <div class="a11y-panel-header">
        <h2>Painel de Acessibilidade</h2>
        <button type="button" class="a11y-close" aria-label="Fechar painel">×</button>
      </div>
      <p>Ative ou desative os recursos de leitura e foco de forma instantânea.</p>
      <div class="controls-grid">
        <button id="btn-recurso-1" class="btn-feature" type="button" onclick="alternarRecurso('guiaLeitura')">1. Régua de Leitura</button>
        <button id="btn-recurso-2" class="btn-feature" type="button" onclick="alternarRecurso('fonteDislexia')">2. Fonte para Dislexia</button>
        <button id="btn-recurso-3" class="btn-feature" type="button" onclick="alternarRecurso('modoFoco')">3. Modo Foco TDAH</button>
        <button id="btn-recurso-4" class="btn-feature" type="button" onclick="alternarRecurso('espacamento')">4. Aumentar Espaçamento</button>
        <button id="btn-recurso-5" class="btn-feature" type="button" onclick="alternarRecurso('confortoVisual')">5. Conforto Visual</button>
        <button id="btn-recurso-6" class="btn-feature" type="button" onclick="alternarRecurso('leitorVoz')">6. Leitor de Voz</button>
        <button id="btn-recurso-7" class="btn-feature" type="button" onclick="alternarRecurso('semAnimacoes')">7. Sem Animações</button>
        <button id="btn-recurso-8" class="btn-feature" type="button" onclick="alternarRecurso('leituraBionica')">8. Leitura Biónica</button>
      </div>
      <button id="btn-reset" type="button" onclick="restaurarPadrao()">Restaurar Configurações Originais</button>
    `;
    document.body.appendChild(painel);
  }

  return { toggle, painel };
}

function abrirPainel() {
  const { painel, toggle } = criarWidgetA11y();
  if (!painel || !toggle) return;

  painel.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
}

function fecharPainel() {
  const { painel, toggle } = criarWidgetA11y();
  if (!painel || !toggle) return;

  painel.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
}

function alternarPainel() {
  const { painel, toggle } = criarWidgetA11y();
  if (!painel || !toggle) return;

  const abrir = painel.hidden;
  painel.hidden = !abrir;
  toggle.setAttribute('aria-expanded', String(abrir));
}

function alternarRecurso(recursoKey) {
  estadoRecursos[recursoKey] = !estadoRecursos[recursoKey];
  const estaAtivo = estadoRecursos[recursoKey];

  if (classesRecursos[recursoKey]) {
    document.body.classList.toggle(classesRecursos[recursoKey], estaAtivo);
  }

  const btn = document.getElementById(mapaBotoes[recursoKey]);
  if (btn) {
    btn.classList.toggle('ativo', estaAtivo);
  }

  if (recursoKey === 'leitorVoz') {
    if (estaAtivo) {
      falarTexto('Leitor de voz ativado. Passe o mouse ou clique em um parágrafo para ouvir.');
    } else {
      window.speechSynthesis.cancel();
    }
  }

  if (recursoKey === 'leituraBionica') {
    aplicarLeituraBionica(estaAtivo);
  }
}

window.addEventListener('mousemove', (e) => {
  if (estadoRecursos.guiaLeitura) {
    const regua = document.getElementById('regua-leitura');
    if (regua) {
      regua.style.top = `${e.clientY - 20}px`;
    }
  }
});

function falarTexto(texto) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  }
}

document.addEventListener('click', (e) => {
  const alvo = e.target.closest('p, li, h1, h2, h3, h4, h5, h6, span, label, td');

  if (estadoRecursos.leitorVoz && alvo) {
    const texto = alvo.innerText.trim();
    if (texto) {
      falarTexto(texto);
    }
  }
});

function aplicarLeituraBionica(ativar) {
  const blocos = document.querySelectorAll('p, li, blockquote, td, span');

  blocos.forEach((bloco) => {
    if (ativar) {
      if (!bloco.dataset.textoOriginal) {
        bloco.dataset.textoOriginal = bloco.innerHTML;
      }

      const palavras = bloco.innerText.split(/\s+/);
      const bionicTexto = palavras.map((palavra) => {
        if (!palavra || palavra.length <= 3) {
          return `<b>${palavra || ''}</b>`;
        }

        const metade = Math.ceil(palavra.length / 2);
        return `<b class="bionic-bold">${palavra.slice(0, metade)}</b>${palavra.slice(metade)}`;
      }).join(' ');

      bloco.innerHTML = bionicTexto;
    } else if (bloco.dataset.textoOriginal) {
      bloco.innerHTML = bloco.dataset.textoOriginal;
    }
  });
}

function restaurarPadrao() {
  Object.keys(estadoRecursos).forEach((key) => {
    if (estadoRecursos[key]) {
      alternarRecurso(key);
    }
  });

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  fecharPainel();
}

function inicializarPainel() {
  const { toggle, painel } = criarWidgetA11y();
  const fecharBotao = painel.querySelector('.a11y-close');

  if (toggle) {
    toggle.addEventListener('click', alternarPainel);
  }

  if (fecharBotao) {
    fecharBotao.addEventListener('click', fecharPainel);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && painel && !painel.hidden) {
      fecharPainel();
    }
  });
}

const form = document.getElementById('form-contato');
const alerta = document.getElementById('alerta-feedback');

if (form && alerta) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      perfil: document.getElementById('perfil').value,
      recurso_favorito: document.getElementById('recurso_favorito').value,
      mensagem: document.getElementById('mensagem').value
    };

    try {
      const resposta = await fetch('/api/contatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const resultado = await resposta.json();

      if (resposta.ok && resultado.sucesso) {
        alerta.style.color = 'green';
        alerta.innerText = '✅ Dados gravados com sucesso no Banco de Dados!';
        form.reset();
        carregarDadosBanco();
      } else {
        alerta.style.color = 'red';
        alerta.innerText = '❌ Erro ao salvar dados no banco.';
      }
    } catch (erro) {
      alerta.style.color = 'red';
      alerta.innerText = '⚠️ Servidor offline ou erro de conexão.';
    }
  });
}

async function carregarDadosBanco() {
  const tabela = document.getElementById('tabela-dados');
  if (!tabela) return;

  try {
    const resposta = await fetch('/api/contatos');
    const dados = await resposta.json();

    if (dados.sucesso && Array.isArray(dados.dados)) {
      tabela.innerHTML = dados.dados.map((item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.nome}</td>
          <td>${item.email}</td>
          <td>${item.perfil}</td>
          <td>${item.recurso_favorito}</td>
          <td>${item.mensagem}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.log('Aguardando conexão com a API do banco...');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarPainel();
  carregarDadosBanco();
});