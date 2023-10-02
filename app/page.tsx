"use client"

import {Board, BoardState, RowState, isRowLocked, RowColor, ALL_ROW_COLORS, getEmptyBoardState} from '@/components/board'
import Dice from '@/components/dice'
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Container from '@mui/material/Container';
import { useState } from 'react';

export default function Home() {

  const [boardState, setBoardState] = useState<BoardState>(getEmptyBoardState());
  const lockedColors = new Set(ALL_ROW_COLORS.filter((color) => isRowLocked(boardState[color])));
  return (
    <main className="w-screen h-auto">     
      <ScopedCssBaseline>
        <Container maxWidth="lg">
          <Board boardState={boardState} setBoardState={setBoardState}/>
          <Dice lockedColors={lockedColors}/>
        </Container>
      </ScopedCssBaseline>

    </main>
  )
}
