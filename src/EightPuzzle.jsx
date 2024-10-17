import React, { useState } from 'react';

const EightPuzzle = () => {
  const [puzzle, setPuzzle] = useState([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
  ]);
  const [algorithm, setAlgorithm] = useState('bfs');
  const [heuristic, setHeuristic] = useState('hamming');
  const [solution, setSolution] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialState, setInitialState] = useState('');

  const shufflePuzzle = () => {
    const flatPuzzle = puzzle.flat();
    for (let i = flatPuzzle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flatPuzzle[i], flatPuzzle[j]] = [flatPuzzle[j], flatPuzzle[i]];
    }
    setPuzzle(Array(3).fill().map(() => flatPuzzle.splice(0, 3)));
    setSolution([]);
    setCurrentStep(-1);
    setError(null);
  };

  const solvePuzzle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzle, algorithm, heuristic }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setSolution([]);
      } else if (data.solution && data.solution.length > 0) {
        setSolution(data.solution);
        setCurrentStep(-1);
      } else {
        setError('No solution found');
        setSolution([]);
      }
    } catch (err) {
      setError('Failed to connect to the server. Please make sure the backend is running.');
      setSolution([]);
    } finally {
      setIsLoading(false);
    }
  };

  const findZero = (board) => {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === 0) return [i, j];
      }
    }
  };

  const applyMove = (board, move) => {
    const [x, y] = findZero(board);
    const [dx, dy] = move;
    const newX = x + dx, newY = y + dy;
    const newBoard = board.map(row => [...row]);
    [newBoard[x][y], newBoard[newX][newY]] = [newBoard[newX][newY], newBoard[x][y]];
    return newBoard;
  };

  const stepForward = () => {
    if (solution && currentStep < solution.length - 1) {
      const newStep = currentStep + 1;
      const newPuzzle = applyMove(puzzle, solution[newStep]);
      setPuzzle(newPuzzle);
      setCurrentStep(newStep);
    }
  };

  const stepBackward = () => {
    if (solution && currentStep > -1) {
      const newStep = currentStep - 1;
      const reverseMove = solution[currentStep].map(x => -x);
      const newPuzzle = applyMove(puzzle, reverseMove);
      setPuzzle(newPuzzle);
      setCurrentStep(newStep);
    }
  };

  const setCustomInitialState = () => {
    if (initialState.length !== 9 || !/^[0-8]{9}$/.test(initialState) || new Set(initialState).size !== 9) {
      setError('Invalid input. Please enter 9 unique digits from 0 to 8.');
      return;
    }
    const numbers = initialState.split('').map(num => parseInt(num, 10));
    const newPuzzle = Array(3).fill().map(() => numbers.splice(0, 3));
    setPuzzle(newPuzzle);
    setSolution([]);
    setCurrentStep(-1);
    setError(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>8-Puzzle Solver</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem', backgroundColor: '#e5e7eb', padding: '0.5rem', borderRadius: '0.25rem' }}>
        {puzzle.map((row, i) =>
          row.map((tile, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                width: '4rem',
                height: '4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                backgroundColor: tile === 0 ? '#d1d5db' : '#3b82f6',
                color: tile === 0 ? 'transparent' : 'white',
              }}
            >
              {tile !== 0 && tile}
            </div>
          ))
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          value={initialState}
          onChange={(e) => setInitialState(e.target.value)}
          placeholder="Enter initial state (e.g., 123456780)"
          style={{ width: '200px' }}
          maxLength={9}
        />
        <button onClick={setCustomInitialState} disabled={isLoading}>Set Initial State</button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} disabled={isLoading}>
          <option value="bfs">BFS</option>
          <option value="bestFirst">Best-First Search</option>
          <option value="aStar">A*</option>
        </select>
        {(algorithm === 'bestFirst' || algorithm === 'aStar') && (
          <select value={heuristic} onChange={(e) => setHeuristic(e.target.value)} disabled={isLoading}>
            <option value="hamming">Hamming</option>
            <option value="manhattan">Manhattan</option>
          </select>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={shufflePuzzle} disabled={isLoading}>Shuffle</button>
        <button onClick={solvePuzzle} disabled={isLoading}>{isLoading ? 'Solving...' : 'Solve'}</button>
        <button onClick={stepBackward} disabled={isLoading || !solution || currentStep === -1}>Step Back</button>
        <button onClick={stepForward} disabled={isLoading || !solution || currentStep === solution.length - 1}>Step Forward</button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {solution && solution.length > 0 && (
        <>
          <div>Solution Steps: {solution.length}</div>
          <div>Current Step: {currentStep + 1}</div>
        </>
      )}
    </div>
  );
};

export default EightPuzzle;