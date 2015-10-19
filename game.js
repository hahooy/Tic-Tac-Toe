(function name() {
    var move = 0;
    var winflag = false;
    var scores = [0, 0, 0]; // [player1, player2, tie]
    var player1 = 0;
    var player2 = 1;
    var tie = 2;

    // all combination to win the game
    var winComs = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7],
		  [2,5,8], [0,4,8], [6,4,2]];

    /* block files: "id", "drawed", "player" */
    /* 0 1 2 
       3 4 5
       6 7 8 */
    var blocks = [
	{
	    "id": "#top-left"
	},
	{
	    "id": "#top"
	},
	{
	    "id": "#top-right"
	},
	{
	    "id": "#middle-left"
	},
	{
	    "id": "#middle"
	},
	{
	    "id": "#middle-right"
	},
	{
	    "id": "#bottom-left"
	},
	{
	    "id": "#bottom"
	},
	{
	    "id": "#bottom-right"
	}];

    // block listener
    var handler = function(event)
    {
	if (winflag) {
	    restart();
	    winflag = false;
	}
	draw.call(this, event.data.index);
	isOver();
    };

    // show animation when game is over
    var playAnimation = function(array) {
	var i = 0;
	$(blocks[array[i]].id).animate(
	    {"fontSize": "110px"},
	    "fast",
	    function playnext () {
		if (i >= array.length - 1) return;
		$(blocks[array[++i]].id).animate({"fontSize": "110px"}, "fast", playnext);
	    });
    };

    // update the score board
    var updateScore = function()
    {
	$("#player1-score").html("PLAYER1<br>" + scores[0]);
	$("#player2-score").html("PLAYER2<br>" + scores[1]);
	$("#tie").html("TIES<br>" + scores[2]);
    };

    // draw the block when clicked
    var draw = function(index)
    {
	if (blocks[index].drawed) {
	    return; // this block has been clicked
	}

	var symbol;
	var player = move % 2;
	if (player === 0) {
	    symbol = "&times;";
	} else {
	    symbol = "o";
	}
	
	blocks[index].drawed = true;
	blocks[index].player = player;
	move++;
	$(this).html(symbol);
    };

    var checkWin = function()
    {
	for (var i = 0, len = winComs.length; i < len; i++) {
	    if (checkHelper(winComs[i])) {
		return {
		    "indx": winComs[i],
		    "player": blocks[winComs[i][0]].player
		};
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
	if (move === blocks.length) {
	    winflag = true;
	    playAnimation([0,1,2,3,4,5,6,7,8]);
	    scores[tie]++;
	    updateScore();
	    return true;
	}
	return false;
    };	

    // check if blocks i, j, k are drawed by the same player
    var checkHelper = function(winCom)
    {
	if (blocks[winCom[0]].player === null ||
	    blocks[winCom[1]].player === null ||
	    blocks[winCom[2]].player === null) {
	    return false;
	}
	return blocks[winCom[0]].player === blocks[winCom[1]].player &&
	    blocks[winCom[1]].player === blocks[winCom[2]].player;
    };

    // restart the game, set all properties to default value
    var restart = function()
    {
	move = 0;

	for (var i = 0; i < blocks.length; i++) {
	    blocks[i].drawed = false;
	    blocks[i].player = null;
	    $(blocks[i].id).html("");
	    $(blocks[i].id).css("fontSize", "90px");
	}
    };

    // initialize the game board
    var init = function()
    {
	updateScore();

	for (var i = 0; i < blocks.length; i++) {
	    blocks[i].drawed = false;
	    blocks[i].player = null;
	    $(blocks[i].id).on("click", {"index": i}, handler);
	}
    };

    init();
})();
