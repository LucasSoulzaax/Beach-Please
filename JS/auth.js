class SistemaAuth {
  constructor() {
    this.usuarioLogado = this.getUsuarioLogado();
    this.inicializar();
  }

  inicializar() {
    if (this.usuarioLogado) {
      console.log('Usuário logado:', this.usuarioLogado.email);
    }
  }

  cadastrar(nome, email, senha) {
    const usuarios = this.getUsuarios();
    if (usuarios.some(u => u.email === email)) return { sucesso: false, mensagem: 'Email já cadastrado!' };
    if (!nome || nome.length < 3) return { sucesso: false, mensagem: 'Nome deve ter pelo menos 3 caracteres!' };
    if (!this.validarEmail(email)) return { sucesso: false, mensagem: 'Email inválido!' };
    if (!senha || senha.length < 6) return { sucesso: false, mensagem: 'Senha deve ter pelo menos 6 caracteres!' };

    const novoUsuario = {
      id: Date.now(), nome, email, senha: btoa(senha),
      isAdmin: email === 'admin@beachplease.com',
      dataCriacao: new Date().toISOString()
    };
    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return { sucesso: true, mensagem: 'Cadastro realizado com sucesso!' };
  }

  getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios') || '[]');
  }

  getUsuarioPorEmail(email) {
    return this.getUsuarios().find(u => u.email === email);
  }

  atualizarUsuario(email, dadosNovos) {
    const usuarios = this.getUsuarios();
    const index = usuarios.findIndex(u => u.email === email);
    if (index === -1) return { sucesso: false, mensagem: 'Usuário não encontrado!' };
    if (dadosNovos.nome) usuarios[index].nome = dadosNovos.nome;
    if (dadosNovos.senha) usuarios[index].senha = btoa(dadosNovos.senha);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    if (this.usuarioLogado && this.usuarioLogado.email === email) {
      const usuarioAtualizado = { ...usuarios[index] };
      delete usuarioAtualizado.senha;
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
      this.usuarioLogado = usuarioAtualizado;
    }
    return { sucesso: true, mensagem: 'Dados atualizados com sucesso!' };
  }

  deletarUsuario(email, senha) {
    const usuarios = this.getUsuarios();
    const usuario = this.getUsuarioPorEmail(email);
    if (!usuario) return { sucesso: false, mensagem: 'Usuário não encontrado!' };
    if (atob(usuario.senha) !== senha) return { sucesso: false, mensagem: 'Senha incorreta!' };
    const novosUsuarios = usuarios.filter(u => u.email !== email);
    localStorage.setItem('usuarios', JSON.stringify(novosUsuarios));
    if (this.usuarioLogado && this.usuarioLogado.email === email) this.logout();
    return { sucesso: true, mensagem: 'Conta deletada com sucesso!' };
  }

  login(email, senha) {
    if (!this.validarEmail(email)) return { sucesso: false, mensagem: 'Email inválido!' };
    const usuario = this.getUsuarioPorEmail(email);
    if (!usuario) return { sucesso: false, mensagem: 'Usuário não encontrado!' };
    if (atob(usuario.senha) !== senha) return { sucesso: false, mensagem: 'Senha incorreta!' };
    const usuarioLogado = { id: usuario.id, nome: usuario.nome, email: usuario.email, isAdmin: usuario.isAdmin || false };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    this.usuarioLogado = usuarioLogado;
    return { sucesso: true, mensagem: 'Login realizado com sucesso!', usuario: usuarioLogado };
  }

  logout() {
    localStorage.removeItem('usuarioLogado');
    this.usuarioLogado = null;
    return { sucesso: true, mensagem: 'Logout realizado com sucesso!' };
  }

  estaLogado() { return this.usuarioLogado !== null; }
  isAdmin() { return this.usuarioLogado && this.usuarioLogado.isAdmin === true; }
  getUsuarioLogado() { return JSON.parse(localStorage.getItem('usuarioLogado') || 'null'); }
  validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
}

const auth = new SistemaAuth();


