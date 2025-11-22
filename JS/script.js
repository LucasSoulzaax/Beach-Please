const CONFIG = {
  ITENS_POR_PAGINA: 9,
  TIMER_PIX: 300,
  WHATSAPP: '5585999999999',
  EMAIL: 'contato@beachplease.com.br'
};

const Utils = {
  $(selector) { return document.querySelector(selector); },
  $$(selector) { return document.querySelectorAll(selector); }
};

class Estado {
  constructor() {
    this.sacola = this.carregarStorage('sacola', []);
    this.paginaAtual = { vendidos: 1, promocoes: 1, lancamentos: 1 };
    this.categoriaAtiva = 'todos';
    this.timerInterval = null;
    this.secaoAtiva = 'lancamentos';
  }
  carregarStorage(chave, padrao) {
    try { const dado = localStorage.getItem(chave); return dado ? JSON.parse(dado) : padrao; }
    catch { return padrao; }
  }
  salvarSacola() {
    try { localStorage.setItem('sacola', JSON.stringify(this.sacola)); }
    catch (e) { console.error('Erro ao salvar sacola:', e); }
  }
  adicionarItem(produto) {
    const existente = this.sacola.find(item => item.titulo === produto.titulo);
    if (existente) existente.qtd++;
    else this.sacola.push({ ...produto, qtd: 1 });
    this.salvarSacola();
  }
  removerItem(titulo) { this.sacola = this.sacola.filter(item => item.titulo !== titulo); this.salvarSacola(); }
  alterarQuantidade(titulo, acao) {
    const item = this.sacola.find(item => item.titulo === titulo);
    if (!item) return false;
    if (acao === 'aumentar') item.qtd++;
    else if (acao === 'diminuir') { if (item.qtd > 1) item.qtd--; else { this.removerItem(titulo); return true; } }
    this.salvarSacola();
    return true;
  }
  calcularTotal() {
    return this.sacola.reduce((total, item) => {
      const preco = parseFloat(item.preco.replace(/[R$\s]/g, '').replace(',', '.'));
      return total + (preco * item.qtd);
    }, 0);
  }
  getTotalItens() { return this.sacola.reduce((acc, item) => acc + item.qtd, 0); }
  limpar() { this.sacola = []; this.salvarSacola(); }
}

