const state = {
    questao: { corretas: [] },
    cipo: { ansAndar: 0, ansTotal: 0 },
    biscoito: { restantes: 0, ansM1: 0, ansM2: 0 },
    gas: {
        nodes: 0, isDrawing: false, startNode: null, lines: [], labels: [], counts: {},
        ansSuficiente: '', ansQtde: 0, map: {}
    }
};

function openGame(gameId, title) {
    const icones = {
        'gasolina': '🚗',
        'cipo': '🐒',
        'biscoito': '🍪',
        'questao': '🧠'
    };
    document.getElementById('screen-menu').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    document.getElementById('lbl-game-title').innerText = title;
    document.getElementById('lbl-game-icon').innerText = icones[gameId]; // Adiciona essa linha


    const container = document.getElementById('game-contents');
    const template = document.getElementById('tpl-' + gameId);
    container.innerHTML = '';
    container.appendChild(template.content.cloneNode(true));

    switchTab('problema');

    if (gameId === 'cipo') initCipo();
    if (gameId === 'biscoito') initBiscoito();
    if (gameId === 'gasolina') initGasolina();
    if (gameId === 'questao') initQuestao();
}

function closeGame() {
    document.getElementById('screen-game').classList.remove('active');
    document.getElementById('screen-menu').classList.add('active');
    document.getElementById('game-contents').innerHTML = '';
}

window.switchTab = function(target) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-tab-' + target).classList.add('active');

    document.querySelectorAll('#game-contents .tab-section').forEach(sec => {
        sec.classList.remove('active');
        if (sec.classList.contains(target)) sec.classList.add('active');
    });
};

function setupDraggable(selector, toolboxId, stageId, onDropCb) {
    const items = document.querySelectorAll(selector);
    const toolbox = document.getElementById(toolboxId);
    const stage = document.getElementById(stageId);
    let activeItem = null, offX, offY;

    items.forEach(item => {
        item.addEventListener('pointerdown', e => {
            if(item.classList.contains('drawing-mode')) return;

            const r = item.getBoundingClientRect();
            offX = e.clientX - r.left;
            offY = e.clientY - r.top;

            activeItem = item;
            item.classList.add('is-dragging');

            if (item.parentElement === toolbox) {
                const placeholder = document.createElement('div');
                placeholder.style.width = r.width + 'px';
                placeholder.style.height = r.height + 'px';
                placeholder.style.flexShrink = '0';
                toolbox.insertBefore(placeholder, item);

                const stageRect = stage.getBoundingClientRect();
                item.style.position = 'absolute';
                item.style.margin = '0';
                
                item.style.left = (r.left - stageRect.left) + 'px';
                item.style.top = (r.top - stageRect.top) + 'px';

                stage.appendChild(item);
                if (onDropCb) onDropCb(item);
            }

            item.setPointerCapture(e.pointerId);
        });

        item.addEventListener('pointermove', e => {
            if (activeItem !== item) return;
            const sr = stage.getBoundingClientRect();
            
            let x = e.clientX - sr.left - offX;
            let y = e.clientY - sr.top - offY;
            
            x = Math.max(-20, Math.min(x, sr.width - item.offsetWidth + 20));
            y = Math.max(-20, Math.min(y, sr.height - item.offsetHeight + 20));
            
            item.style.left = x + 'px';
            item.style.top = y + 'px';
        });

        item.addEventListener('pointerup', e => {
            if (activeItem === item) {
                item.classList.remove('is-dragging');
                activeItem.releasePointerCapture(e.pointerId);
                activeItem = null;
            }
        });
    });
}

/* ==========================================
   CIPÓ
   ========================================== */