function abrirModalAuth() {
  if (auth.estaLogado()) { 
   
    if (window.app && typeof window.app.abrirModalPagamento === 'function') {
      window.app.abrirModalPagamento();
    }
    return; 
  }
  
  const modalAuth = document.createElement("div");
  modalAuth.className = "modal-overlay";
  modalAuth.id = "modalAuth";
  modalAuth.innerHTML = `
    <div class="modal-content">
      <div class="modal-header"><h2>Acesse sua conta</h2><button class="btn-close-modal" onclick="fecharModalAuth()">✕</button></div>
      <div class="auth-container">
        <div class="auth-tabs"><button class="auth-tab ativo" onclick="trocarTab('login')">Login</button><button class="auth-tab" onclick="trocarTab('cadastro')">Cadastrar</button></div>
        <form class="auth-form ativo" id="formLogin" onsubmit="processarLogin(event)">
          <div class="form-group"><label>Email</label><input type="email" id="loginEmail" required></div>
          <div class="form-group"><label>Senha</label><input type="password" id="loginSenha" required></div>
          <button type="submit" class="btn-auth">Entrar</button>
          <div class="auth-message" id="loginMessage"></div>
        </form>
        <form class="auth-form" id="formCadastro" onsubmit="processarCadastro(event)">
          <div class="form-group"><label>Nome Completo</label><input type="text" id="cadastroNome" required></div>
          <div class="form-group"><label>Email</label><input type="email" id="cadastroEmail" required></div>
          <div class="form-group"><label>Senha</label><input type="password" id="cadastroSenha" required minlength="6"></div>
          <div class="form-group"><label>Confirmar Senha</label><input type="password" id="cadastroSenhaConfirm" required minlength="6"></div>
          <button type="submit" class="btn-auth">Criar Conta</button>
          <div class="auth-message" id="cadastroMessage"></div>
        </form>
      </div>
    </div>`;
  document.body.appendChild(modalAuth);
  setTimeout(() => modalAuth.classList.add("ativo"), 10);
  modalAuth.addEventListener('click', (e) => { if (e.target === modalAuth) fecharModalAuth(); });
}

function fecharModalAuth() {
  const modal = document.getElementById('modalAuth');
  if (modal) { modal.classList.remove("ativo"); setTimeout(() => modal.remove(), 300); }
}

function trocarTab(tipo) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('ativo'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('ativo'));
  if (tipo === 'login') { document.querySelectorAll('.auth-tab')[0].classList.add('ativo'); document.getElementById('formLogin').classList.add('ativo'); }
  else { document.querySelectorAll('.auth-tab')[1].classList.add('ativo'); document.getElementById('formCadastro').classList.add('ativo'); }
}

function processarLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;
  const messageEl = document.getElementById('loginMessage');
  const resultado = auth.login(email, senha);
  
  if (resultado.sucesso) {
    messageEl.textContent = resultado.mensagem;
    messageEl.className = 'auth-message sucesso';
    messageEl.style.display = 'block';
    

    atualizarMenuComConta();
    
    setTimeout(() => {
      fecharModalAuth();
      
      if (auth.isAdmin()) {
     
        const isInPagesFolder = window.location.pathname.includes('/Pages/');
        window.location.href = isInPagesFolder ? 'admin.html' : './Pages/admin.html';
      } else {

        if (window.app && typeof window.app.abrirModalPagamento === 'function') {
          window.app.abrirModalPagamento();
        }
      }
    }, 1000);
  } else {
    messageEl.textContent = resultado.mensagem;
    messageEl.className = 'auth-message erro';
    messageEl.style.display = 'block';
  }
}

function processarCadastro(event) {
  event.preventDefault();
  const nome = document.getElementById('cadastroNome').value;
  const email = document.getElementById('cadastroEmail').value;
  const senha = document.getElementById('cadastroSenha').value;
  const senhaConfirm = document.getElementById('cadastroSenhaConfirm').value;
  const messageEl = document.getElementById('cadastroMessage');
  if (senha !== senhaConfirm) { messageEl.textContent = 'As senhas não coincidem!'; messageEl.className = 'auth-message erro'; messageEl.style.display = 'block'; return; }
  const resultado = auth.cadastrar(nome, email, senha);
  if (resultado.sucesso) {
    messageEl.textContent = resultado.mensagem; messageEl.className = 'auth-message sucesso'; messageEl.style.display = 'block';
    document.getElementById('formCadastro').reset();
    setTimeout(() => { trocarTab('login'); document.getElementById('loginEmail').value = email; }, 1500);
  } else { messageEl.textContent = resultado.mensagem; messageEl.className = 'auth-message erro'; messageEl.style.display = 'block'; }
}


