const express = require('express');
const { createServer } = require('node:http');
const app = express();
const server = createServer(app);
const io = require('socket.io')(server);

let jogadores = {}; 

app.use(express.static(__dirname));

setInterval(() => {
    io.emit('atualizarJogadores', jogadores);
}, 1000 / 30); 

io.on('connect', (socket) => {
    jogadores[socket.id] = {
        id: socket.id,
        x: 100,
        y: 100,
        virado1: 'nenhuma',
        direcao1: {
            cima: false,
            baixo: false, 
            esquerda: false,
            direita: false,
            atacar: false,
        }
    };
    console.log(`O jogador ${socket.id} se conectou`);

    socket.on('mover', (direcao, virado) => {
        const jogador = jogadores[socket.id];
        if (jogador) {
            jogador.direcao1 = direcao; 
            jogador.virado1 = virado;
            if (direcao.baixo) {
                jogador.y += 10;
            }
            if (direcao.cima) {
                jogador.y -= 10;
            }
            if (direcao.esquerda) {
                jogador.x -= 10;
            }
            if (direcao.direita) {
                jogador.x += 10;
            }
        }
    });

    socket.on('disconnect', () => {
        delete jogadores[socket.id];
        console.log(`O jogador ${socket.id} saiu`);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