function initCipo() {
    const stage = document.getElementById('stage-cipo');
    stage.innerHTML = '<div class="canopy"></div><div class="trunk"></div>';
    
    for (let i = 0; i <= 10; i++) {
        const f = document.createElement('div'); f.className = 'floor';
        f.innerHTML = `<div class="plank"><div class="floor-number">${i}</div></div>`;
        stage.appendChild(f);
    }
    setupDraggable('.cipo-item', 'tb-cipo', 'stage-cipo');

    const sobe1 = 4 + Math.floor(Math.random() * 3); 
    const desce1 = 2 + Math.floor(Math.random() * 2); 
    const andarAtual = sobe1 - desce1;
    const sobe2 = 2 + Math.floor(Math.random() * (10 - andarAtual)); 

    state.cipo.ansAndar = andarAtual + sobe2;
    state.cipo.ansTotal = sobe1 + desce1 + sobe2 + state.cipo.ansAndar; 

    const story = document.querySelector('#game-contents .story-box');
    if(story) {
        story.innerHTML = `
            <p>O macaquinho Quico precisa entregar <strong>3 caixas</strong> no Prédio da Árvore Gigante de 10 andares.</p>
            <p>Ele entrou no elevador lá no Andar 0 e começou seu trabalho:</p>
            <ul>
                <li>Subiu ${sobe1} andares e deixou a 1ª caixa.</li>
                <li>Desceu ${desce1} andares e entregou a 2ª caixa.</li>
                <li>Subiu ${sobe2} andares e entregou a última caixa.</li>
                <li>Com o trabalho concluído ele desceu direto ao Andar 0.</li>
            </ul>
        `;
    }
}

window.verificarCipo = function() {
    const rAndar = parseInt(document.getElementById('ansAndar').value);
    const rTotal = parseInt(document.getElementById('ansTotal').value);
    const msg = document.getElementById('msgCipo');
    
    msg.className = 'feedback-msg';
    if (rAndar === state.cipo.ansAndar && rTotal === state.cipo.ansTotal) {
        showSuccessModal();
        msg.style.display = 'none';
    } else if (rAndar === state.cipo.ansAndar) {
        msg.textContent = "Andar certo! Mas reconte o total de movimentos. 🧮";
        msg.classList.add('error');
    } else {
        msg.textContent = "Incorreto. Vá na aba 'Brincar' e simule com as caixas! 🌳";
        msg.classList.add('error');
    }
};

/* ==========================================
   BISCOITOS
   ========================================== */
const coresB = { choc: '#5D4037', morango: '#FF6B8B', avela: '#E6A15C' };
const svgsB = {
    redondo: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="CURRENT_COLOR"/></svg>`,
    quadrado: `<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" fill="CURRENT_COLOR"/></svg>`,
    estrela: `<svg viewBox="0 0 100 100"><polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="CURRENT_COLOR"/></svg>`,
    coracao: `<svg viewBox="0 0 100 100"><path d="M50,90 L43,83 C18,60 5,45 5,30 C5,15 15,5 30,5 C40,5 47,10 50,18 C53,10 60,5 70,5 C85,5 95,15 95,30 C95,45 82,60 57,83 L50,90 Z" fill="CURRENT_COLOR"/></svg>`
};

function mostrarToastBiscoito() {
    const board = document.getElementById('b-board');
    if (!board) return;

    // Remove o toast anterior se o usuário clicar muito rápido
    const existingToast = document.getElementById('biscoito-toast');
    if (existingToast) existingToast.remove();

    // Cria o novo toast
    const toast = document.createElement('div');
    toast.id = 'biscoito-toast';
    toast.className = 'toast-instruction'; // Aproveita os estilos e animações que já existem[cite: 1]
    toast.innerHTML = `🍪 Restam criar: <strong>${state.biscoito.restantes}</strong>`;
    
    board.appendChild(toast);

    // O toast some sozinho depois de 4 segundos
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 4000);
}