function atualizarMenuComConta() {
  const menuContent = document.querySelector('.menu-content');
  if (!menuContent) return;
  const itemExistente = document.getElementById('menuConta');
  if (itemExistente) itemExistente.remove();

  const itemConta = document.createElement('a');
  itemConta.href = '#';
  itemConta.className = 'menu-item';
  itemConta.id = 'menuConta';

  if (auth.estaLogado()) {
    const usuario = auth.getUsuarioLogado();
    itemConta.innerHTML = `<span>${auth.isAdmin() ? '👑 Admin' : 'Minha Conta'} (${usuario.nome})</span>`;
    itemConta.onclick = (e) => {
      e.preventDefault();
      const menuPanel = document.getElementById('menuPanel');
      if (menuPanel) menuPanel.classList.remove('active');
      document.body.classList.remove("menu-aberto");
      setTimeout(() => {
        if (auth.isAdmin()) abrirModalAdminOpcoes();
        else abrirModalMinhaConta();
      }, 100);
    };
  } else {
    itemConta.innerHTML = `<span>Login / Cadastro</span>`;
    itemConta.onclick = (e) => {
      e.preventDefault();
      const menuPanel = document.getElementById('menuPanel');
      if (menuPanel) menuPanel.classList.remove('active');
      document.body.classList.remove("menu-aberto");
      setTimeout(() => abrirModalAuth(), 100);
    };
  }
  menuContent.insertBefore(itemConta, menuContent.firstChild);
}


function abrirModalAdminOpcoes() {
  const usuario = auth.getUsuarioLogado();
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "modalAdminOpcoes";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header"><h2>👑 Painel Admin</h2><button class="btn-close-modal" onclick="fecharModal('modalAdminOpcoes')">✕</button></div>
      <div class="auth-container">
        <div class="conta-info"><h3>Olá, ${usuario.nome}!</h3><p><strong>Email:</strong> ${usuario.email}</p><p><strong>Tipo:</strong> Administrador</p></div>
        <div class="conta-acoes">
          <button class="btn-auth" onclick="fecharModal('modalAdminOpcoes'); irParaAdmin();">📊 Ir para Painel Admin</button>
          <button class="btn-auth" style="background: #dc3545;" onclick="realizarLogout(); fecharModal('modalAdminOpcoes');">🚪 Sair da Conta</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("ativo"), 10);
  modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal('modalAdminOpcoes'); });
}

function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.classList.remove("ativo"); setTimeout(() => modal.remove(), 300); }
}


function abrirModalMinhaConta() {
  if (!auth.estaLogado()) { abrirModalAuth(); return; }
  const usuario = auth.getUsuarioLogado();
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "modalMinhaConta";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header"><h2>Minha Conta</h2><button class="btn-close-modal" onclick="fecharModal('modalMinhaConta')">✕</button></div>
      <div class="auth-container">
        <div class="conta-info"><h3>Dados da Conta</h3><p><strong>Nome:</strong> ${usuario.nome}</p><p><strong>Email:</strong> ${usuario.email}</p></div>
        <div class="conta-acoes">
          <button class="btn-auth" onclick="abrirModalEditarConta()">Editar Dados</button>
          <button class="btn-auth" style="background: #dc3545;" onclick="realizarLogout()">Sair da Conta</button>
          <button class="btn-auth" style="background: #6c757d;" onclick="confirmarDeletarConta()">Deletar Conta</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("ativo"), 10);
  modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal('modalMinhaConta'); });
}

function fecharModalMinhaConta() { fecharModal('modalMinhaConta'); }

