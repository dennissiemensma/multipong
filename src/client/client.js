const BALL_COLOR = "purple";
const WALL_COLOR = "black";
const GOAL_COLOR = "green";
const PADDLE_COLOR = "red";
const DEBUG = false;


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
    let board = document.querySelector("#background-canvas");
    let ctx = board.getContext("2d");

    ctx.save();
    ctx.translate(board.width / 2, board.height / 2);

    ctx.strokeStyle = 'black';
    ctx.strokeRect(-board.width / 2, -board.height / 2, board.width, board.height);
    ctx.restore();
}

function renderGame(entities) {
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
}

function renderEntity(ctx, entity) {
    switch(entity.name) {
        case "ball":
            ctx.fillStyle = BALL_COLOR;
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
            ctx.fillStyle = WALL_COLOR;
            renderRect(ctx, entity);
            break;

        case "goal":
            ctx.fillStyle = GOAL_COLOR;
            renderRect(ctx, entity);
            break;

        case "paddle":
            ctx.fillStyle = PADDLE_COLOR;
            renderRect(ctx, entity);
            break;
    }

    if (DEBUG) {
        // Debug for center of entity and direction.
        ctx.save();

        ctx.fillStyle = 'orange';
        ctx.strokeStyle = 'orange';
        ctx.beginPath();
        ctx.arc(
            entity.position.x,
            entity.position.y,
            2,
            0,
            2 * Math.PI
        );
        ctx.fill();

        let lineLength = 25;
        let lineTo = Object.assign({}, entity.position); // Copy
        lineTo.x += entity.direction.x * lineLength
        lineTo.y += entity.direction.y * lineLength
        ctx.lineWidth = '2';
        ctx.moveTo(entity.position.x, entity.position.y);
        ctx.lineTo(lineTo.x, lineTo.y);
        ctx.stroke();

        ctx.restore();
    }
}

function renderRect(ctx, entity) {
    ctx.fillRect(
        entity.position.x - (entity.size.x / 2),
        entity.position.y - (entity.size.y / 2),
        entity.size.x,
        entity.size.y
    );
}

function renderGUI(gameInfo) {
    let board = document.querySelector("#game-canvas");
    let ctx = board.getContext("2d");

    ctx.save();
    ctx.translate(board.width / 2, board.height / 2);

    ctx.font = '30px serif';
    ctx.strokeStyle = 'black';
    let textString = gameInfo.lifes.join(" - ");
    ctx.fillText(
        textString,
        -ctx.measureText(textString).width / 2,
        -board.height / 2 + 30
    );

    ctx.font = '10px serif';
    ctx.strokeStyle = 'lightgray';
    textString = "Time: " + (gameInfo.time * 0.001).toFixed(2).toString();
    ctx.fillText(
        textString,
        -board.width / 2 + 10,
        -board.height / 2 + 20
    );
    textString = "Ball speed: " + gameInfo.ball.speed.toString();
    ctx.fillText(
        textString,
        -board.width / 2 + 10,
        -board.height / 2 + 40
    );

    if (DEBUG) {
        // Debugging grid.
        ctx.save();

        ctx.font = '10px serif';
        ctx.strokeStyle = 'gray';
        ctx.setLineDash([3, 1]);
        ctx.moveTo(-board.width / 2, 0);
        ctx.lineTo(board.width / 2, 0);
        ctx.fillText('X: ' + -board.width / 2, -board.width / 2 + 10, 10);
        ctx.fillText('X: ' + board.width / 2, board.width / 2 - 40, 10);
        ctx.stroke();

        ctx.moveTo(0, -board.width / 2);
        ctx.lineTo(0, board.width / 2);
        ctx.stroke();
        ctx.fillText('Y: ' + -board.height / 2, 10, -board.height / 2 + 40);
        ctx.fillText('Y: ' + board.height / 2, 10, board.height / 2 - 10);

        ctx.restore();
    }

    ctx.restore();
}