function initBiscoito() {
    const m1Foge = 2 + Math.floor(Math.random() * 4); // Quadrados de chocolate
    const m2Foge = 3 + Math.floor(Math.random() * 4); // Morangos estrela

    // Arrumando a conta total de fugitivos (chocolate + estrelas)
    state.biscoito.ansM1 = m1Foge + m2Foge;

    // Separando os que ficam por sabor
    const morangoFica = 2 + Math.floor(Math.random() * 3);
    const avelaFica = 2 + Math.floor(Math.random() * 3);
    const m2Fica = 2 + Math.floor(Math.random() * 3); // Coração sem chocolate

    // Salvando a resposta exata de morangos que ficam
    state.biscoito.ansM2 = morangoFica;

    state.biscoito.restantes = m1Foge + morangoFica + avelaFica + m2Foge + m2Fica;
    mostrarToastBiscoito();

    const story = document.querySelector('#game-contents .story-box');
    if(story) {
        story.innerHTML = `
            <p>A vovó fez <strong>${state.biscoito.restantes} biscoitos mágicos</strong>, mas eles seguem uma regra mágica: se tiver chocolate ou formato de estrela, ele cria perninhas e foge!</p>
            <ul>
                <li>${morangoFica} de morango e ${avelaFica} de avelã em formatos redondos.</li>
                <li>${m1Foge} biscoitos quadrados de chocolate.</li>
                <li>${m2Foge} biscoitos de morango com forma de estrela.</li>
                <li>E o resto eram de coração sem chocolate.</li>
            </ul>
        `;
    }
}

window.criarBiscoitoHandler = function() {
    if (state.biscoito.restantes <= 0) return;
    state.biscoito.restantes--;
    mostrarToastBiscoito();
    
    const board = document.getElementById('b-board');
    const sabor = document.getElementById('b-sabor').value;
    const formato = document.getElementById('b-formato').value;
    
    const cookie = document.createElement('div');
    cookie.className = 'cookie';
    cookie.innerHTML = svgsB[formato].replace('CURRENT_COLOR', coresB[sabor]);

    const bRect = board.getBoundingClientRect();
    cookie.style.left = `${(bRect.width / 2) - 32 + (Math.random() * 40 - 20)}px`;
    cookie.style.top = `20px`;

    let isDragging = false, startX, startY, initL, initT;
    const trash = document.getElementById('b-trash');

    cookie.addEventListener('pointerdown', e => {
        isDragging = true; startX = e.clientX; startY = e.clientY;
        initL = cookie.offsetLeft; initT = cookie.offsetTop;
        cookie.classList.add('is-dragging');
        cookie.setPointerCapture(e.pointerId);
    });

    cookie.addEventListener('pointermove', e => {
        if (!isDragging) return;
        cookie.style.left = `${initL + (e.clientX - startX)}px`;
        cookie.style.top = `${initT + (e.clientY - startY)}px`;
    });

    cookie.addEventListener('pointerup', e => {
        if (!isDragging) return;
        isDragging = false;
        cookie.classList.remove('is-dragging');
        cookie.releasePointerCapture(e.pointerId);

        const cR = cookie.getBoundingClientRect();
        const tR = trash.getBoundingClientRect();

        if (cR.left < tR.right && cR.right > tR.left && cR.top < tR.bottom && cR.bottom > tR.top) {
            cookie.style.transform = 'scale(0)';
            setTimeout(() => cookie.remove(), 150);
            state.biscoito.restantes++;
            mostrarToastBiscoito();
        }
    });

    board.appendChild(cookie);
};

window.verificarBiscoito = function() {
    const v1 = parseInt(document.getElementById('respM1').value);
    const v2 = parseInt(document.getElementById('respM2').value);
    const msg = document.getElementById('msgBiscoito');
    
    msg.className = 'feedback-msg';
    
    if (v1 === state.biscoito.ansM1 && v2 === state.biscoito.ansM2) {
        showSuccessModal();
        msg.style.display = 'none';
    } else {
        msg.textContent = "Ops! Confira a quantidade de fugitivos e de morangos na mesa. 🍪";
        msg.classList.add('error');
    }
};

/* ==========================================
   GASOLINA
   ========================================== */
