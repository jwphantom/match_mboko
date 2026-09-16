'use client'

import { useReducer, useCallback, useEffect } from 'react'
import { GameState, Position, ObstacleGrid } from '@/lib/types'
import {
  initGrid, initObstacleGrid,
  findMatches, removeMatches, applyGravity, refillGrid, swapPieces,
  areAdjacent, updateTargets, checkWin, calcScore,
  isValidCell, removePieceAt,
  getMatchedPositions, hitAdjacentObstacles,
} from '@/lib/gameEngine'
import { INITIAL_MOVES, INITIAL_TARGETS } from '@/lib/constants'

// ─── État interne ─────────────────────────────────────────────────────────────

interface State extends GameState {
  pendingSwap: { a: Position; b: Position } | null
}

function makeInitialState(): State {
  return {
    grid: initGrid(),
    obstacles: initObstacleGrid(),
    movesLeft: INITIAL_MOVES,
    targets: INITIAL_TARGETS.map(t => ({ ...t })),
    score: 0,
    selected: null,
    phase: 'idle',
    matchedIds: new Set(),
    combo: 0,
    pendingSwap: null,
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SELECT'; pos: Position }
  | { type: 'ATTEMPT_SWAP'; a: Position; b: Position }
  | { type: 'CHECK_SWAP' }
  | { type: 'FINISH_REVERT' }
  | { type: 'APPLY_GRAVITY' }
  | { type: 'REFILL' }
  | { type: 'CASCADE_CHECK' }
  | { type: 'HAMMER'; pos: Position }
  | { type: 'RESTART' }

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: State, action: Action): State {
  switch (action.type) {

    case 'SELECT': {
      if (state.phase !== 'idle') return state
      const { pos } = action
      if (!state.selected) return { ...state, selected: pos }
      if (state.selected.row === pos.row && state.selected.col === pos.col)
        return { ...state, selected: null }
      return { ...state, selected: pos }
    }

    case 'ATTEMPT_SWAP': {
      if (state.phase !== 'idle') return state
      return {
        ...state,
        grid: swapPieces(state.grid, action.a, action.b),
        selected: null,
        phase: 'swapping',
        pendingSwap: { a: action.a, b: action.b },
        matchedIds: new Set(),
        combo: 0,
      }
    }

    case 'CHECK_SWAP': {
      if (!state.pendingSwap) return state
      const { a, b } = state.pendingSwap
      const matched = findMatches(state.grid)

      if (matched.size === 0) {
        return { ...state, grid: swapPieces(state.grid, a, b), phase: 'reverting' }
      }

      // Compter ce qui sera détruit (pour les objectifs) sans modifier le grid encore
      const { removed: removedPieces } = removeMatches(state.grid, matched)
      const matchedPositions = getMatchedPositions(state.grid, matched)
      const { clearedByKind } = hitAdjacentObstacles(state.obstacles, matchedPositions)
      const allRemoved = { ...removedPieces, ...clearedByKind }
      const newTargets = updateTargets(state.targets, allRemoved)
      const score = state.score + calcScore(matched.size, 1)

      return {
        ...state,
        movesLeft: state.movesLeft - 1,
        targets: newTargets,
        score,
        phase: 'matching',
        matchedIds: matched,
        combo: 1,
        pendingSwap: null,
      }
    }

    case 'FINISH_REVERT':
      return { ...state, phase: 'idle', pendingSwap: null, combo: 0 }

    case 'APPLY_GRAVITY': {
      // Supprimer pièces matchées + frapper obstacles + gravité
      const matchedPositions = getMatchedPositions(state.grid, state.matchedIds)
      const { newGrid } = removeMatches(state.grid, state.matchedIds)
      const { newObstacles } = hitAdjacentObstacles(state.obstacles, matchedPositions)
      return {
        ...state,
        grid: applyGravity(newGrid),
        obstacles: newObstacles,
        phase: 'falling',
        matchedIds: new Set(),
      }
    }

    case 'REFILL':
      return { ...state, grid: refillGrid(state.grid), phase: 'refilling' }

    case 'CASCADE_CHECK': {
      const matched = findMatches(state.grid)

      if (matched.size === 0) {
        const won = checkWin(state.targets)
        const lost = !won && state.movesLeft <= 0
        return { ...state, phase: won ? 'win' : lost ? 'lose' : 'idle', matchedIds: new Set(), combo: 0 }
      }

      const { removed: removedPieces } = removeMatches(state.grid, matched)
      const matchedPositions = getMatchedPositions(state.grid, matched)
      const { clearedByKind } = hitAdjacentObstacles(state.obstacles, matchedPositions)
      const allRemoved = { ...removedPieces, ...clearedByKind }
      const nextCombo = state.combo + 1
      const newTargets = updateTargets(state.targets, allRemoved)
      const score = state.score + calcScore(matched.size, nextCombo)

      return {
        ...state,
        targets: newTargets,
        score,
        phase: 'matching',
        matchedIds: matched,
        combo: nextCombo,
      }
    }

    case 'HAMMER': {
      if (state.phase !== 'idle') return state
      const { newGrid, removed } = removePieceAt(state.grid, action.pos)
      const { newObstacles, clearedByKind } = hitAdjacentObstacles(
        state.obstacles, [action.pos]
      )
      const allRemoved = { ...removed, ...clearedByKind }
      const newTargets = updateTargets(state.targets, allRemoved)
      const fallen = applyGravity(newGrid)
      const filled = refillGrid(fallen)
      const score = state.score + calcScore(1, 0)
      const won = checkWin(newTargets)
      return {
        ...state,
        grid: filled,
        obstacles: newObstacles,
        targets: newTargets,
        score,
        matchedIds: new Set(),
        phase: won ? 'win' : 'idle',
      }
    }

    case 'RESTART':
      return makeInitialState()

    default:
      return state
  }
}

// ─── Timings ──────────────────────────────────────────────────────────────────

const T = { SWAP: 320, REVERT: 320, MATCH: 440, FALL: 300, REFILL: 220 }

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState)

  useEffect(() => {
    if (state.phase !== 'swapping') return
    const t = setTimeout(() => dispatch({ type: 'CHECK_SWAP' }), T.SWAP)
    return () => clearTimeout(t)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'reverting') return
    const t = setTimeout(() => dispatch({ type: 'FINISH_REVERT' }), T.REVERT)
    return () => clearTimeout(t)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'matching') return
    const t = setTimeout(() => dispatch({ type: 'APPLY_GRAVITY' }), T.MATCH)
    return () => clearTimeout(t)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'falling') return
    const t = setTimeout(() => dispatch({ type: 'REFILL' }), T.FALL)
    return () => clearTimeout(t)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'refilling') return
    const t = setTimeout(() => dispatch({ type: 'CASCADE_CHECK' }), T.REFILL)
    return () => clearTimeout(t)
  }, [state.phase])

  const selectCell = useCallback((pos: Position) => {
    if (state.phase !== 'idle') return
    if (!isValidCell(pos.row, pos.col)) return
    if (state.selected && areAdjacent(state.selected, pos)) {
      dispatch({ type: 'ATTEMPT_SWAP', a: state.selected, b: pos })
    } else {
      dispatch({ type: 'SELECT', pos })
    }
  }, [state.phase, state.selected])

  const swapDirect = useCallback((a: Position, b: Position) => {
    if (state.phase !== 'idle') return
    if (!areAdjacent(a, b)) return
    dispatch({ type: 'ATTEMPT_SWAP', a, b })
  }, [state.phase])

  const useHammer = useCallback((pos: Position) => {
    dispatch({ type: 'HAMMER', pos })
  }, [])

  const restart = useCallback(() => dispatch({ type: 'RESTART' }), [])

  return { state, selectCell, swapDirect, useHammer, restart }
}
