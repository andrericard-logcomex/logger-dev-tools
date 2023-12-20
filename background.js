const AUTH_HOMOLOGACAO = 'http://api-auth.homol.logcomex.io/api/login';
const AUTH_PRODUCAO = 'https://api-auth.logcomex.io/api/login';

const PLATAFORMA_HOMOLOGACAO = 'http://plataforma.homol.logcomex.io';
const PLATAFORMA_PRODUCAO = 'https://plataforma.logcomex.io';
const PLATAFORMA_LOCAL = 'http://localhost:3000';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'autologinLocal', title: 'Autologin Local', contexts: ['all'],
  });

  chrome.contextMenus.create({
    id: 'autologinHomologacao', title: 'Autologin Homologação', contexts: ['all'],
  });

  chrome.contextMenus.create({
    id: 'autologinProducao', title: 'Autologin Produção', contexts: ['all'],
  });
});

async function getToken(url, timeout = 5000) {
  try {
    const {email} = await chrome.storage.local.get('email');
    const {senha: password} = await chrome.storage.local.get('senha');

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
      signal: signal,
    });

    clearTimeout(timeoutId);

    const resp = await response.json();

    return {token: resp.auth.access_token, email: email};
  }
  catch (error) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon-128.png',
      title: 'Erro ao Buscar Token',
      message: error.name === 'AbortError'
          ? 'Requisição cancelada devido ao timeout.'
          : 'Não foi possível obter o token.',
    });

    throw error;
  }
}

function acessarPlataforma(url, token, email) {
  chrome.tabs.create({url: url + '?token=' + token + '&email=' + email + '&cookiesHasBeenAccepted=true'});
}

function evaluate(id) {
  switch (id) {
    case 'autologinLocal':
      getToken(AUTH_HOMOLOGACAO).then(r => acessarPlataforma(PLATAFORMA_LOCAL, r.token, r.email));
      break;
    case 'autologinHomologacao':
      getToken(AUTH_HOMOLOGACAO).then(r => acessarPlataforma(PLATAFORMA_HOMOLOGACAO, r.token, r.email));
      break;
    case 'autologinProducao':
      getToken(AUTH_PRODUCAO).then(r => acessarPlataforma(PLATAFORMA_PRODUCAO, r.token, r.email));
      break;
  }
}

chrome.commands.onCommand.addListener(command => evaluate(command));
chrome.contextMenus.onClicked.addListener(info => evaluate(info.menuItemId));
