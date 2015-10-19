(function game() {
    var move = 0;
    var winflag = false;
    var scores = [0, 0, 0]; // [player1, player2, tie]
    var player1 = 0;
    var player2 = 1;
    var tie = 2;
    var mySeed = 0; // used in minimax to identify my move
    var oppSeed = 1; // used in minimax to identify the opponent move
    const SIZE = 9;

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
	playerMove(event.data.index);
	isOver();
    };

    // show animation when game is over
    var playAnimation = function(array) {
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
	$("#player1-score").html("PLAYER1<br>" + scores[0]);
	$("#player2-score").html("PLAYER2<br>" + scores[1]);
	$("#tie").html("TIES<br>" + scores[2]);
    };

    // the player make a move
    var playerMove = function (index) {
	if (states[index] !== null) {
	    return; // this block has been clicked
	}

	var symbol;
	var player = move % 2;
	if (player === 0) {
	    symbol = "&times;";
	} else {
	    symbol = "o";
	}
	
	states[index] = player;
	console.log(states);
	move++;
	draw(index, symbol);
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
	    	if (checkHelper(winComs[i])) {
	    	    return {
	    		"indx": winComs[i],
	    		"player": states[winComs[i][0]]
	    	    };
	    	}
	    }
	}
	return null;
    };

    // is game over?
    var isOver = function()
    {
	var ret = checkWin();
	// ret.player has won the game
	if (ret !== null) {
	    winflag = true;
	    playAnimation(ret.indx);
	    scores[ret.player]++;	 
	    updateScore();
	    return true;
	}
	// tie
	if (move === SIZE) {
	    winflag = true;
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

    

    /* make the functions to be global for testing */
    window.getNextStates = getNextStates;
    window.getAvailableMoves = getAvailableMoves;

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
	updateScore();
	for (var i = 0; i < blocks.length; i++) {
	    $(blocks[i]).on("click", {"index": i}, handler);
	}
    };

    init();
})();