function initGasolina() {
    state.gas = { nodes: 0, isDrawing: false, startNode: null, lines: [], labels: [], counts: {}, map: {} };

    const dEleonora = 4 + Math.floor(Math.random() * 4); 
    const dPadaria = 1 + Math.floor(Math.random() * 3);  
    const dPosto = 2 + Math.floor(Math.random() * 4);    

    state.gas.map = {
        'n-eleonora|n-olivia': dEleonora, 
        'n-eleonora|n-padaria': dPadaria, 
        'n-eleonora|n-posto': dPosto,
        'n-olivia|n-padaria': dEleonora + dPadaria,
        'n-olivia|n-posto': dEleonora + dPosto,
        'n-padaria|n-posto': dPadaria + dPosto
    };

    const gastoGeral = dEleonora + (dPadaria * 2) + dPosto;
    const variacaoSorte = Math.floor(Math.random() * 7) - 3; 
    const combAtual = gastoGeral + variacaoSorte;

    state.gas.ansSuficiente = (combAtual >= gastoGeral) ? 'sim' : 'nao';
    state.gas.ansQtde = Math.abs(combAtual - gastoGeral);

    const story = document.querySelector('#game-contents .story-box');
    if(story) {
        story.innerHTML = `
            <p>Leopoldo foi deixar Olívia na casa da Eleonora. Antes de partirem, a luz da gasolina acendeu indicando que só dava para andar mais <strong>${combAtual} km</strong>. A casa da Eleonora ficava a <strong>${dEleonora} km</strong> dali.
            Ao chegarem, viram a gatinha Cristal fugindo. Foram atrás dela de carro por mais <strong>${dPadaria} km</strong>, pegaram a gata em uma padaria e voltaram para a casa da Eleonora. Olívia e Cristal ficaram lá, e Leopoldo foi ao posto que fica a <strong>${dPosto} km</strong> da casa da Eleonora.</p>
            <p class="highlight-text">A gasolina foi suficiente para ele chegar ao posto?</p>
        `;
    }

    setupDraggable('.gas-item', 'tb-gas', 'stage-gas');

    const stage = document.getElementById('stage-gas');
    const tempLine = document.getElementById('temp-line');
    const allNodes = document.querySelectorAll('.gas-item');

    allNodes.forEach(node => {
        node.addEventListener('pointerdown', (e) => {
            if (!state.gas.isDrawing) return;
            
            state.gas.startNode = node;
            node.classList.add('selected');
            node.setPointerCapture(e.pointerId);
        });
    });

    stage.addEventListener('pointermove', e => {
        if (state.gas.isDrawing && state.gas.startNode) {
            const sR = stage.getBoundingClientRect();
            const nR = state.gas.startNode.getBoundingClientRect();
            
            const sX = nR.left - sR.left + nR.width / 2;
            const sY = nR.top - sR.top + nR.height / 2;
            
            const eX = e.clientX - sR.left;
            const eY = e.clientY - sR.top;
            
            tempLine.setAttribute('d', `M ${sX} ${sY} L ${eX} ${eY}`);

            allNodes.forEach(n => {
                if (n === state.gas.startNode) return;
                
                const r = n.getBoundingClientRect();
                
                if (e.clientX >= r.left && e.clientX <= r.right && 
                    e.clientY >= r.top && e.clientY <= r.bottom) {
                    
                    criarLinhaGas(state.gas.startNode, n);
                    
                    state.gas.startNode.releasePointerCapture(e.pointerId);
                    state.gas.startNode.classList.remove('selected');
                    state.gas.startNode = null;
                    tempLine.setAttribute('d', ''); 
                }
            });
        }
    });

    stage.addEventListener('pointerup', e => {
        if (state.gas.isDrawing && state.gas.startNode) {
            state.gas.startNode.releasePointerCapture(e.pointerId);
            state.gas.startNode.classList.remove('selected');
            state.gas.startNode = null;
            tempLine.setAttribute('d', '');
        }
    });
}

