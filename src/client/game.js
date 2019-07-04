
$(function () {
    let socket = io();

    // $('form').submit(function(e){
    //     e.preventDefault(); // prevents page reloading
    //     socket.volatile.emit('ClientMessage', $('#m').val());
    //     $('#m').val('');
    //     return false;
    // });
    socket.on('ServerMessage', function(data){
        // $('#messages').append($('<li>').text(data));

        renderBackground();

        if (data.entities) {
            renderGame(data.entities);
        }

        renderGUI();
    });

    socket.on('disconnect', onDisconnect);
});

function onDisconnect(){
    alert("Server disconnected... =(");
}


function renderBackground() {
    let start = window.performance.now();

    let board = document.querySelector("#background-canvas");
    let ctx = board.getContext("2d");

    ctx.save();
    ctx.translate(board.width / 2, board.height / 2);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(-board.width / 2, -board.height / 2, board.width, board.height);
    ctx.restore();

    end = window.performance.now();
    // console.info('renderBackground() took: ' + (end - start));
}

function renderGame(entities) {
    let start = window.performance.now();

    let board = document.querySelector("#game-canvas");
    let ctx = board.getContext("2d");

    ctx.save();
    ctx.translate(board.width / 2, board.height / 2);

    // Flush
    ctx.clearRect(-board.width / 2, -board.height / 2, board.width, board.height);

    // Ball
    ball = entities[0];
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.size.x, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();

    end = window.performance.now();
    // console.info('renderGame() took: ' + (end - start));
}

function renderGUI() {
    let start = window.performance.now();

    let board = document.querySelector("#game-canvas");
    let ctx = board.getContext("2d");

    ctx.save();
    ctx.translate(board.width / 2, board.height / 2);
    // ctx.transform(1, 0, 0, -1, 0, board.height)

    // Debugging.
    ctx.font = '10px serif';
    ctx.strokeStyle = 'gray';
    ctx.setLineDash([3, 1]);
    ctx.moveTo(-board.width / 2, 0);
    ctx.lineTo(board.width / 2, 0);
    ctx.fillText('X: ' + -board.width / 2, -board.width / 2, 10);
    ctx.fillText('X: ' + board.width / 2, board.width / 2 - 40, 10);
    ctx.stroke();

    ctx.moveTo(0, -board.width / 2);
    ctx.lineTo(0, board.width / 2);
    ctx.stroke();
    ctx.fillText('Y: ' + -board.height / 2, 10,-board.height / 2 + 10);
    ctx.fillText('Y: ' + board.height / 2, 10, board.height / 2 - 10);

    ctx.restore();

    end = window.performance.now();
    // console.info('renderGUI() took: ' + (end - start));
}