function abrirModalEditarConta() {
  fecharModalMinhaConta();
  const usuario = auth.getUsuarioLogado();
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "modalEditarConta";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header"><h2>Editar Dados</h2><button class="btn-close-modal" onclick="fecharModal('modalEditarConta')">✕</button></div>
      <div class="auth-container">
        <form onsubmit="processarEdicaoConta(event)">
          <div class="form-group"><label>Nome Completo</label><input type="text" id="editarNome" value="${usuario.nome}" required></div>
          <div class="form-group"><label>Nova Senha (deixe em branco para não alterar)</label><input type="password" id="editarSenha" minlength="6"></div>
          <div class="form-group"><label>Confirmar Nova Senha</label><input type="password" id="editarSenhaConfirm" minlength="6"></div>
          <button type="submit" class="btn-auth">Salvar Alterações</button>
          <button type="button" class="btn-auth" style="background: #6c757d; margin-top: 10px;" onclick="fecharModal('modalEditarConta'); setTimeout(abrirModalMinhaConta, 100);">Cancelar</button>
          <div class="auth-message" id="editarMessage"></div>
        </form>
      </div>
    </div>`;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add("ativo"), 10);
}

function fecharModalEditarConta() { fecharModal('modalEditarConta'); }

function processarEdicaoConta(event) {
  event.preventDefault();
  const usuario = auth.getUsuarioLogado();
  const nome = document.getElementById('editarNome').value;
  const senha = document.getElementById('editarSenha').value;
  const senhaConfirm = document.getElementById('editarSenhaConfirm').value;
  const messageEl = document.getElementById('editarMessage');
  if (senha && senha !== senhaConfirm) { messageEl.textContent = 'As senhas não coincidem!'; messageEl.className = 'auth-message erro'; messageEl.style.display = 'block'; return; }
  const dadosNovos = { nome };
  if (senha) dadosNovos.senha = senha;
  const resultado = auth.atualizarUsuario(usuario.email, dadosNovos);
  if (resultado.sucesso) {
    messageEl.textContent = resultado.mensagem; messageEl.className = 'auth-message sucesso'; messageEl.style.display = 'block';
    setTimeout(() => { fecharModalEditarConta(); atualizarMenuComConta(); if (window.app && typeof window.app.mostrarModalSucesso === 'function') window.app.mostrarModalSucesso('Dados Atualizados!', 'Suas informações foram atualizadas com sucesso.'); }, 1000);
  } else { messageEl.textContent = resultado.mensagem; messageEl.className = 'auth-message erro'; messageEl.style.display = 'block'; }
}

function realizarLogout() {
  auth.logout();
  fecharModal('modalMinhaConta');
  fecharModal('modalAdminOpcoes');
  atualizarMenuComConta();
  if (window.app && typeof window.app.mostrarModalSucesso === 'function') window.app.mostrarModalSucesso('Logout Realizado!', 'Você saiu da sua conta com sucesso.');
}

function confirmarDeletarConta() {
  if (!confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita!')) return;
  const senha = prompt('Digite sua senha para confirmar:');
  if (!senha) return;
  const usuario = auth.getUsuarioLogado();
  const resultado = auth.deletarUsuario(usuario.email, senha);
  if (resultado.sucesso) { fecharModalMinhaConta(); atualizarMenuComConta(); if (window.app && typeof window.app.mostrarModalSucesso === 'function') window.app.mostrarModalSucesso('Conta Deletada!', 'Sua conta foi deletada com sucesso.'); }
  else alert(resultado.mensagem);
}


function irParaAdmin() {
  const isInPagesFolder = window.location.pathname.includes('/Pages/');
  window.location.href = isInPagesFolder ? 'admin.html' : './Pages/admin.html';
}


window.auth = auth;
window.abrirModalAuth = abrirModalAuth;
window.fecharModalAuth = fecharModalAuth;
window.trocarTab = trocarTab;
window.processarLogin = processarLogin;
window.processarCadastro = processarCadastro;
window.abrirModalMinhaConta = abrirModalMinhaConta;
window.fecharModalMinhaConta = fecharModalMinhaConta;
window.abrirModalEditarConta = abrirModalEditarConta;
window.fecharModalEditarConta = fecharModalEditarConta;
window.processarEdicaoConta = processarEdicaoConta;
window.realizarLogout = realizarLogout;
window.confirmarDeletarConta = confirmarDeletarConta;
window.abrirModalAdminOpcoes = abrirModalAdminOpcoes;
window.fecharModal = fecharModal;
window.irParaAdmin = irParaAdmin;


document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const btnFinalizar = document.querySelector("#finalizarCompraBtn");
    if (btnFinalizar) {
      const novoBotao = btnFinalizar.cloneNode(true);
      btnFinalizar.parentNode.replaceChild(novoBotao, btnFinalizar);
      novoBotao.onclick = () => {
       
        const totalText = document.getElementById('totalSacola')?.textContent;
        if (!totalText) return;
        
        const totalValue = parseFloat(totalText.replace('R$', '').replace(',', '.').trim());
        
        if (totalValue === 0 || isNaN(totalValue)) { 
          if (window.app && typeof window.app.mostrarModalSucesso === 'function') {
            window.app.mostrarModalSucesso("Sua sacola está vazia!", "Adicione alguns produtos antes de finalizar a compra.");
          }
          return;
        }
        
      
        if (!auth.estaLogado()) {
          abrirModalAuth();
        } else {
        
          if (window.app && typeof window.app.abrirModalPagamento === 'function') {
            window.app.abrirModalPagamento();
          }
        }
      };
    }
    atualizarMenuComConta();
    atualizarIconesRodape();
  }, 500);
});

function atualizarIconesRodape() {
  const iconesRodape = document.querySelectorAll('#rodape #icons img');
  if (iconesRodape.length >= 4) {
    iconesRodape[0].onclick = () => { window.location.href = '../index.html'; };
    iconesRodape[2].onclick = () => { const m = document.getElementById("modalBuscaMobile"); const b = document.getElementById("buscarItemMobile"); if (m) { m.classList.add("ativo"); setTimeout(() => b.focus(), 300); } };
    iconesRodape[3].onclick = () => { const s = document.getElementById("sacolaContainer"); if (s) { s.classList.add("ativo"); document.body.style.overflow = "hidden"; } };
  }
}