window.toggleDrawingGas = function() {
    state.gas.isDrawing = !state.gas.isDrawing;
    const btn = document.getElementById('btnAcaoGas');
    const nodes = document.querySelectorAll('.gas-item');
    const stage = document.getElementById('stage-gas'); // Pegamos o palco para colocar o popup
    
    if (state.gas.isDrawing) {
        btn.textContent = "Clique para mover os locais";
        btn.style.background = "var(--danger)";
        btn.style.boxShadow = "0 6px 0 #b91c1c";
        nodes.forEach(n => n.classList.add('drawing-mode'));

        // --- CÓDIGO DO POPUP COMEÇA AQUI ---
        // Se já tiver um popup na tela, removemos antes de criar outro
        const existingToast = document.getElementById('gas-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'gas-toast';
        toast.className = 'toast-instruction';
        toast.innerHTML = '👆 <strong>Toque e arraste</strong> para ligar os locais!';
        stage.appendChild(toast);

        // O popup some sozinho depois de 4 segundos (combinando com a animação do CSS)
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 4000);
        // --- CÓDIGO DO POPUP TERMINA AQUI ---

    } else {
        btn.textContent = "Clique para traçar distâncias";
        btn.style.background = "var(--primary)";
        btn.style.boxShadow = "0 6px 0 var(--primary-dark)";
        nodes.forEach(n => n.classList.remove('drawing-mode', 'selected'));
        state.gas.lines.forEach(p => p.remove());
        state.gas.labels.forEach(l => l.remove());
        state.gas.lines = []; state.gas.labels = []; state.gas.counts = {};
        document.getElementById('temp-line').setAttribute('d', '');
        state.gas.startNode = null;
        
        // Se o usuário clicar pra cancelar antes do tempo, removemos a mensagem na hora
        const existingToast = document.getElementById('gas-toast');
        if (existingToast) existingToast.remove();
    }
};

function criarLinhaGas(nA, nB) {
    const sR = document.getElementById('stage-gas').getBoundingClientRect();
    const rA = nA.getBoundingClientRect(), rB = nB.getBoundingClientRect();
    const x1 = rA.left - sR.left + rA.width / 2, y1 = rA.top - sR.top + rA.height / 2;
    const x2 = rB.left - sR.left + rB.width / 2, y2 = rB.top - sR.top + rB.height / 2;

    const pair = [nA.id, nB.id].sort(), key = pair.join('|');
    const count = state.gas.counts[key] || 0;
    state.gas.counts[key] = count + 1;

    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / dist, ny = dx / dist;
    
    let offset = 40 + Math.floor(count / 2) * 40;
    if (count % 2 === 1) offset *= -1;
    if (nA.id !== pair[0]) offset *= -1;

    const cx = mx + nx * offset, cy = my + ny * offset;

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
    document.getElementById('gas-svg').appendChild(pathEl);
    state.gas.lines.push(pathEl);

    const label = document.createElement('div');
    label.className = 'dist-label';
    label.innerText = state.gas.map[key] ? `${state.gas.map[key]} km` : '? km';
    label.style.left = `${0.25 * x1 + 0.5 * cx + 0.25 * x2}px`;
    label.style.top = `${0.25 * y1 + 0.5 * cy + 0.25 * y2}px`;
    document.getElementById('stage-gas').appendChild(label);
    state.gas.labels.push(label);
}

window.verificarGas = function() {
    const radioSim = document.querySelector('input[name="g-suficiente"]:checked');
    const qtde = parseInt(document.getElementById('qtdCombustivel').value);
    const msg = document.getElementById('msgGas');
    
    msg.className = 'feedback-msg';
    if (!radioSim || isNaN(qtde)) {
        msg.textContent = "Preencha todas as respostas.";
        msg.classList.add('error');
        return;
    }

    if (radioSim.value === state.gas.ansSuficiente && qtde === state.gas.ansQtde) {
        showSuccessModal();
        msg.style.display = 'none';
    } else {
        msg.textContent = "Algo não bateu! Tente refazer o trajeto na aba Brincar.";
        msg.classList.add('error');
    }
};
window.showSuccessModal = function() {
    document.getElementById('success-modal').classList.add('active');
};

window.closeSuccessModal = function() {
    document.getElementById('success-modal').classList.remove('active');
    closeGame(); // Isso garante a volta para a página inicial
};






/* ==========================================
   QUESTÃO DE QUESTÕES
   ========================================== */
