$(function () {
    let socket = io();

    // $('form').submit(function(e){
    //     e.preventDefault(); // prevents page reloading
    //     socket.volatile.emit('ClientMessage', $('#m').val());
    //     $('#m').val('');
    //     return false;
    // });
    socket.on('ServerMessage', function (data) {
        // $('#messages').append($('<li>').text(data));
        console.log(data)
    });

    socket.on('GameUpdate', function (data) {
        renderGame(data.entities);
        renderGUI(data.game);
    });

    socket.on('disconnect', onDisconnect);

    renderBackground();
});


function onDisconnect() {
    console.error("Server disconnected... =(");
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

    // Entities
    for (let i = 0 ; i < entities.length ; i++) {
        renderEntity(ctx, entities[i]);
    }

    ctx.restore();

    end = window.performance.now();
    // console.info('renderGame() took: ' + (end - start));
}

function renderEntity(ctx, entity) {
    switch(entity.name) {
        case "ball":
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath();
            ctx.arc(
                entity.position.x,
                entity.position.y,
                entity.size.x,
                0,
                2 * Math.PI
            );
            ctx.fill();
            break;

        case "wall":
            ctx.fillStyle = 'black';
            renderRect(ctx, entity);
            break;

        case "goal":
            ctx.fillStyle = 'green';
            renderRect(ctx, entity);
            break;

        case "paddle":
            ctx.fillStyle = 'red';
            renderRect(ctx, entity);
            break;
    }
}

function renderRect(ctx, entity) {
    ctx.fillRect(
        entity.position.x - entity.size.x / 2,
        entity.position.y - entity.size.y / 2,
        entity.size.x,
        entity.size.y
    );
}

function renderGUI(gameInfo) {
    let start = window.performance.now();

    let board = document.querySelector("#game-canvas");
    let ctx = board.getContext("2d");

    ctx.save();
    ctx.translate(board.width / 2, board.height / 2);

    ctx.font = '30px serif';
    ctx.strokeStyle = 'black';
    let textString = gameInfo.score.join(" - ");
    ctx.fillText(
        textString,
        -ctx.measureText(textString).width / 2,
        -board.height / 2 + 30
    );

    ctx.font = '5px serif';
    ctx.strokeStyle = 'lightgray';
    textString = (gameInfo.time * 0.001).toFixed(2).toString();
    ctx.fillText(
        textString,
        -ctx.measureText(textString).width / 2,
        -board.height / 2 + 40
    );

    // Debugging grid.
    // ctx.font = '10px serif';
    // ctx.strokeStyle = 'gray';
    // ctx.setLineDash([3, 1]);
    // ctx.moveTo(-board.width / 2, 0);
    // ctx.lineTo(board.width / 2, 0);
    // ctx.fillText('X: ' + -board.width / 2, -board.width / 2 + 10, 10);
    // ctx.fillText('X: ' + board.width / 2, board.width / 2 - 40, 10);
    // ctx.stroke();
    //
    // ctx.moveTo(0, -board.width / 2);
    // ctx.lineTo(0, board.width / 2);
    // ctx.stroke();
    // ctx.fillText('Y: ' + -board.height / 2, 10, -board.height / 2 + 10);
    // ctx.fillText('Y: ' + board.height / 2, 10, board.height / 2 - 10);

    ctx.restore();

    end = window.performance.now();
    // console.info('renderGUI() took: ' + (end - start));
}