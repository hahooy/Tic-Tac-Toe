"use strict";
(function game() {
    var move = 0;
    var winflag = false;
    var symbols = ["&times;", "o"];
    var scores = [0, 0, 0]; // [player1, player2, tie]
    var player1 = 0; // player 1 is "X", player 1 always moves first
    var player2 = 1; // player 2 is "O"
    var tie = 2;
    var mySeed = 0; // used in minimax to identify my move
    var oppSeed = 1; // used in minimax to identify the opponent move
    var SIZE = 9;
    var singleMode = false;
    var comp = player2; // decide which player is the AI

    // all combination to win the game
    var winComs = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7],
		   [2,5,8], [0,4,8], [6,4,2]];

    // block representation
    /* 0 1 2 
       3 4 5
       6 7 8 */
    /* the states of the game board, null means the slot is empty,
       0 means player 1 has chose the slot and 1 means player 2 has
       chose the slot */
    var states = [null, null, null, null, null, null, null, null, null];

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

	if (states[event.data.index] !== null) {
	    return; // this block has been clicked
	}

	// player move, if the first move is AI, skip this
	if (!singleMode || move !== 0 || comp !== player1) {
	    playerMove(event.data.index);
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
	$("#player1-score").html("PLAYER1 (&times;)<br>" + scores[0]);
	$("#player2-score").html("PLAYER2 (o)<br>" + scores[1]);
	$("#tie").html("TIES<br>" + scores[2]);
    };

    // the player make a move
    var playerMove = function (index)
    {
	var symbol;
	var player = move % 2;
	
	states[index] = player;
	// console.log(states);
	move++;
	draw(index, symbols[player]);
    };

    // draw symbol on the block[index]
    var draw = function(index, symbol)
    {
	$(blocks[index]).html(symbol);
    };

    // check if blocks i, j, k are drawed by the same player
    var checkHelper = function(winCom)
    {
	if (states[winCom[0]] === null ||
	    states[winCom[1]] === null ||
	    states[winCom[2]] === null) {
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
	    if (states[i] === null) {
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
			states[availableMove] = null; // undo move
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
			states[availableMove] = null; // undo move
			move--;
			break; // break if a losing move found
		    }
		    currentScore = minimax(mySeed).score;
		    if (bestScore > currentScore) {
			bestScore = currentScore;
			returnMove = availableMove;
		    }
		}
		states[availableMove] = null; // undo move
		move--;
	    }
	}
	return {"score": bestScore, "move": returnMove};
	/* TODO */
    };

    var computerMove = function(player) {
	var nextmove = minimax(player).move;
	states[nextmove] = player;
	draw(nextmove, symbols[player]);
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
	    states[i] = null;
	    $(blocks[i]).html("");
	    $(blocks[i]).css("fontSize", "90px");
	}
    };

    // initialize the game board
    var init = function()
    {
	// initialize the score board
	updateScore(); 

	// register the even listener for every slots of the board
	for (var i = 0; i < blocks.length; i++) {
	    $(blocks[i]).on("click", {"index": i}, handler);
	}

	// even listners for modal buttons
	$("#one-player").on("click", function() {
	    singleMode = true;
	    $(this).parent().toggleClass("hide");
	    $("#turn-option").toggleClass("hide");
	});
	$("#play-second").on("click", function() {
	    /* set AI to be player 1, AI plays first */
	    comp = player1;
	    computerMove(comp);
	});
    };

    init();
})();