const produtos = {
  maisVendidos: [
    { titulo: "Vestido Linho Off-White", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", imgHover: "https://plus.unsplash.com/premium_photo-1676236306466-25ba882070b3?q=80&w=688&auto=format&fit=crop", preco: "R$ 189,90", tipo: "vestido" },
    { titulo: "Conjunto Cropped Listrado", img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80", preco: "R$ 149,90", tipo: "blusa" },
    { titulo: "Camisa Oversized Bege", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80", preco: "R$ 129,90", tipo: "blusa" },
    { titulo: "Blazer Alfaiataria Rosa", img: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80", preco: "R$ 249,90", tipo: "blusa" },
    { titulo: "Top Tricot Branco", img: "https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&q=80", preco: "R$ 89,90", tipo: "blusa" },
    { titulo: "Vestido Midi Floral", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80", preco: "R$ 199,90", tipo: "vestido" },
    { titulo: "Calça Jeans Skinny", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=800&q=80", preco: "R$ 179,90", tipo: "calca" },
    { titulo: "Vestido Longo Branco", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80", preco: "R$ 229,90", tipo: "vestido" },
    { titulo: "Biquíni Cortininha Rosa", img: "https://plus.unsplash.com/premium_photo-1705969341660-362dcc08736c?q=80&w=687&auto=format&fit=crop", imgHover: "https://images.unsplash.com/photo-1593836788196-9fd68e904906?q=80&w=1073&auto=format&fit=crop", preco: "R$ 119,90", tipo: "biquini" },
    { titulo: "Conjunto Lingerie Preto", img: "https://images.unsplash.com/photo-1561375958-669d8413fa06?q=80&w=765&auto=format&fit=crop", imgHover: "https://images.unsplash.com/photo-1618902751861-3de78572c067?q=80&w=687&auto=format&fit=crop", preco: "R$ 89,90", tipo: "lingerie" },
    { titulo: "Calça Pantalona Preta", img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80", preco: "R$ 159,90", tipo: "calca" },
    { titulo: "Blusa Cropped Branca", img: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80", preco: "R$ 79,90", tipo: "blusa" }
  ],
  promocoes: [
    { titulo: "Calça Wide Leg Jeans", img: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80", preco: "R$ 159,90", precoAntigo: "R$ 229,90", tipo: "calca" },
    { titulo: "Blusa Manga Bufante Preta", img: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&q=80", preco: "R$ 119,90", precoAntigo: "R$ 179,90", tipo: "blusa" },
    { titulo: "Saia Plissada Midi", img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80", preco: "R$ 139,90", precoAntigo: "R$ 199,90", tipo: "calca" },
    { titulo: "Cardigan Oversize Creme", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80", preco: "R$ 169,90", precoAntigo: "R$ 249,90", tipo: "blusa" },
    { titulo: "Short Alfaiataria Preto", img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1624623279974-3b0e2524187b?w=800&q=80", preco: "R$ 99,90", precoAntigo: "R$ 149,90", tipo: "calca" },
    { titulo: "Regata Básica Ribana", img: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", preco: "R$ 49,90", precoAntigo: "R$ 79,90", tipo: "blusa" },
    { titulo: "Vestido Midi Vermelho", img: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80", preco: "R$ 169,90", precoAntigo: "R$ 249,90", tipo: "vestido" },
    { titulo: "Biquíni Fio Dental Preto", img: "https://images.unsplash.com/photo-1582733852262-f638e3c495ca?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80", preco: "R$ 89,90", precoAntigo: "R$ 139,90", tipo: "biquini" },
    { titulo: "Conjunto Lingerie Renda", img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1611846049547-fd97dbbf5478?w=800&q=80", preco: "R$ 79,90", precoAntigo: "R$ 129,90", tipo: "lingerie" },
    { titulo: "Calça Cargo Verde", img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80", preco: "R$ 149,90", precoAntigo: "R$ 219,90", tipo: "calca" },
    { titulo: "Vestido Tomara Que Caia", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", preco: "R$ 159,90", precoAntigo: "R$ 229,90", tipo: "vestido" },
    { titulo: "Top Fitness Rosa", img: "https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800&q=80", preco: "R$ 59,90", precoAntigo: "R$ 99,90", tipo: "blusa" }
  ],
  lancamentos: [
    { titulo: "Jaqueta Jeans Destroyed", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80", preco: "R$ 279,90", tipo: "blusa" },
    { titulo: "Vestido Longo Listrado", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", preco: "R$ 219,90", tipo: "vestido" },
    { titulo: "Conjunto Moletom Rosa", img: "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80", preco: "R$ 189,90", tipo: "blusa" },
    { titulo: "Camisa Social Branca", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&q=80", preco: "R$ 159,90", tipo: "blusa" },
    { titulo: "Body Manga Longa Preto", img: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80", preco: "R$ 79,90", tipo: "blusa" },
    { titulo: "Calça Cargo Bege", img: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=800&q=80", preco: "R$ 169,90", tipo: "calca" },
    { titulo: "Vestido Babados Amarelo", img: "https://images.unsplash.com/photo-1631234764568-996fab371596?q=80&w=687&auto=format&fit=crop", imgHover: "https://images.unsplash.com/photo-1622122201714-77da0ca8e5d2?q=80&w=687&auto=format&fit=crop", preco: "R$ 199,90", tipo: "vestido" },
    { titulo: "Biquíni Hot Pants", img: "https://images.unsplash.com/flagged/photo-1553928841-ccac95ad7e72?q=80&w=687&auto=format&fit=crop", imgHover: "https://images.unsplash.com/photo-1580247334244-67b74729bc3f?q=80&w=687&auto=format&fit=crop", preco: "R$ 129,90", tipo: "biquini" },
    { titulo: "Conjunto Lingerie Branco", img: "https://images.unsplash.com/photo-1625023489823-c9c1e36d6f2b?q=80&w=687&auto=format&fit=crop", imgHover: "https://images.unsplash.com/photo-1651671685354-8ef9110ea28e?q=80&w=687&auto=format&fit=crop", preco: "R$ 99,90", tipo: "lingerie" },
    { titulo: "Calça Flare Preta", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80", preco: "R$ 189,90", tipo: "calca" },
    { titulo: "Cropped Canelado", img: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=800&q=80", preco: "R$ 69,90", tipo: "blusa" },
    { titulo: "Vestido Ciganinha Floral", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80", imgHover: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80", preco: "R$ 179,90", tipo: "vestido" }
  ]
};

try {
  const produtosAdmin = JSON.parse(localStorage.getItem('produtosAdmin') || '[]');
  produtosAdmin.forEach(produto => { const cat = produto.categoria; if (produtos[cat]) produtos[cat].push(produto); });
} catch (e) { console.error('Erro ao carregar produtos do admin:', e); }

const todosProdutos = [...produtos.lancamentos, ...produtos.promocoes, ...produtos.maisVendidos];

class Renderizador {
  criarCard(dados) {
    const div = document.createElement("div");
    div.className = "cardsCriados";
    div.dataset.tipo = dados.tipo || 'todos';
    const imgContainer = document.createElement("div");
    imgContainer.className = "card-image-container";
    const img = document.createElement("img");
    img.className = "imagenzinha";
    img.src = dados.img;
    img.alt = dados.titulo;
    img.loading = "lazy";
    if (dados.imgHover && window.innerWidth >= 768) {
      div.addEventListener("mouseenter", () => img.src = dados.imgHover);
      div.addEventListener("mouseleave", () => img.src = dados.img);
    }
    imgContainer.appendChild(img);
    const info = document.createElement("div");
    info.className = "card-info";
    const h2 = document.createElement("h2");
    h2.textContent = dados.titulo;
    const precoContainer = document.createElement("div");
    precoContainer.className = "preco-container";
    if (dados.precoAntigo) {
      const precoAntigo = document.createElement("span");
      precoAntigo.className = "preco-antigo";
      precoAntigo.textContent = dados.precoAntigo;
      precoContainer.appendChild(precoAntigo);
    }
    const p = document.createElement("p");
    p.textContent = dados.preco;
    precoContainer.appendChild(p);
    const btn = document.createElement("button");
    btn.textContent = "COMPRAR";
    btn.onclick = (e) => { e.stopPropagation(); app.adicionarNaSacola(dados); };
    info.append(h2, precoContainer, btn);
    div.append(imgContainer, info);
    return div;
  }
  renderizarComPaginacao(cards, sections, pagina, tipo) {
    sections.forEach(section => {
      const paginacaoAntiga = section.parentElement?.querySelector('.paginacao');
      if (paginacaoAntiga) paginacaoAntiga.remove();
      section.innerHTML = '';
      const inicio = (pagina - 1) * CONFIG.ITENS_POR_PAGINA;
      const fim = inicio + CONFIG.ITENS_POR_PAGINA;
      const cardsPagina = cards.slice(inicio, fim);
      if (cardsPagina.length === 0) {
        section.innerHTML = '<div class="mensagem-vazia"><div class="icone-vazio">📦</div><h3>Não há produtos disponíveis</h3><p>Volte em breve para conferir novidades!</p></div>';
        return;
      }
      cardsPagina.forEach(cardData => section.append(this.criarCard(cardData)));
      const totalPaginas = Math.ceil(cards.length / CONFIG.ITENS_POR_PAGINA);
      if (totalPaginas > 1) this.criarPaginacao(section, totalPaginas, pagina, tipo, cards, sections);
    });
  }
  criarPaginacao(section, totalPaginas, paginaAtual, tipo, cards, sections) {
    const paginacao = document.createElement('div');
    paginacao.className = 'paginacao';
    for (let i = 1; i <= totalPaginas; i++) {
      const botao = document.createElement('button');
      botao.className = 'paginacao-btn';
      if (i === paginaAtual) botao.classList.add('ativo');
      botao.textContent = i;
      botao.onclick = () => { app.estado.paginaAtual[tipo] = i; this.renderizarComPaginacao(cards, sections, i, tipo); window.scrollTo({ top: 0, behavior: 'smooth' }); };
      paginacao.appendChild(botao);
    }
    section.parentElement?.appendChild(paginacao);
  }
}

class GerenciadorBusca {
  inicializar() {
    const lupinhaMobile = document.querySelector('.lupinha-mobile');
    const lupinhaRodape = document.querySelector('.lupinha-rodape');
    if (lupinhaMobile) lupinhaMobile.addEventListener("click", () => this.abrirModalBuscaMobile());
    if (lupinhaRodape) lupinhaRodape.addEventListener("click", () => this.abrirModalBuscaMobile());
    const btnFechar = document.querySelector('.btn-fechar-busca');
    if (btnFechar) btnFechar.addEventListener("click", () => this.fecharModalBuscaMobile());
    const buscarMobile = document.querySelector('#buscarItemMobile');
    if (buscarMobile) buscarMobile.addEventListener("input", e => this.buscar(e, true));
    const buscarDesktop = document.querySelector('#buscarItem');
    if (buscarDesktop) {
      buscarDesktop.addEventListener("input", e => this.buscar(e, false));
      document.addEventListener("click", e => {
        const testado = document.querySelector('#testando');
        if (testado && !testado.contains(e.target) && e.target !== buscarDesktop) testado.style.display = "none";
      });
    }
  }
  abrirModalBuscaMobile() {
    const modal = document.querySelector('#modalBuscaMobile');
    const input = document.querySelector('#buscarItemMobile');
    if (modal) { modal.classList.add("ativo"); setTimeout(() => input?.focus(), 300); }
  }
  fecharModalBuscaMobile() {
    const modal = document.querySelector('#modalBuscaMobile');
    const input = document.querySelector('#buscarItemMobile');
    const resultados = document.querySelector('#resultadosBuscaMobile');
    if (modal) modal.classList.remove("ativo");
    if (input) input.value = "";
    if (resultados) resultados.innerHTML = "";
  }
  buscar(e, isMobile) {
    const texto = e.target.value.trim().toLowerCase();
    const container = isMobile ? document.querySelector('#resultadosBuscaMobile') : document.querySelector('#testando');
    if (!container) return;
    if (!texto) { if (isMobile) container.innerHTML = ""; else { container.style.display = "none"; container.innerHTML = ""; } return; }
    if (!isMobile) container.style.display = "block";
    this.renderizarResultados(texto, container, isMobile);
  }
  renderizarResultados(texto, container, isMobile) {
    container.innerHTML = "";
    const encontrados = todosProdutos.filter(prod => prod.titulo.toLowerCase().includes(texto));
    if (encontrados.length > 0) {
      encontrados.forEach(prod => {
        const div = document.createElement("div");
        div.className = "resultadoBusca";
        const textoDiv = document.createElement("span");
        textoDiv.textContent = prod.titulo;
        const precoSpan = document.createElement("span");
        precoSpan.className = "preco-busca";
        precoSpan.textContent = prod.preco;
        div.append(textoDiv, precoSpan);
        div.onclick = () => this.selecionarResultado(isMobile, prod);
        container.append(div);
      });
    } else container.innerHTML = '<div class="sem-resultado">Nenhum produto encontrado</div>';
  }
  selecionarResultado(isMobile, produto) {
    if (isMobile) this.fecharModalBuscaMobile();
    else { const buscar = document.querySelector('#buscarItem'); const testado = document.querySelector('#testando'); if (buscar) buscar.value = ""; if (testado) testado.style.display = "none"; }
    const paginaAtual = window.location.pathname;
    const ehPaginaInicial = paginaAtual.includes('index.html') || paginaAtual.endsWith('/') || paginaAtual === '/';
    let secaoCorreta = null;
    if (produtos.lancamentos.some(p => p.titulo === produto.titulo)) secaoCorreta = 'lancamentos';
    else if (produtos.promocoes.some(p => p.titulo === produto.titulo)) secaoCorreta = 'promocoes';
    else if (produtos.maisVendidos.some(p => p.titulo === produto.titulo)) secaoCorreta = 'vendidos';
    if (ehPaginaInicial && secaoCorreta !== 'vendidos') {
      sessionStorage.setItem('produtoBuscado', JSON.stringify(produto));
      sessionStorage.setItem('secaoProduto', secaoCorreta);
      window.location.href = './Pages/produtos.html';
      return;
    }
    setTimeout(() => {
      if (secaoCorreta && app.gerenciadorSecoes) app.gerenciadorSecoes.mostrarSecao(secaoCorreta);
      setTimeout(() => this.buscarEDestacarCard(produto), 300);
    }, 100);
  }
  buscarEDestacarCard(produto) {
    const todosCards = document.querySelectorAll('.cardsCriados');
    let cardEncontrado = null;
    todosCards.forEach(card => { const h2 = card.querySelector('h2'); if (h2 && h2.textContent.trim() === produto.titulo) cardEncontrado = card; });
    if (cardEncontrado) {
      cardEncontrado.style.display = 'flex';
      if (app.estado.categoriaAtiva !== 'todos' && app.estado.categoriaAtiva !== produto.tipo) {
        app.estado.categoriaAtiva = 'todos';
        document.querySelectorAll('.categoria-item').forEach(item => item.classList.remove('ativo'));
        const todosItem = document.querySelector('.categoria-item');
        if (todosItem) todosItem.classList.add('ativo');
        document.querySelectorAll('.cardsCriados').forEach(c => c.style.display = 'flex');
      }
      cardEncontrado.classList.add('destaque-busca');
      const yOffset = -120;
      const y = cardEncontrado.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(() => cardEncontrado.classList.remove('destaque-busca'), 3000);
    } else { const primeiraSecao = document.querySelector('#colection'); if (primeiraSecao) primeiraSecao.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
}

// CONTINUAÇÃO DO script.js - Cole após a Parte 1

class GerenciadorSacola {
  constructor(estado) { this.estado = estado; this.inicializar(); }
  inicializar() { this.criarContainerSacola(); this.configurarEventos(); this.atualizar(); }
  criarContainerSacola() {
    let sacola = document.getElementById("sacolaContainer");
    if (!sacola) {
      sacola = document.createElement("div");
      sacola.id = "sacolaContainer";
      sacola.innerHTML = `<div id="boxSacola"><div class="sacola-header"><h2>Minha Sacola</h2><button id="fecharSacolaBtn" class="btn-fechar-sacola">✕</button></div><div id="listaSacola"></div><div class="sacola-footer"><div class="total-container"><span>Total:</span><h3 id="totalSacola">R$ 0,00</h3></div><button id="finalizarCompraBtn" class="btn-finalizar">Finalizar Compra</button></div></div>`;
      document.body.append(sacola);
    }
  }
  configurarEventos() {
    const sacolaIcon = document.querySelector('.sacola');
    const sacolaRodape = document.querySelector('.sacola-rodape');
    if (sacolaIcon) sacolaIcon.onclick = () => this.abrir();
    if (sacolaRodape) sacolaRodape.onclick = () => this.abrir();
    const btnFechar = document.getElementById("fecharSacolaBtn");
    if (btnFechar) btnFechar.onclick = () => this.fechar();
    const btnFinalizar = document.getElementById("finalizarCompraBtn");
    if (btnFinalizar) btnFinalizar.onclick = () => this.finalizarCompra();
    const container = document.getElementById("sacolaContainer");
    if (container) container.addEventListener("click", e => { if (e.target === container) this.fechar(); });
  }
  abrir() { const container = document.getElementById("sacolaContainer"); const body = document.querySelector('body'); if (container) container.classList.add("ativo"); if (body) body.style.overflow = "hidden"; }
  fechar() { const container = document.getElementById("sacolaContainer"); const body = document.querySelector('body'); if (container) container.classList.remove("ativo"); if (body) body.style.overflow = "auto"; }
  
  atualizar() {
    const listaSacola = document.getElementById("listaSacola");
    const totalSacola = document.getElementById("totalSacola");
    const badgeHeader = document.getElementById('badgeSacolaMobile');
    const badgeFooter = document.getElementById('badgeSacolaFooter');
    if (!listaSacola || !totalSacola) return;
    listaSacola.innerHTML = "";
    const total = this.estado.calcularTotal();
    if (this.estado.sacola.length === 0) {
      listaSacola.innerHTML = '<div class="sacola-vazia"><p>Sua sacola está vazia</p></div>';
      totalSacola.textContent = "R$ 0,00";
      if (badgeHeader) { badgeHeader.textContent = "0"; badgeHeader.style.display = "none"; }
      if (badgeFooter) { badgeFooter.textContent = "0"; badgeFooter.style.display = "none"; }
      return;
    }
    this.estado.sacola.forEach(prod => { const linha = this.criarLinhaSacola(prod); listaSacola.append(linha); });
    totalSacola.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
    const totalItens = this.estado.getTotalItens();
    if (badgeHeader) { badgeHeader.textContent = totalItens; badgeHeader.style.display = totalItens > 0 ? "flex" : "none"; }
    if (badgeFooter) { badgeFooter.textContent = totalItens; badgeFooter.style.display = totalItens > 0 ? "flex" : "none"; }
  }
  
  criarLinhaSacola(prod) {
    const linha = document.createElement("div");
    linha.className = "linhaSacola";
    linha.innerHTML = `<img src="${prod.img}" alt="${prod.titulo}"><div class="info-sacola"><p class="titulo-sacola">${prod.titulo}</p><p class="preco-sacola">${prod.preco}</p><div class="quantidade-controls"><button class="btn-qtd" data-titulo="${prod.titulo}" data-acao="diminuir">-</button><span class="qtd-display">${prod.qtd}</span><button class="btn-qtd" data-titulo="${prod.titulo}" data-acao="aumentar">+</button></div></div><button class="btn-remover" data-titulo="${prod.titulo}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
    linha.querySelectorAll('.btn-qtd').forEach(btn => { btn.onclick = () => { this.estado.alterarQuantidade(btn.dataset.titulo, btn.dataset.acao); this.atualizar(); }; });
    const btnRemover = linha.querySelector('.btn-remover');
    if (btnRemover) btnRemover.onclick = () => { this.estado.removerItem(btnRemover.dataset.titulo); this.atualizar(); };
    return linha;
  }
  finalizarCompra() {
    if (this.estado.sacola.length === 0) { if (window.app) window.app.mostrarModalSucesso("Sua sacola está vazia!", "Adicione alguns produtos antes de finalizar a compra."); return; }
    if (window.auth && !window.auth.estaLogado()) { if (typeof window.abrirModalAuth === 'function') window.abrirModalAuth(); }
    else window.app.abrirModalPagamento();
  }
}

class GerenciadorMenu {
  inicializar() { this.configurarBotaoFechar(); this.configurarBotoesAbrir(); this.configurarLinks(); }
  configurarBotaoFechar() {
    const closeMenu = document.getElementById('closeMenu');
    if (closeMenu) {
      const isInPagesFolder = window.location.pathname.includes('/Pages/');
      const imagePath = isInPagesFolder ? '../Assets/Sources/271210.png' : './Assets/Sources/271210.png';
      const img = document.createElement("img");
      img.className = "img_close"; img.src = imagePath; img.alt = "Fechar menu";
      img.onerror = function() { this.style.display = 'none'; closeMenu.innerHTML = '✕'; closeMenu.style.fontSize = '1.5rem'; closeMenu.style.color = 'white'; };
      closeMenu.innerHTML = ""; closeMenu.append(img);
      closeMenu.addEventListener('click', () => this.fechar());
    }
  }
  configurarBotoesAbrir() { document.querySelectorAll(".menuAbrir").forEach(btn => { btn.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); this.abrir(); }); }); }
  configurarLinks() {
    document.querySelectorAll(".menu-item").forEach(link => {
      const href = link.getAttribute('href');
      const acoes = {
        '#horarios': () => { this.fechar(); setTimeout(() => app.abrirModalHorarios(), 300); },
        '#retiradas': () => { this.fechar(); window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de informações sobre retirada de produtos.")}`, '_blank'); },
        '#perguntas': () => { this.fechar(); setTimeout(() => app.abrirModalPerguntas(), 300); },
        '#contato': () => { this.fechar(); setTimeout(() => app.abrirModalContato(), 300); }
      };
      if (acoes[href]) link.addEventListener("click", e => { e.preventDefault(); acoes[href](); });
      else if (href && !href.includes('.html')) link.addEventListener("click", () => this.fechar());
    });
  }
  abrir() { const menuPanel = document.getElementById('menuPanel'); const body = document.querySelector('body'); if (menuPanel) menuPanel.classList.add("active"); if (body) body.classList.add("menu-aberto"); }
  fechar() { const menuPanel = document.getElementById('menuPanel'); const body = document.querySelector('body'); if (menuPanel) menuPanel.classList.remove('active'); if (body) body.classList.remove("menu-aberto"); }
}

class GerenciadorPagamento {
  constructor(estado) { this.estado = estado; }
  registrarVenda(metodoPagamento, total) {
    try {
      const vendas = JSON.parse(localStorage.getItem('vendas') || '[]');
      const venda = { id: Date.now(), data: new Date().toISOString(), metodoPagamento, total: parseFloat(total), itens: this.estado.sacola.map(item => ({ titulo: item.titulo, quantidade: item.qtd, preco: item.preco })) };
      vendas.push(venda); localStorage.setItem('vendas', JSON.stringify(vendas));
    } catch (e) { console.error('Erro ao registrar venda:', e); }
  }
  gerarCodigoPix() { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let codigo = '00020126580014BR.GOV.BCB.PIX'; for (let i = 0; i < 80; i++) codigo += chars.charAt(Math.floor(Math.random() * chars.length)); return codigo + '6304' + Math.random().toString(36).substring(2, 6).toUpperCase(); }
  abrirModalPagamento() {
    const totalSacola = document.getElementById("totalSacola"); if (!totalSacola) return;
    const totalCompra = totalSacola.textContent;
    const modalPagamento = document.createElement("div"); modalPagamento.className = "modal-overlay"; modalPagamento.id = "modalPagamento";
    modalPagamento.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>Forma de Pagamento</h2><button class="btn-close-modal" data-modal="modalPagamento">✕</button></div><div class="total-compra"><p>Total a pagar</p><h3>${totalCompra}</h3></div><div class="metodos-pagamento"><div class="metodo-item" data-metodo="pix"><div class="metodo-info"><h3>PIX</h3><p>Aprovação instantânea</p></div></div><div class="metodo-item" data-metodo="credito"><div class="metodo-info"><h3>Cartão de Crédito</h3><p>Parcelamento em até 12x</p></div></div><div class="metodo-item" data-metodo="debito"><div class="metodo-info"><h3>Cartão de Débito</h3><p>Desconto à vista</p></div></div></div></div>`;
    document.body.appendChild(modalPagamento); setTimeout(() => modalPagamento.classList.add("ativo"), 10);
    modalPagamento.addEventListener('click', (e) => {
      if (e.target === modalPagamento || e.target.dataset.modal === 'modalPagamento' || e.target.classList.contains('btn-close-modal')) { this.fecharModal('modalPagamento'); return; }
      const metodoItem = e.target.closest('[data-metodo]');
      if (metodoItem) { const tipo = metodoItem.dataset.metodo; if (tipo === 'pix') this.processarPix(); else this.abrirModalCartao(tipo); }
    });
  }
  processarPix() {
    this.fecharModal('modalPagamento');
    const totalSacola = document.getElementById("totalSacola"); if (!totalSacola) return;
    const codigoPix = this.gerarCodigoPix();
    const modalPix = document.createElement("div"); modalPix.className = "modal-overlay"; modalPix.id = "modalPix";
    modalPix.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>Pagamento via PIX</h2><button class="btn-close-modal" data-modal="modalPix">✕</button></div><div class="pix-container"><div class="pix-timer"><p>Tempo restante para pagamento</p><div class="timer-display" id="timerDisplay">05:00</div></div><div class="pix-qrcode">[QR CODE]<br>Escaneie com o app do seu banco</div><div class="pix-codigo-container"><p class="pix-codigo-label">Ou copie o código PIX:</p><div class="pix-codigo" id="pixCodigo">${codigoPix}</div><button class="btn-copiar-pix" id="btnCopiarPix"><span>📋</span> Copiar Código</button></div><div class="pix-instrucoes"><h4>Como pagar:</h4><ol><li>Abra o app do seu banco</li><li>Escolha a opção Pix</li><li>Escaneie o QR Code ou cole o código</li><li>Confirme o pagamento</li></ol></div><div class="pix-footer"><button class="btn-voltar-pagamento" data-action="voltar">Voltar</button></div></div></div>`;
    document.body.appendChild(modalPix); setTimeout(() => modalPix.classList.add("ativo"), 10);
    let tempoRestante = CONFIG.TIMER_PIX; const timerDisplay = document.getElementById("timerDisplay");
    this.estado.timerInterval = setInterval(() => { tempoRestante--; const m = Math.floor(tempoRestante / 60); const s = tempoRestante % 60; if (timerDisplay) { timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; if (tempoRestante <= 60) timerDisplay.classList.add('urgente'); } if (tempoRestante <= 0) { clearInterval(this.estado.timerInterval); this.fecharModal('modalPix'); app.mostrarModalSucesso("Tempo Expirado", "O código PIX expirou."); } }, 1000);
    modalPix.addEventListener('click', (e) => {
      if (e.target.id === 'btnCopiarPix' || e.target.closest('#btnCopiarPix')) { const codigo = document.getElementById("pixCodigo")?.textContent; if (codigo) { navigator.clipboard.writeText(codigo); const btn = document.getElementById("btnCopiarPix"); btn.textContent = "✓ Código Copiado!"; btn.classList.add("copiado"); setTimeout(() => { btn.innerHTML = '<span>📋</span> Copiar Código'; btn.classList.remove("copiado"); }, 2000); } return; }
      if (e.target.dataset.action === 'voltar') { this.fecharModal('modalPix'); setTimeout(() => this.abrirModalPagamento(), 100); return; }
      if (e.target.classList.contains('btn-close-modal') || e.target.dataset.modal === 'modalPix') { if (confirm("Deseja cancelar o pagamento via PIX?")) this.fecharModal('modalPix'); return; }
      if (e.target === modalPix) { if (confirm("Deseja cancelar o pagamento via PIX?")) this.fecharModal('modalPix'); }
    });
  }
  abrirModalCartao(tipo) {
    this.fecharModal('modalPagamento');
    const titulo = tipo === 'credito' ? 'Cartão de Crédito' : 'Cartão de Débito';
    const totalSacola = document.getElementById("totalSacola"); if (!totalSacola) return;
    const totalCompra = totalSacola.textContent;
    const totalNumerico = parseFloat(totalCompra.replace(/[R$\s]/g, '').replace(',', '.'));
    let opcoesParcelamento = '';
    if (tipo === 'credito') opcoesParcelamento = `<div class="form-group"><label>Parcelas</label><select id="parcelas"><option value="1">1x de R$ ${totalNumerico.toFixed(2).replace('.', ',')} sem juros</option><option value="2">2x de R$ ${(totalNumerico / 2).toFixed(2).replace('.', ',')} sem juros</option><option value="3">3x de R$ ${(totalNumerico / 3).toFixed(2).replace('.', ',')} sem juros</option><option value="6">6x de R$ ${(totalNumerico / 6).toFixed(2).replace('.', ',')} sem juros</option><option value="12">12x de R$ ${(totalNumerico / 12).toFixed(2).replace('.', ',')} sem juros</option></select></div>`;
    const modalCartao = document.createElement("div"); modalCartao.className = "modal-overlay"; modalCartao.id = "modalCartao";
    modalCartao.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>${titulo}</h2><button class="btn-close-modal" data-modal="modalCartao">✕</button></div><form class="form-cartao" id="formCartao"><div class="form-group"><label>Número do Cartão</label><input type="text" id="numeroCartao" placeholder="0000 0000 0000 0000" maxlength="19" required></div><div class="form-group"><label>Nome no Cartão</label><input type="text" id="nomeCartao" placeholder="NOME COMPLETO" style="text-transform: uppercase;" required></div><div class="form-row"><div class="form-group"><label>Validade</label><input type="text" id="validade" placeholder="MM/AA" maxlength="5" required></div><div class="form-group"><label>CVV</label><input type="text" id="cvv" placeholder="123" maxlength="3" required></div></div>${opcoesParcelamento}<button type="submit" class="btn-confirmar-pagamento">Confirmar Pagamento</button></form></div>`;
    document.body.appendChild(modalCartao); setTimeout(() => modalCartao.classList.add("ativo"), 10);
    this.aplicarMascaras();
    const form = document.getElementById('formCartao'); if (form) form.onsubmit = (e) => { e.preventDefault(); this.finalizarCompraCartao(tipo); };
    modalCartao.addEventListener('click', (e) => { if (e.target === modalCartao || e.target.classList.contains('btn-close-modal') || e.target.dataset.modal === 'modalCartao') { this.fecharModal('modalCartao'); setTimeout(() => this.abrirModalPagamento(), 100); } });
  }
  aplicarMascaras() {
    const numeroCartaoInput = document.getElementById('numeroCartao');
    const validadeInput = document.getElementById('validade');
    const cvvInput = document.getElementById('cvv');
    if (numeroCartaoInput) numeroCartaoInput.addEventListener('input', e => { let v = e.target.value.replace(/\s/g, ''); e.target.value = v.match(/.{1,4}/g)?.join(' ') || v; });
    if (validadeInput) validadeInput.addEventListener('input', e => { let v = e.target.value.replace(/\D/g, ''); if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4); e.target.value = v; });
    if (cvvInput) cvvInput.addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
  }
  finalizarCompraCartao(tipo) {
    this.fecharModal('modalCartao');
    setTimeout(() => {
      const metodoPagamento = tipo === 'credito' ? 'Cartão de Crédito' : 'Cartão de Débito';
      const totalSacola = document.getElementById("totalSacola"); if (!totalSacola) return;
      const totalCompra = totalSacola.textContent;
      const totalNumerico = parseFloat(totalCompra.replace(/[R$\s]/g, '').replace(',', '.'));
      this.registrarVenda(metodoPagamento, totalNumerico);
      app.mostrarModalSucesso('Pagamento Confirmado!', `Seu pagamento via ${metodoPagamento} no valor de ${totalCompra} foi processado com sucesso.`);
      this.estado.limpar(); app.gerenciadorSacola.atualizar(); app.gerenciadorSacola.fechar();
    }, 1500);
  }
  fecharModal(modalId) { const modal = document.getElementById(modalId); if (modal) { if (modalId === 'modalPix' && this.estado.timerInterval) { clearInterval(this.estado.timerInterval); this.estado.timerInterval = null; } modal.classList.remove("ativo"); setTimeout(() => modal.remove(), 300); } }
}

class GerenciadorModais {
  abrirModalHorarios() {
    const modal = this.criarModal('modalHorarios', 'Horários de Atendimento', `<div class="horarios-container"><div class="horario-item"><span class="dia">Segunda a Sexta</span><span class="hora">09:00 - 18:00</span></div><div class="horario-item"><span class="dia">Sábado</span><span class="hora">09:00 - 14:00</span></div><div class="horario-item destaque"><span class="dia">Domingo</span><span class="hora">Fechado</span></div></div><div class="info-adicional"><p>Atendimento online disponível 24/7</p><p>WhatsApp: (85) 99999-9999</p></div><button class="btn-fechar-sucesso" data-modal="modalHorarios">Fechar</button>`);
    this.exibirModal(modal);
  }
  abrirModalPerguntas() {
    const modal = this.criarModal('modalPerguntas', 'Perguntas Frequentes', `<div class="perguntas-container"><div class="pergunta-item"><h3>Como funciona a entrega?</h3><p>Realizamos entregas em toda Fortaleza em até 3 dias úteis. Frete grátis para compras acima de R$ 200,00.</p></div><div class="pergunta-item"><h3>Posso trocar ou devolver?</h3><p>Sim! Você tem até 7 dias para trocar ou devolver produtos em perfeito estado.</p></div><div class="pergunta-item"><h3>Como funciona o pagamento?</h3><p>Aceitamos PIX, cartão de crédito (até 12x) e cartão de débito.</p></div><div class="pergunta-item"><h3>Vocês têm loja física?</h3><p>Sim! Nossa loja fica na Av. Beira Mar, 1234 - Fortaleza/CE.</p></div><div class="pergunta-item"><h3>Como saber meu tamanho?</h3><p>Cada produto possui uma tabela de medidas detalhada.</p></div></div><button class="btn-fechar-sucesso" data-modal="modalPerguntas">Fechar</button>`, 'modal-perguntas-content');
    this.exibirModal(modal);
  }
  abrirModalContato() {
    const modal = this.criarModal('modalContato', 'Entre em Contato', `<div class="contato-container"><div class="contato-item"><div class="contato-info"><h3>WhatsApp</h3><p>(85) 99999-9999</p><button class="btn-contato-acao" onclick="app.abrirWhatsApp()">Enviar Mensagem</button></div></div><div class="contato-item"><div class="contato-info"><h3>E-mail</h3><p>${CONFIG.EMAIL}</p><button class="btn-contato-acao" onclick="app.abrirEmail()">Enviar E-mail</button></div></div><div class="contato-item"><div class="contato-info"><h3>Endereço</h3><p>Av. Beira Mar, 1234<br>Meireles - Fortaleza/CE</p><button class="btn-contato-acao" onclick="app.abrirMaps()">Ver no Mapa</button></div></div><div class="contato-item"><div class="contato-info"><h3>Instagram</h3><p>@beachplease</p><button class="btn-contato-acao" onclick="app.abrirInstagram()">Seguir</button></div></div></div>`);
    this.exibirModal(modal);
  }
  mostrarModalSucesso(titulo, mensagem) {
    const modal = this.criarModal('modalSucesso', titulo, `<div class="modal-sucesso"><p>${mensagem}</p><button class="btn-fechar-sucesso" data-modal="modalSucesso">Continuar Comprando</button></div>`);
    this.exibirModal(modal);
  }
  criarModal(id, titulo, conteudo, classeExtra = '') {
    const modal = document.createElement("div"); modal.className = "modal-overlay"; modal.id = id;
    modal.innerHTML = `<div class="modal-content ${classeExtra}"><div class="modal-header"><h2>${titulo}</h2><button class="btn-close-modal" data-modal="${id}">✕</button></div>${conteudo}</div>`;
    return modal;
  }
  exibirModal(modal) {
    document.body.appendChild(modal); setTimeout(() => modal.classList.add("ativo"), 10);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { this.fecharModal(modal.id); return; }
      if (e.target.dataset.modal) { this.fecharModal(e.target.dataset.modal); return; }
      if (e.target.classList.contains('btn-close-modal')) { this.fecharModal(e.target.dataset.modal || modal.id); return; }
    });
  }
  fecharModal(modalId) { const modal = document.getElementById(modalId); if (modal) { modal.classList.remove("ativo"); setTimeout(() => modal.remove(), 300); } }
}

class GerenciadorFiltros {
  constructor(estado) { this.estado = estado; }
  filtrarPorTipo(tipo) {
    this.estado.categoriaAtiva = tipo;
    document.querySelectorAll('.categoria-item').forEach(item => item.classList.remove('ativo'));
    event.target.closest('.categoria-item')?.classList.add('ativo');
    const todosCards = document.querySelectorAll('.cardsCriados');
    todosCards.forEach(card => { const tipoCard = card.dataset.tipo || 'todos'; card.style.display = (tipo === 'todos' || tipoCard === tipo) ? 'flex' : 'none'; });
    ['.cardsVendidos', '.cardsPromocoes', '.cardsLancamentos'].forEach(selector => {
      const section = document.querySelector(selector); if (!section) return;
      const cardsVisiveis = [...section.querySelectorAll('.cardsCriados')].filter(card => card.style.display !== 'none');
      let mensagemExistente = section.querySelector('.mensagem-vazia');
      if (cardsVisiveis.length === 0 && tipo !== 'todos') { if (!mensagemExistente) section.innerHTML += '<div class="mensagem-vazia"><div class="icone-vazio">📦</div><h3>Não há produtos disponíveis</h3><p>Nenhum produto dessa categoria nesta seção</p></div>'; }
      else if (mensagemExistente) mensagemExistente.remove();
    });
  }
}

class GerenciadorSecoes {
  constructor(estado) { this.estado = estado; this.inicializar(); }
  inicializar() { if (!document.querySelector('.categorias-container')) return; this.criarBotoesSecoes(); this.mostrarSecao('lancamentos'); }
  criarBotoesSecoes() {
    const secoes = [{ id: 'lancamentos', titulo: 'LANÇAMENTOS' }, { id: 'promocoes', titulo: 'PROMOÇÕES' }, { id: 'vendidos', titulo: 'MAIS VENDIDOS' }];
    const container = document.createElement('div'); container.className = 'botoes-secoes';
    secoes.forEach(({ id, titulo }) => { const btn = document.createElement('button'); btn.className = `btn-secao ${id === 'lancamentos' ? 'ativo' : ''}`; btn.textContent = titulo; btn.dataset.secao = id; btn.onclick = () => this.mostrarSecao(id); container.appendChild(btn); });
    document.querySelector('.categorias-container')?.insertAdjacentElement('afterend', container);
  }
  mostrarSecao(secaoId) {
    this.estado.secaoAtiva = secaoId;
    document.querySelectorAll('.btn-secao').forEach(btn => { btn.classList.toggle('ativo', btn.dataset.secao === secaoId); });
    const todasSecoes = document.querySelectorAll('#colection');
    if (todasSecoes.length >= 3) { const secoes = { vendidos: todasSecoes[0], promocoes: todasSecoes[1], lancamentos: todasSecoes[2] }; Object.entries(secoes).forEach(([id, el]) => { if (el) el.style.display = id === secaoId ? 'block' : 'none'; }); }
  }
}

// CONTINUAÇÃO FINAL DO script.js - Cole após a Parte 2

class Aplicacao {
  constructor() {
    this.estado = new Estado();
    this.renderizador = new Renderizador();
    this.gerenciadorBusca = new GerenciadorBusca();
    this.gerenciadorSacola = new GerenciadorSacola(this.estado);
    this.gerenciadorMenu = new GerenciadorMenu();
    this.gerenciadorPagamento = new GerenciadorPagamento(this.estado);
    this.gerenciadorModais = new GerenciadorModais();
    this.gerenciadorFiltros = new GerenciadorFiltros(this.estado);
    this.gerenciadorSecoes = new GerenciadorSecoes(this.estado);
    this.inicializar();
  }

  inicializar() {
    this.gerenciadorBusca.inicializar();
    this.gerenciadorMenu.inicializar();
    this.renderizarProdutos();
    this.verificarProdutoBuscado();
    this.configurarIconeHome();
  }

  configurarIconeHome() {
    const homeIcons = document.querySelectorAll('.home-icon');
    homeIcons.forEach(icon => {
      icon.onclick = () => {
        const path = window.location.pathname;
        const isInPagesFolder = path.includes('/Pages/');
        // CORREÇÃO: Usar caminho relativo correto para GitHub Pages
        if (isInPagesFolder) {
          window.location.href = '../index.html';
        } else {
          // Se já na raiz, apenas recarregar ou ir para index
          window.location.href = 'index.html';
        }
      };
    });
  }

  verificarProdutoBuscado() {
    const produtoBuscado = sessionStorage.getItem('produtoBuscado');
    const secaoProduto = sessionStorage.getItem('secaoProduto');
    if (produtoBuscado && secaoProduto) {
      sessionStorage.removeItem('produtoBuscado');
      sessionStorage.removeItem('secaoProduto');
      const produto = JSON.parse(produtoBuscado);
      setTimeout(() => {
        if (this.gerenciadorSecoes) this.gerenciadorSecoes.mostrarSecao(secaoProduto);
        setTimeout(() => {
          this.gerenciadorBusca.buscarEDestacarCard(produto);
          setTimeout(() => {
            const cardDestacado = document.querySelector('.destaque-busca');
            if (cardDestacado) {
              const yOffset = -120;
              const y = cardDestacado.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }, 100);
        }, 400);
      }, 300);
    }
  }

  renderizarProdutos() {
    const sectionLancamento = document.querySelectorAll(".cardsLancamentos");
    const sectionPromocoes = document.querySelectorAll(".cardsPromocoes");
    const sectionVendidos = document.querySelectorAll(".cardsVendidos");
    if (sectionLancamento.length > 0) this.renderizador.renderizarComPaginacao(produtos.lancamentos, sectionLancamento, this.estado.paginaAtual.lancamentos, 'lancamentos');
    if (sectionPromocoes.length > 0) this.renderizador.renderizarComPaginacao(produtos.promocoes, sectionPromocoes, this.estado.paginaAtual.promocoes, 'promocoes');
    if (sectionVendidos.length > 0) this.renderizador.renderizarComPaginacao(produtos.maisVendidos, sectionVendidos, this.estado.paginaAtual.vendidos, 'vendidos');
  }

  adicionarNaSacola(produto) {
    this.estado.adicionarItem(produto);
    this.gerenciadorSacola.atualizar();
    // Animação na badge do footer
    const badgeFooter = document.getElementById('badgeSacolaFooter');
    if (badgeFooter) {
      badgeFooter.classList.remove('animando');
      void badgeFooter.offsetWidth; // Trigger reflow
      badgeFooter.classList.add('animando');
    }
  }

  abrirModalPagamento() { this.gerenciadorPagamento.abrirModalPagamento(); }
  abrirModalHorarios() { this.gerenciadorModais.abrirModalHorarios(); }
  abrirModalPerguntas() { this.gerenciadorModais.abrirModalPerguntas(); }
  abrirModalContato() { this.gerenciadorModais.abrirModalContato(); }
  mostrarModalSucesso(titulo, mensagem) { this.gerenciadorModais.mostrarModalSucesso(titulo, mensagem); }
  abrirWhatsApp() { window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de mais informações sobre os produtos.")}`, '_blank'); }
  abrirEmail() { window.location.href = `mailto:${CONFIG.EMAIL}?subject=Contato via Site`; }
  abrirMaps() { window.open("https://maps.google.com/?q=Av.+Beira+Mar,+1234+Fortaleza", '_blank'); }
  abrirInstagram() { window.open("https://instagram.com/beachplease", '_blank'); }
}

// Inicialização
const app = new Aplicacao();
window.filtrarPorTipo = (tipo) => app.gerenciadorFiltros.filtrarPorTipo(tipo);
window.app = app;

window.addEventListener('load', () => {
  const splash = document.getElementById('splashScreen');
  setTimeout(() => { if (splash) splash.style.display = 'none'; }, 1000);
});

document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splashScreen');
  if (splash) splash.style.display = 'flex';
});