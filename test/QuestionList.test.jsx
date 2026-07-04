import { render, screen } from '@testing-library/react'
import QuestionList from '../src/components/QuestionList'

const manifest = {
  levels: {
    Junior: {
      javascript: { Basics: [], Async: [] },
      java: { OOP: [], Collections: [], Multithreading: [] },
    },
    Mid: { database: { Partitioning: [] } },
  },
}

test('renders sublevel tabs for selected tech', () => {
  const setSublevel = () => {}
  render(
    <QuestionList
      manifest={manifest}
      level="Junior"
      tech="java"
      sublevel="OOP"
      setSublevel={setSublevel}
      onBack={() => {}}
    />
  )
  expect(screen.getByText('OOP')).toBeInTheDocument()
  expect(screen.getByText('Collections')).toBeInTheDocument()
  expect(screen.getByText('Multithreading')).toBeInTheDocument()
})
