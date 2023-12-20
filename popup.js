document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['email'], function(result) {
    document.getElementById('savedEmail').textContent = result.email || 'Não definido';
    document.getElementById('savedPassword').textContent = '****' || 'Não definido';
  });
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var email = document.getElementById('email').value;
  var senha = document.getElementById('senha').value;

  chrome.storage.local.set({email: email, senha: senha}, function() {
    console.log('Email e senha salvos.');
    // Atualize a exibição com os novos valores
    document.getElementById('savedEmail').textContent = email;
    document.getElementById('savedPassword').textContent = '****';
  });
});
