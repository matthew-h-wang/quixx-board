"use client"

import Board from '@/components/board'
import Dice from '@/components/dice'
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Container from '@mui/material/Container';

export default function Home() {
  return (
    <main className="w-screen h-auto">     
      <ScopedCssBaseline>

        <Container maxWidth="lg">
          <Board/>
          <Dice/>
        </Container>
      </ScopedCssBaseline>

    </main>
  )
}
