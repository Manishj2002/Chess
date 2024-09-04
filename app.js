const express = require('express');
const socket = require('socket.io');
const { Chess } = require('chess.js');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socket(server);

let chess = new Chess();
let players = {};

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', { title: 'Chess Game' });
});

io.on('connection', (uniquesocket) => {
    console.log('A user connected:', uniquesocket.id);

    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit('playerRole', 'w');
        console.log('Player assigned to white:', uniquesocket.id);
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit('playerRole', 'b');
        console.log('Player assigned to black:', uniquesocket.id);
    } else {
        uniquesocket.emit('spectatorRole');
        console.log('Spectator connected:', uniquesocket.id);
    }

    uniquesocket.on('disconnect', () => {
        if (uniquesocket.id === players.white) {
            delete players.white;
            console.log('White player disconnected:', uniquesocket.id);
        } else if (uniquesocket.id === players.black) {
            delete players.black;
            console.log('Black player disconnected:', uniquesocket.id);
        } else {
            console.log('Spectator disconnected:', uniquesocket.id);
        }
    });

    uniquesocket.on('move', (move) => {
        try {
            if (chess.turn() === 'w' && uniquesocket.id !== players.white) return;
            if (chess.turn() === 'b' && uniquesocket.id !== players.black) return;

            let result = chess.move(move);

            if (result) {
                io.emit('move', move);
                io.emit('boardState', chess.fen());
            } else {
                uniquesocket.emit('invalidMove', move);
            }
        } catch (error) {
            console.log(error);
            uniquesocket.emit('invalidMove', move);
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});







// io.on('connection',function (uniquesocket) {
//     console.log('connected')

//     uniquesocket.on('fubuki',function () {
//         console.log('fubuki is so hot')

//         io.emit('makima')
//     })

//     uniquesocket.on('disconnect',function () {
//         console.log('disconnect')
//     })
// })