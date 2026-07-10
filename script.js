const state = {
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
        'biscoito': '🍪'
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
    document.getElementById('b-contadorVal').innerText = state.biscoito.restantes;

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
    document.getElementById('b-contadorVal').innerText = state.biscoito.restantes;
    
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
            document.getElementById('b-contadorVal').innerText = state.biscoito.restantes;
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
        btn.textContent = "Mover locais";
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
        btn.textContent = "Ligar Distâncias";
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