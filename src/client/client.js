const BALL_COLOR = "purple";
const WALL_COLOR = "black";
const GOAL_COLOR = "green";
const PADDLE_COLOR = "red";
const DEBUG = false;

$(function () {
    let socket = io();

    socket.on('ServerMessage', function (data) {
        // $('#messages').append($('<li>').text(data));
        console.log(data)
    });

    socket.on('ServerMessage', function (data) {
        switch(data.type) {
            case "GameStart":
                console.ingo("STARTING GAME");
                return;

            case "GameUpdate":
                renderGame(data.entities);
                renderGUI(data.game, data.won);
                return;

            case "GameOver":
                renderGameEnd(data.message)
                return;

        }
    });

    socket.on('disconnect', onDisconnect);

    renderBackground();

    // Listen mouse.
    let board = document.querySelector("#ui-canvas");
    board.addEventListener('mousemove', function(event) {
        let board = document.querySelector("#ui-canvas");
        let area = board.getBoundingClientRect();
        let position = event.clientY - area.top;

        // Translate to grid. Top is zero but should be -half.
        position -= board.height / 2;
        socket.emit('ClientMessage', {position: position});
    });
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
    let board = document.querySelector("#ui-canvas");
    let ctx = board.getContext("2d");

    ctx.save();
    ctx.translate(board.width / 2, board.height / 2);

    // Flush
    ctx.clearRect(-board.width / 2, -board.height / 2, board.width, board.height);

    ctx.font = '30px serif';
    ctx.fillStyle = 'red';
    let HEART = "♥";
    let player1Lifes = HEART.repeat(gameInfo.lifes[0]);
    let player2Lifes = HEART.repeat(gameInfo.lifes[1]);
    ctx.fillText(
        player1Lifes,
        -board.width / 2 + 10,
        -board.height / 2 + 30
    );
    ctx.fillText(
        player2Lifes,
        board.width / 2 - ctx.measureText(player2Lifes).width - 10,
        -board.height / 2 + 30
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

function renderGameEnd(message, won) {
    let board = document.querySelector("#ui-canvas");
    let ctx = board.getContext("2d");

    ctx.save();
    ctx.translate(board.width / 2, board.height / 2);

    // Flush
    ctx.clearRect(-board.width / 2, -board.height / 2, board.width, board.height);

    ctx.font = '30px serif';
    ctx.fillStyle = won ? 'green' : 'red';
    ctx.fillText(
        message,
        -ctx.measureText(message).width / 2,
        -board.height / 2 + 30
    );

    ctx.restore();
}