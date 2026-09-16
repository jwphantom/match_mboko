'use client'

import { useReducer, useCallback, useEffect } from 'react'
import { Grid, GameState, Position, GamePhase } from '@/lib/types'
import {
  initGrid,
  findMatches,
  removeMatches,
  applyGravity,
  refillGrid,
  swapPieces,
  areAdjacent,
  updateTargets,
  checkWin,
  calcScore,
  isValidCell,
  removePieceAt,
} from '@/lib/gameEngine'
import { INITIAL_MOVES, INITIAL_TARGETS } from '@/lib/constants'

// ─── État interne ─────────────────────────────────────────────────────────────

interface State extends GameState {
  pendingSwap: { a: Position; b: Position } | null
}

function makeInitialState(): State {
  return {
    grid: initGrid(),
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
  | { type: 'APPLY_GRAVITY' }   // supprime matchedIds PUIS applique gravité
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
      if (state.selected.row === pos.row && state.selected.col === pos.col) {
        return { ...state, selected: null }
      }
      return { ...state, selected: pos }
    }

    case 'ATTEMPT_SWAP': {
      if (state.phase !== 'idle') return state
      const { a, b } = action
      // Applique visuellement le swap → Framer Motion layout anime le déplacement
      const swapped = swapPieces(state.grid, a, b)
      return {
        ...state,
        grid: swapped,
        selected: null,
        phase: 'swapping',
        pendingSwap: { a, b },
        matchedIds: new Set(),
        combo: 0,
      }
    }

    case 'CHECK_SWAP': {
      if (!state.pendingSwap) return state
      const { a, b } = state.pendingSwap
      const matched = findMatches(state.grid)

      if (matched.size === 0) {
        // Aucun match → on remet visuellement les pièces à leur place
        const reverted = swapPieces(state.grid, a, b)
        return { ...state, grid: reverted, phase: 'reverting' }
      }

      // Les pièces matchées RESTENT dans le grid pendant 'matching'
      // → l'animation de disparition peut se jouer avant suppression réelle
      const { removed } = removeMatches(state.grid, matched) // seulement pour compter
      const newTargets = updateTargets(state.targets, removed)
      const score = state.score + calcScore(matched.size, 1)

      return {
        ...state,
        // grid inchangé : les pièces matchées sont encore visibles
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
      // On supprime maintenant les pièces matchées (l'animation a eu le temps de jouer)
      const { newGrid } = removeMatches(state.grid, state.matchedIds)
      const fallen = applyGravity(newGrid)
      return {
        ...state,
        grid: fallen,
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
        return {
          ...state,
          phase: won ? 'win' : lost ? 'lose' : 'idle',
          matchedIds: new Set(),
          combo: 0,
        }
      }

      // Même pattern que CHECK_SWAP : garder pièces visibles, juste compter
      const { removed } = removeMatches(state.grid, matched)
      const newTargets = updateTargets(state.targets, removed)
      const nextCombo = state.combo + 1
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
      const newTargets = updateTargets(state.targets, removed)
      const fallen = applyGravity(newGrid)
      const filled = refillGrid(fallen)
      const score = state.score + calcScore(1, 0)
      const won = checkWin(newTargets)
      return {
        ...state,
        grid: filled,
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

const T_SWAP    = 320  // durée animation swap Framer Motion
const T_REVERT  = 320
const T_MATCH   = 420  // durée de highlight avant suppression
const T_FALL    = 300
const T_REFILL  = 220

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState)

  useEffect(() => {
    if (state.phase !== 'swapping') return
    const t = setTimeout(() => dispatch({ type: 'CHECK_SWAP' }), T_SWAP)
    return () => clearTimeout(t)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'reverting') return
    const t = setTimeout(() => dispatch({ type: 'FINISH_REVERT' }), T_REVERT)
    return () => clearTimeout(t)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'matching') return
    const t = setTimeout(() => dispatch({ type: 'APPLY_GRAVITY' }), T_MATCH)
    return () => clearTimeout(t)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'falling') return
    const t = setTimeout(() => dispatch({ type: 'REFILL' }), T_FALL)
    return () => clearTimeout(t)
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'refilling') return
    const t = setTimeout(() => dispatch({ type: 'CASCADE_CHECK' }), T_REFILL)
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