const bancoQuestoes = [
    {
        historia: "O robô Zeca deu 15 passos para frente e 8 para trás. Quantos passos de distância ele está do ponto de partida?",
        opcoes: [
            "Desenhar uma reta, marcar 15 tracinhos pra frente e apagar 8", 
            "Fazer a continha de subtração: 15 - 8", 
            "Somar todos os passos que ele deu no total", 
            "Desenhar 15 robôs e apagar 8"
        ],
        corretas: [0, 1]
    },
    {
        historia: "A caixa tem 24 chocolates e você precisa dividir igualmente para 4 amigos. Quantos chocolates cada amigo vai receber?",
        opcoes: [
            "Desenhar 4 bonequinhos e ir distribuindo risquinhos um por um até dar 24", 
            "Armar a conta de divisão: 24 ÷ 4", 
            "Multiplicar 24 por 4", 
            "Fazer a conta de menos: 24 - 4"
        ],
        corretas: [0, 1]
    },
    {
        historia: "Para fazer 2 bolos a receita pede 6 ovos. Quantos ovos usamos para fazer apenas 1 bolo?",
        opcoes: [
            "Desenhar 6 bolinhas e separar em dois grupos iguais", 
            "Fazer a conta: 6 dividido por 2", 
            "Anotar o triplo do número 6", 
            "Somar 6 ovos com 2 bolos"
        ],
        corretas: [0, 1]
    },
    {
        historia: "Um trem saiu da cidade às 8h da manhã e chegou ao destino às 11h. Quantas horas durou essa viagem?",
        opcoes: [
            "Desenhar um relógio e contar os pulos do 8 até o 11", 
            "Fazer a continha de subtração: 11 - 8", 
            "Contar nos dedos partindo do 8: nove, dez, onze", 
            "Somar 8 mais 11"
        ],
        corretas: [0, 1, 2]
    },
    {
        historia: "Você guardou R$ 20, mas quer comprar um jogo que custa R$ 50. Quanto dinheiro ainda falta pra você conseguir comprar?",
        opcoes: [
            "Desenhar notas de 10 reais até chegar no 50 e ver quantas a mais precisou", 
            "Armar a conta de menos: 50 - 20", 
            "Somar 50 com 20", 
            "Dividir 50 por 20"
        ],
        corretas: [0, 1]
    },
    {
        historia: "Um prédio tem 5 andares. Em cada andar existem 4 janelas. Quantas janelas tem o prédio todo?",
        opcoes: [
            "Desenhar um prédio com 5 andares, colocar 4 bolinhas em cada e contar tudo", 
            "Fazer a conta de multiplicação: 5 x 4", 
            "Somar o número 4 cinco vezes: 4 + 4 + 4 + 4 + 4", 
            "Desenhar apenas 4 janelas no quadro"
        ],
        corretas: [0, 1, 2]
    },
    {
        historia: "A formiga andou 10cm, parou para descansar, e depois andou mais 15cm na mesma direção. Quantos centímetros ela andou ao todo?",
        opcoes: [
            "Fazer a conta de adição: 10 + 15", 
            "Desenhar uma linha anotando 10, outra anotando 15 na frente e ver o tamanho total", 
            "Subtrair 10 de 15", 
            "Multiplicar 10 por 15"
        ],
        corretas: [0, 1]
    },
    {
        historia: "Você comprou 3 pacotes de figurinhas. Cada pacote veio com 5 figurinhas repetidas dentro. Quantas repetidas você tirou no total?",
        opcoes: [
            "Desenhar 3 quadradinhos e colocar o número 5 dentro de cada um para somar", 
            "Fazer a conta de vezes: 3 x 5", 
            "Dividir 5 por 3",
            "Fazer a conta de menos: 5 - 3"
        ],
        corretas: [0, 1]
    },
    {
        historia: "Seu livro da escola tem 100 páginas no total. Você já leu 40 páginas. Quantas páginas faltam para terminar o livro?",
        opcoes: [
            "Fazer a conta de subtração: 100 - 40", 
            "Desenhar 10 barrinhas valendo 10 cada e apagar 4 delas", 
            "Somar 100 mais 40", 
            "Multiplicar 100 por 40"
        ],
        corretas: [0, 1]
    }
];

