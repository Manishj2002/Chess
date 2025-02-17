const socket = io();
const chess = new Chess()
const boardElement = document.querySelector('.chessboard')


let draggedPiece  = null;
let sourceSquare = null;
let playerRole = null;

const unicodePieces = {
    w: {
        k: '&#9812;',
        q: '&#9813;',
        r: '&#9814;',
        b: '&#9815;',
        n: '&#9816;',
        p: '&#9817;'
    },
    b: {
        k: '&#9818;',
        q: '&#9819;',
        r: '&#9820;',
        b: '&#9821;',
        n: '&#9822;',
        p: '&#9823;'
    }
};

const renderBoard = ()=>{
    let board = chess.board();

    boardElement.innerHTML =''
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
            const squareElement = document.createElement('div')
            squareElement.classList.add('square',
                (rowindex+squareindex)%2 === 0 ? 'light' : 'dark'
            )
            squareElement.dataset.row = rowindex
            squareElement.dataset.col = squareindex

            if (square) {
                const pieceElement = document.createElement('div')
                pieceElement.classList.add('piece', square.color === 'w' ? "white":"black")
                pieceElement.innerHTML = unicodePieces[square.color][square.type];
                pieceElement.draggable = playerRole === square.color
    
                pieceElement.addEventListener("dragstart",(e)=>{
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = {row:rowindex,col:squareindex}
                        e.dataTransfer.setData('text/plain','')
                    }
                })

                pieceElement.addEventListener('dragend',()=>{
                    draggedPiece = null;
                    sourceSquare=null;
                })


                squareElement.appendChild(pieceElement)
            }
            squareElement.addEventListener('dragover',function (e) {
                e.preventDefault()
            })

            squareElement.addEventListener('drop',function (e) {
                e.preventDefault()
                if (draggedPiece) {
                    const targetSource = {
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    }
                    
                    handleMove(sourceSquare,targetSource)
                }
            })
           
            boardElement.appendChild(squareElement)
        })
    })
    if (playerRole === 'b') {
        boardElement.classList.add('flipped')
    }else{
        boardElement.classList.remove('flipped')

    }
}

renderBoard();
const handleMove = (source,target)=>{
    const move = {
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }
    socket.emit('move',move)
}



socket.on('playerRole',function (role) {
    playerRole = role;
    renderBoard()
})
socket.on('spectatorRole',function (role) {
    playerRole = null;
    renderBoard()
})
socket.on('boardState',function (fen) {
     chess.load(fen)
    renderBoard()
})

socket.on('move',function (move) {
     chess.move(move)
    renderBoard()
})

// const getPieceUnicode = ()=>{}







// socket.emit('fubuki')
// socket.on('makima',function () {
//     console.log('makima is mommy material')
// })