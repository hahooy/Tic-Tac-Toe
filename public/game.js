"use strict";

/* connect to socket.io */
var socket = io();

(function game() {

    /* block representation */
    /* 0 1 2 
       3 4 5
       6 7 8 */

    var move = 0;
    var winflag = false;
    var singleMode = false;
    var symbols = ["&times;", "o"];
    var scores = [0, 0, 0]; // [tie, player1, player2]
    var tie = 0;
    var player1 = 1; // player 1 is "X", player 1 always moves first
    var player2 = 2; // player 2 is "O"
    var mySeed = 1; // used in minimax to identify my move
    var oppSeed = 2; // used in minimax to identify the opponent move
    var SIZE = 9;    
    var comp = player2; // decide which player is the AI
    var counter = 0; // performance counter, for analyze the algorithm

    /* the states of the game board, 0 means the slot is empty,
       1 means player 1 has chose the slot and 2 means player 2 
       has chose the slot */
    var states = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    // all combination to win the game
    var winComs = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7],
		   [2,5,8], [0,4,8], [6,4,2]];

    /* map the index to the html div id */
    var blocks = ["#top-left", "#top", "#top-right", "#middle-left", "#middle",
		  "#middle-right", "#bottom-left", "#bottom", "#bottom-right"];

    // block listener
    var handler = function(event)
    {

	if (winflag) {
	    restart();
	    winflag = false;
	}

	if (states[event.data.index] !== 0) {
	    return; // this block has been clicked
	}

	// player move, if the first move is AI, skip this
	if (!singleMode || move !== 0 || comp !== player1) {
	    playerMove(event.data.index);
	    if (!singleMode) {
		sendPlayerMove(event.data.index);
	    }
	    if (isOver()) {
		winflag = true;
	    }
	}

	// AI only moves in single mode
	if (singleMode) {
	    computerMove(comp);
	    if (isOver()) {
		winflag = true;
	    }
	}
    };

    // show animation when game is over
    var playAnimation = function(array)
    {
	var i = 0;
	$(blocks[array[i]]).animate(
	    {"fontSize": "110px"},
	    "fast",
	    function playnext () {
	    	if (i >= array.length - 1) return;
	    	$(blocks[array[++i]]).animate({"fontSize": "110px"}, "fast", playnext);
	    });
    };

    // update the score board
    var updateScore = function()
    {
	$("#player1-score").html("PLAYER1 (&times;)<br>" + scores[1]);
	$("#player2-score").html("PLAYER2 (o)<br>" + scores[2]);
	$("#tie").html("TIES<br>" + scores[0]);
    };

    // the player make a move
    var playerMove = function (index)
    {
	var player = move % 2 + 1;
	states[index] = player;
	draw(index, symbols[player - 1]);
	move++;
    };

    // draw symbol on the block[index]
    var draw = function(index, symbol)
    {
	$(blocks[index]).html(symbol);
    };

    // check if blocks i, j, k are drawed by the same player
    var checkHelper = function(winCom)
    {
	if (states[winCom[0]] === 0 ||
	    states[winCom[1]] === 0 ||
	    states[winCom[2]] === 0) {
	    return false;
	}
	return states[winCom[0]] === states[winCom[1]] &&
	    states[winCom[1]] === states[winCom[2]];
    };

    // check if we have a winer
    var checkWin = function()
    {
	if (move >= 4) {
	    for (var i = 0, len = winComs.length; i < len; i++) {
	    	if (checkHelper(winComs[i], states)) {
	    	    return {
	    		"indx": winComs[i],
	    		"player": states[winComs[i][0]]
	    	    };
	    	}
	    }
	}
	return null;
    };

    // is game over? This function has side effects!!!
    var isOver = function()
    {
	var ret = checkWin(states);
	// ret.player has won the game
	if (ret !== null) {
	    playAnimation(ret.indx);
	    scores[ret.player]++;	 
	    updateScore();
	    return true;
	}
	// tie
	if (move === SIZE) {
	    playAnimation([0,1,2,3,4,5,6,7,8]);
	    scores[tie]++;
	    updateScore();
	    return true;
	}
	return false;
    };	

    /* Start Game AI */
    // get all the available slots on the game board
    var getAvailableMoves = function()
    {
	var moves = [];
	if (checkWin() !== null || move === SIZE) {
	    return moves;
	}
	for (var i = 0; i < SIZE; i++) {
	    if (states[i] === 0) {
		moves.push(i);
	    }
	}
	return moves;
    };

    // the states of the game board after making a move
    var getNextStates = function(index, player)
    {
	var nextStates = new Array(SIZE);
	// copy the current states
	for (var i = 0; i < SIZE; i++) {
	    nextStates[i] = states[i];
	}
	nextStates[index] = player;
	return nextStates;
    };

    // get the score for current move
    var getScore = function()
    {
	var winer = checkWin();
	if (winer !== null) {
	    if (winer.player === mySeed) {
		return 10;
	    } else {
		return -10;
	    }
	} else {
	    return 0;
	}
    };

    // the MiniMax algorithm
    var minimax = function(playerSeed)
    {
	counter++;
	var bestScore = (playerSeed === mySeed) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
	    currentScore = 0,
	    availableMoves = getAvailableMoves(),
	    returnMove = -1;
	
	if (availableMoves.length === 0) {
	    /* game is over, return the score
	       this is base case for BFS */
	    bestScore = getScore(); 
	} else {
	    for (var i = 0, len = availableMoves.length; i < len; i++) {
		var availableMove = availableMoves[i];
		// try this move for current player
		states[availableMove] = playerSeed;
		move++;
		if (playerSeed === mySeed) { // my seed, get the highest score move
		    if (bestScore === 10) {
			states[availableMove] = 0; // undo move
			move--;
			break; // break if a winning move found
		    }
		    currentScore = minimax(oppSeed).score;
		    
		    if (bestScore < currentScore) {
			bestScore = currentScore;
			returnMove = availableMove;
		    }
		} else { // opponent seed, get the lowest score move
		    if (bestScore === -10) {
			states[availableMove] = 0; // undo move
			move--;
			break; // break if a losing move found
		    }
		    currentScore = minimax(mySeed).score;
		    if (bestScore > currentScore) {
			bestScore = currentScore;
			returnMove = availableMove;
		    }
		}
		states[availableMove] = 0; // undo move
		move--;
	    }
	}
	return {"score": bestScore, "move": returnMove};
	/* TODO */
    };

    var computerMove = function(player) {
	counter = 0;
	var nextmove;
	if (move === 0) {
	    /* to optimize the running time performance, the AI will
	       always chose the 0 slot to be the first move of the game.
	       this reduces the posible moves we need to check dramatically.
	    */
	    var initialMove = [0, 2, 4, 6, 8];
	    nextmove = initialMove[Math.floor(Math.floor(Math.random() * 5))];
	} else {
	    nextmove = minimax(player).move;
	}
	// console.log(counter);
	states[nextmove] = player;
	draw(nextmove, symbols[player - 1]);
	move++;
    };

    /* make the functions to be global for testing */
    window.getNextStates = getNextStates;
    window.getAvailableMoves = getAvailableMoves;
    window.getScore = getScore;
    window.minimax = minimax;
    window.states = states;
    window.computerMove = computerMove;
    /* End Game AI */


    // restart the game, set all properties to default value
    var restart = function()
    {
	move = 0;

	for (var i = 0; i < SIZE; i++) {
	    states[i] = 0;
	    $(blocks[i]).html("");
	    $(blocks[i]).css("fontSize", "90px");
	}
    };

    // restore all variables to their initial states
    var restore = function() {
	$("#player-option").removeClass("hide");
	$("#turn-option").addClass("hide");

	winflag = false;
	scores = [0, 0, 0];
	singleMode = false;
	updateScore();
	restart();

	$("#iconModal").modal();	    
    };

    /********** START: socket.io events handlers ************/

    // send chat message to socket.io
    function sendChatMessage() {
	var msg = $('#msg-input').val();
	socket.emit('chat message', msg);
	$('#msg-input').val('');
	var message = '<div class="sender-message message">###</div>'.replace('###', msg);
	console.log(message);
	$('#messages').append(message);
    }

    // receive chat message from socket.io
    function receiveChatMessage() {
	socket.on('chat message', function(msg) {
	    if (typeof(msg) === 'undefined' || msg === null || msg === '') {
		return;
	    }
	    console.log(msg);
	    var message = '<div class="receiver-message message">###</div>'.replace('###', msg);
	    $('#messages').append(message);
	});
    }	

    // receive player connection information
    function receivePlayerConnect() {
	socket.on('user connect', function(msg) {
	    var message = '<div>###</div>'.replace('###', msg);
	    $('#messages').append(message);
	});
    }

    // send player move to socket.io
    function sendPlayerMove(index) {
	socket.emit('player move', index);
    }

    // receive player move from socket.io
    function receivePlayerMove() {
	socket.on('player move', function(index) {
	    if (winflag) {
		restart();
		winflag = false;
	    }

	    playerMove(index);

	    if (isOver()) {
		winflag = true;
	    }
	});
    }
    
    // send player restart to socket.io
    function sendPlayerRestart() {
	socket.emit('player restart', 'restart');
    }

    // receive player restart from socket.io
    function receivePlayerRestart() {
	socket.on('player restart', function(_) {
	    console.log('player restart');
	    restore();
	});
    }

    // register listeners for socket.io event, this function should not be called in single player mode
    function registerSocketioListener() {
	// event listener for sending a chat message
	$('#send').on('click', sendChatMessage);
	$('#msg-input').keypress(function(e) {
	    if (e.which == 13) {
		sendChatMessage();
	    }
	});

	// listen to other players' message
	receiveChatMessage();

	// listen to other players' connection info
	receivePlayerConnect();

	// listen to other players' move
	receivePlayerMove();

	// listen to other players restarting
	receivePlayerRestart();

    }


    /********** END: socket.io events handlers ************/

    // initialize the game board
    var init = function()
    {
	// initialize the score board
	updateScore(); 

	// register the even listener for every slots of the board
	for (var i = 0; i < blocks.length; i++) {
	    $(blocks[i]).on("click", {"index": i}, handler);
	}

	// event listners for modal buttons
	$("#one-player").on("click", function() {
	    singleMode = true;
	    $(this).parent().toggleClass("hide");
	    $("#turn-option").toggleClass("hide");	
	});
	$('#two-player').on("click", function() {
	    registerSocketioListener();
	});
	$("#play-first").on("click", function() {
	    /* set AI to be player 1, AI plays first */
	    comp = player2;
	});
	$("#play-second").on("click", function() {
	    /* set AI to be player 1, AI plays first */
	    comp = player1;
	    computerMove(comp);
	});

	// event listener for the restart button
	$("#restart-game").on("click", function() {
	    if (!singleMode) {
		sendPlayerRestart();
	    }
	    restore();
	});
    };

    init();
})();
