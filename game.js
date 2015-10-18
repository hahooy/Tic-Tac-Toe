(function name() {
    var move;
    var winflag;
    var scores;

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
	var ret = checkWin();
	if (ret !== null) {
	    winflag = true;
	    playAnimation(ret.indx);
	    scores[ret.player]++;	 
	    updateScore();
	} else if (move === blocks.length) {
	    winflag = true;
	    playAnimation([0,1,2,3,4,5,6,7,8]);
	    scores[2]++;
	    updateScore();
	}
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
	if (move >= 4) {	
	    if (checkHelper(0, 1, 2)) {
		// top horizontal
		return {
		    "indx": [0, 1, 2],
		    "player": blocks[0].player
		};
	    }
	    if (checkHelper(3, 4, 5)) {
		// middle horizontal
		return {
		    "indx": [3, 4, 5],
		    "player": blocks[3].player
		};
	    }
	    if (checkHelper(6, 7, 8)) {
		// bottom horizontal
		return {
		    "indx": [6, 7, 8],
		    "player": blocks[6].player
		};
	    }
	    if (checkHelper(0, 3, 6)) {
		// left vertical
		return {
		    "indx": [0, 3, 6],
		    "player": blocks[0].player
		};
	    }
	    if (checkHelper(1, 4, 7)) {
		// middle vertical
		return {
		    "indx": [1, 4, 7],
		    "player": blocks[1].player
		};
	    }
	    if (checkHelper(2, 5, 8)) {
		// right vertical
		return {
		    "indx": [2, 5, 8],
		    "player": blocks[2].player
		};
	    }
	    if (checkHelper(0, 4, 8)) {
		// left diagnal
		return {
		    "indx": [0, 4, 8],
		    "player": blocks[0].player
		};
	    }
	    if (checkHelper(6, 4, 2)) {
		// right diagnal
		return {
		    "indx": [6, 4, 2],
		    "player": blocks[6].player
		};
	    }
	}
	return null;
    };

    // check if blocks i, j, k are drawed by the same player
    var checkHelper = function(i, j, k)
    {
	if (blocks[i].player === null ||
	    blocks[j].player === null ||
	    blocks[k].player === null) {
	    return false;
	}
	return blocks[i].player === blocks[j].player &&
	    blocks[j].player === blocks[k].player;
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
	move = 0;
	winflag = false;
	scores = [0, 0, 0]; // [player1, player2, tie]

	updateScore();

	for (var i = 0; i < blocks.length; i++) {
	    blocks[i].drawed = false;
	    blocks[i].player = null;
	    $(blocks[i].id).on("click", {"index": i}, handler);
	}
    };

    init();
})();
