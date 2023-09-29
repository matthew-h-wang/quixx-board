"use client"

import Board from '@/components/board'
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import Container from '@mui/material/Container';

export default function Home() {
  return (
    <main className="w-screen h-auto">     
      <ScopedCssBaseline>

        <Container maxWidth="lg">
          <Board/>
        </Container>
      </ScopedCssBaseline>

    </main>
  )
}
