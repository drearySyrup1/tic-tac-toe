/* eslint-disable no-use-before-define */
const gameBoard = (() => {
  let _board = Array(9);

  function setField(index, value) {
    _board[index] = value;
  }

  function getField(index) {
    return _board[index];
  }

  function resetBoard() {
    _board = Array(9);
  }

  return {
    setField, getField, resetBoard,
  };
})();

const AI = (() => {
  function getMove() {
    return Math.floor(Math.random() * 9);
  }

  return { getMove };
})();

const gameController = (() => {
  // create players
  let player1 = document.querySelector('input[name="player"]:checked').id;
  let gameMode = document.querySelector('input[name="game-mode"]:checked').id;
  let player2 = (player1 === 'x') ? 'o' : 'x';
  let turn = player1;
  let winner = null;

  const winningPositions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function changePlayer(value) {
    player1 = value;
    player2 = (player1 === 'x') ? 'o' : 'x';
    displayController.updateTurn(player1);
    turn = player1;
    restart();
  }

  function changeGameMode(value) {
    gameMode = value;
    restart();
  }

  function cellHandler(e) {
    if (winner !== null) return;
    if (!e.target.classList.contains('cell')) return;
    if (!checkIfValidMove(e.target)) return;

    const correctCell = e.target.querySelector(`[data-type="${turn}"]`);
    const index = parseInt(e.target.dataset.id, 10);
    correctCell.classList.remove('hide');
    gameBoard.setField(index, turn);

    if (checkIfWon(turn)) {
      displayController.showWinner(turn);
      winner = turn;
      return;
    }
    if (checkIfDraw()) {
      displayController.showDraw();
      return;
    }
    if (gameMode !== 'AI') {
      swapTurn();
    } else {
      let cellNumber = AI.getMove();

      while (gameBoard.getField(cellNumber) !== undefined) {
        cellNumber = AI.getMove();
      }

      const cell = document.querySelector(`#board [data-id="${cellNumber}"]`);
      gameBoard.setField(cellNumber, player2);
      const toHide = cell.querySelector(`[data-type="${player2}"]`);
      toHide.classList.remove('hide');
      if (checkIfWon(player2)) {
        displayController.showWinner(player2);
      }
    }
  }

  function checkIfDraw() {
    let draw = true;
    for (let i = 0; i < 9; i += 1) {
      if (gameBoard.getField(i) === undefined) {
        draw = false;
        break;
      }
    }
    return draw;
  }

  function swapTurn() {
    turn = (turn === 'x') ? 'o' : 'x';
    displayController.updateTurn(turn);
  }

  function checkIfValidMove(cell) {
    const { id } = cell.dataset;
    return gameBoard.getField(id) === undefined;
  }

  function checkIfWon(whosTurn) {
    let won = false;
    winningPositions.forEach((posArray) => {
      if (posArray.every((pos) => gameBoard.getField(pos) === whosTurn)) won = true;
    });
    return won;
  }

  function restart() {
    displayController.resetCells();
    gameBoard.resetBoard();
    displayController.updateTurn(turn);
    displayController.removeButton();
    winner = null;
  }

  return {
    changePlayer, changeGameMode, cellHandler, restart,
  };
})();

const displayController = (() => {
  const _cells = document.querySelectorAll('.cell');
  const turn = document.getElementById('turn');
  const playerTypeRadioButtons = document.getElementsByName('player');
  const gameModeRadioButtons = document.getElementsByName('game-mode');

  function showRestartButton() {
    const restart = document.createElement('button');
    const board = document.getElementById('board');
    const main = board.parentNode;
    restart.innerText = 'Restart';
    restart.id = 'removeButton';
    restart.classList.add('btn');
    restart.addEventListener('click', gameController.restart);
    main.insertBefore(restart, board);
  }
  function resetCells() {
    _cells.forEach((cell) => {
      Array.from(cell.children).forEach((child) => child.classList.add('hide'));
    });
  }

  function updateTurn(value) {
    turn.innerText = `${value.toUpperCase()} turn`;
  }

  function showWinner(winner) {
    turn.innerText = `${winner.toUpperCase()} has WON!`;
    showRestartButton();
  }

  function showDraw() {
    turn.innerText = 'It\'s a DRAW!';
    showRestartButton();
  }

  function removeButton() {
    const button = document.getElementById('removeButton');
    button.parentElement.removeChild(button);
  }

  playerTypeRadioButtons.forEach((btn) => btn.addEventListener('click', () => {
    if (btn.checked) gameController.changePlayer(btn.id);
  }));

  gameModeRadioButtons.forEach((btn) => btn.addEventListener('click', () => {
    if (btn.checked) gameController.changeGameMode(btn.id);
  }));

  _cells.forEach((cell) => cell.addEventListener('click', gameController.cellHandler, true));

  return {
    updateTurn, showWinner, resetCells, showDraw, removeButton,
  };
})();
