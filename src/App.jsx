import { useState } from 'react'
import reactLogo from './assets/react.svg'

// @ts-ignore
import Quiz from './components/Quiz'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Quiz/>
    </>
  )
}

export default App
