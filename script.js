const createPlayer = function(name, mark) {
	const player = {
		name,
		mark
	}
	return player;
}

const boardUtils = (function() {
	const board = [];
	let y = 1;

	for (let i = 0; i < 3; i++) {
		board[i] = [];

		for (let j = 0; j < 3; j++) {
			board[i][j] = y;
			y++;
		}
	}

	const getBoard = () => board;

	const isBoardNotEmpty = () => board.flat().some( e => typeof e === 'number');

	return { getBoard, isBoardNotEmpty };
})();

const gameUtils = (function() {
	const board = boardUtils.getBoard();

	const makeMove = (move, player) => {
		for (let i = 0; i < board.length; i++) {
			for (let j = 0; j < board.length; j++) {
				if (board[i][j] === move) {
					let boardCell = document.getElementsByClassName(String(move))[0];
					boardCell.innerText = player.mark;
					boardCell.style.backgroundColor = '#02025e';
					boardCell.style.color = 'white';
					board[i][j] = player.mark;
					return true;
				}
			}
		}
		return null;
	}

	async function readPlayerInput() {
		return new Promise( resolve => {
			const grid = uiUtils.getGrid();

			const clickHandler = (e) => {
				grid.removeEventListener('click', clickHandler);

				resolve(Number(e.target.getAttribute('class')));
			}

		grid.addEventListener('click', clickHandler);
		})
	}

	const checkWinner = () => {
		function checkAllEqual(arr) {
			return arr.every(v => v === arr[0]);
		}

		// horizontal win
		for (let row of board) {
			if (checkAllEqual(row)) return true;
		}

		// vertical win
		for (let i = 0; i < board.length; i++) {
			let col = board.map( (e) => e[i]);
			if (checkAllEqual(col)) return true;
		}

		// left diagonal win
		let leftDiagonalElements = board.map( (e, i) => e[i]);
		if (checkAllEqual(leftDiagonalElements)) return true;


		// right diagonal win
		let rightDiagonalElements = board.map( (e, i) => e[(board.length -1) -i]);
		if (checkAllEqual(rightDiagonalElements)) return true;

		return false;
	}

	return { makeMove, checkWinner, readPlayerInput };
})();

const uiUtils = (function() {
	const	board = boardUtils.getBoard();
	const grid = document.getElementsByClassName('grid')[0];

	const renderGrid = () => {

		for (let row of board) {
			row.forEach( e => {
				let div = document.createElement('div');
				div.classList.add(e);
				div.innerText = ' ';
				grid.appendChild(div);
			})
		}
	}

	const getGrid = () => grid;

	const displayInfoDiv = (msg, type) => {
    let infoDiv = document.getElementsByClassName('info')[0];

    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.classList.add('info');
        document.getElementsByClassName('info-div')[0].appendChild(infoDiv);
    }

    infoDiv.innerHTML = '';
    infoDiv.innerText = msg;
    switch (type) {
        case 'error':
            infoDiv.style.color = 'red';
            break;
        case 'win':
            infoDiv.style.color = 'green';
            break;
        default:
            infoDiv.style.color = 'black';
    }
	};

	const clearInfoDiv = () => {
		const infoDiv = document.getElementsByClassName('info')[0];
		if (infoDiv) infoDiv.remove();
	}

	const hideForm = () => {
		document.querySelector('form').style.visibility = 'hidden';
	}

	const playAgain = () => {
		const btn = document.getElementsByClassName('replay-btn')[0];
		btn.removeAttribute('hidden');
		btn.addEventListener('click', () => location.reload());
	}

	return { renderGrid, getGrid, displayInfoDiv, clearInfoDiv, hideForm, playAgain };
})();

async function play(p) {
	const players = p;
	let currentPlayer = players[0];

	const setPlayerTurn = () => currentPlayer = currentPlayer === players[0] ? players[1] : players[0];

	while (boardUtils.isBoardNotEmpty()) {

		uiUtils.displayInfoDiv(`${currentPlayer.name}'s turn!(${currentPlayer.mark})`, 'turn');
		let playerInput = await gameUtils.readPlayerInput();

		if (gameUtils.makeMove(playerInput, currentPlayer) === null) {
			uiUtils.displayInfoDiv('Invalid move! Please try again!', 'error');
			continue;
		}

		if (gameUtils.checkWinner()) break;
		setPlayerTurn();
	}

	if (!boardUtils.isBoardNotEmpty() && !gameUtils.checkWinner()) {
		uiUtils.displayInfoDiv("It's a draw!", 'draw');
	} else {
		uiUtils.displayInfoDiv(`Congratulations! ${currentPlayer.name} won!`, 'win');
	}
	uiUtils.playAgain();
}


uiUtils.renderGrid();

document.querySelector('form').addEventListener('submit', e => {
	e.preventDefault();
	const formData = new FormData(e.target);
	const { player1, player2 } = Object.fromEntries(formData);
	p1 = createPlayer(player1, mark = 'x');
	p2 = createPlayer(player2, mark = 'o');

	uiUtils.hideForm();
	
	play([p1, p2]);
})