let qCanvasCtx = null;

function initQuestao() {
    // Sorteia a questão
    const sorteada = bancoQuestoes[Math.floor(Math.random() * bancoQuestoes.length)];
    state.questao.corretas = sorteada.corretas;

    // Popula a história
    document.getElementById('q-story').innerHTML = `<p class="highlight-text" style="text-align:left; margin-top:0">${sorteada.historia}</p>`;

    // Popula os checkboxes
    const container = document.getElementById('q-opcoes');
    container.innerHTML = '';
    sorteada.opcoes.forEach((op, index) => {
        container.innerHTML += `
            <label class="radio-label">
                <input type="checkbox" value="${index}" class="q-checkbox">
                ${op}
            </label>
        `;
    });

    // Inicia o Canvas (com setTimeout para dar tempo da div renderizar)
    setTimeout(setupCanvas, 50);
}

function setupCanvas() {
    const canvas = document.getElementById('draw-canvas');
    if (!canvas) return;
    
    qCanvasCtx = canvas.getContext('2d');
    qCanvasCtx.lineCap = 'round';
    qCanvasCtx.lineJoin = 'round';
    qCanvasCtx.lineWidth = 10;
    qCanvasCtx.strokeStyle = '#334155';

    let drawing = false;

    // Converte a posição da tela para os 800x800 reais do canvas interno
    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    canvas.addEventListener('pointerdown', (e) => {
        drawing = true;
        const pos = getPos(e);
        qCanvasCtx.beginPath();
        qCanvasCtx.moveTo(pos.x, pos.y);
        canvas.setPointerCapture(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
        if (!drawing) return;
        const pos = getPos(e);
        qCanvasCtx.lineTo(pos.x, pos.y);
        qCanvasCtx.stroke();
    });

    canvas.addEventListener('pointerup', (e) => {
        drawing = false;
        canvas.releasePointerCapture(e.pointerId);
    });
}

window.setFerramentaCanvas = function(tipo) {
    document.querySelectorAll('.btn-tool').forEach(b => b.classList.remove('active'));
    document.getElementById('tool-' + tipo).classList.add('active');

    if (!qCanvasCtx) return;

    if (tipo === 'lapis') {
        qCanvasCtx.globalCompositeOperation = 'source-over';
        qCanvasCtx.lineWidth = 10;
    } else {
        qCanvasCtx.globalCompositeOperation = 'destination-out';
        qCanvasCtx.lineWidth = 50; // Borracha grandona
    }
};

window.limparCanvas = function() {
    if (qCanvasCtx) {
        const canvas = document.getElementById('draw-canvas');
        qCanvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

window.verificarQuestao = function() {
    const marcadas = Array.from(document.querySelectorAll('.q-checkbox:checked')).map(cb => parseInt(cb.value));
    const corretas = state.questao.corretas;

    const msg = document.getElementById('msgQuestao');
    msg.className = 'feedback-msg';

    if (marcadas.length === 0) {
        msg.textContent = "Marque pelo menos uma opção! 📝";
        msg.classList.add('error');
        return;
    }

    let qtdAcertos = 0;
    let qtdErros = 0;

    marcadas.forEach(val => {
        if (corretas.includes(val)) {
            qtdAcertos++;
        } else {
            qtdErros++;
        }
    });

    if (qtdAcertos === corretas.length && qtdErros === 0) {
        showSuccessModal();
        msg.style.display = 'none';
    } else if (qtdAcertos > 0 && qtdErros > 0) {
        msg.textContent = "Você acertou uma e errou outra! Revise suas escolhas. 🤔";
        msg.classList.add('error');
    } else if (qtdAcertos > 0 && qtdAcertos < corretas.length && qtdErros === 0) {
        msg.textContent = "Quase lá! Há mais de uma forma correta de resolver. 🕵️‍♂️";
        msg.classList.add('error');
    } else {
        msg.textContent = "Ops, não é bem por aí. Pense mais um pouquinho e tente de novo! 😅";
        msg.classList.add('error');
    }
};