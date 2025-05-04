const socket = io();
let mouseX = 0;
let mouseY = 0;



let janelalargura = window.innerWidth - 20;
let janelaaltura = window.innerHeight - 80;
let canvas = document.getElementById('desenho1');

let ctx = canvas.getContext('2d');

let sprite = new Image();
sprite.src = 'spritescup.png';
let virado = 'nenhuma'
let jogadores = {};
let largSprite = 0;
let altSprite = 0;
let numsprites = 10;
let sourceY = 0
let direcao = {
    cima: false,
    baixo: false,
    esquerda: false,
    direita: false,
    atacar: false
};

let meuId = null;

sprite.addEventListener('load', () => {
    largSprite = 64
    altSprite = 64
});

socket.on('connect', () => {
    meuId = socket.id;
});

socket.on('atualizarJogadores', (dados) => {
    for (const id in dados) {
        if (!jogadores[id]) {
            jogadores[id] = {
                ...dados[id],
                numSprite: 0,
                sourceY: 0
            };
        } else {
            jogadores[id].x = dados[id].x;
            jogadores[id].y = dados[id].y;
            jogadores[id].direcao1 = dados[id].direcao1;
            jogadores[id].virado1 = dados[id].virado1;
        }
    }

    for (const id in jogadores) {
        if (!dados[id]) {
            delete jogadores[id];
        }
    }
});


setInterval(() => {
    for (const id in jogadores) {
        const jogador = jogadores[id];

        if (jogador.direcao1.direita || jogador.direcao1.esquerda) {
            jogador.sourceY = 0; // Linha da movimentação

            jogador.numSprite++;

            if (jogador.numSprite > 15) { // Número de frames andando
                jogador.numSprite = 0;
            }

            if (jogador.direcao1.direita) {
                jogador.virado1 = 'direita';
            }
            if (jogador.direcao1.esquerda) {
                jogador.virado1 = 'esquerda';
            }

        } else {
            jogador.sourceY = 1 * altSprite; // Linha da animação parado

            jogador.numSprite++;

            if (jogador.numSprite > 4) { // Número de frames de parado
                jogador.numSprite = 0;
            }
        }
    }
}, 50);


function desenhar() {
      

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    janelaaltura = window.innerHeight - 80;
    janelalargura = window.innerWidth - 20;
    canvas.height = janelaaltura;
    canvas.width = janelalargura;
    for (const id in jogadores) {
        const jogador = jogadores[id];
        ctx.save(); // Salva o contexto ANTES de qualquer modificação
        
        if (jogador.virado1 === 'esquerda') {
            ctx.scale(-1, 1);
            ctx.drawImage(
                sprite,
                jogador.numSprite * largSprite, jogador.sourceY, largSprite, altSprite,
                -jogador.x - largSprite, jogador.y, largSprite, altSprite
            );
        }else { 
            ctx.drawImage(
                sprite,
                jogador.numSprite * largSprite, jogador.sourceY, largSprite, altSprite,
                jogador.x, jogador.y, largSprite, altSprite
            );
        }

        ctx.restore(); // Restaura o contexto depois de desenhar esse jogador
    }

    requestAnimationFrame(desenhar);
}


requestAnimationFrame(desenhar);

// Controle de movimento
window.addEventListener('keydown', (e) => {
    window.addEventListener('keydown', (e) => {
        if (e.key === 'w') direcao.cima = true;
        if (e.key === 's') direcao.baixo = true;
        if (e.key === 'a') {
            direcao.esquerda = true;
            virado = 'esquerda';
        }
        if (e.key === 'd') {
            direcao.direita = true;
            virado = 'direita';
        }
    });
    
});
canvas.addEventListener('click', (event) => {
    direcao.atacar = true
    socket.emit('mover', direcao);
})
canvas.addEventListener("mousemove", function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const jogador = jogadores[meuId];
    if (!jogador) return;

    let dx = mouseX - jogador.x;
    let dy = mouseY - jogador.y;

    let angle = Math.atan2(dy, dx);

    if (angle > -Math.PI/4 && angle <= Math.PI/4) {
        virado = 'direita';
    } else if (angle > Math.PI/4 && angle <= 3*Math.PI/4) {
        virado = 'baixo';
    } else if (angle <= -Math.PI/4 && angle > -3*Math.PI/4) {
        virado = 'cima';
    } else {
        virado = 'esquerda';
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') direcao.cima = false;
    if (e.key === 's') direcao.baixo = false;
    if (e.key === 'a') direcao.esquerda = false;
    if (e.key === 'd') direcao.direita = false;
});


setInterval(() => {
    socket.emit('mover', direcao, virado);
}, 50);

const joystick = nipplejs.create({
    zone: document.getElementById('joystick-zone'),
    mode: 'static',
    position: { left: '50px', bottom: '50px' },
    color: 'blue'
  });

  joystick.on('move', (evt, data) => {
    direcao.cima = false;
    direcao.baixo = false;
    direcao.esquerda = false;
    direcao.direita = false;

    if (data && data.direction) {
        const angle = data.direction.angle;

        if (angle === 'up') {
            direcao.cima = true;
            virado = 'cima';
        }
        if (angle === 'right') {
            direcao.direita = true;
            virado = 'direita';
        }
        if (angle === 'left') {
            direcao.esquerda = true;
            virado = 'esquerda';
        }
        if (angle === 'down') {
            direcao.baixo = true;
            virado = 'baixo';
        }
    }
});

joystick.on('end', () => {
    direcao.cima = false;
    direcao.baixo = false;
    direcao.esquerda = false;
    direcao.direita = false;
});