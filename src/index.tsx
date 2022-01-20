import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { Stack } from '@fluentui/react/lib/Stack'
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner'
import { initializeIcons } from '@fluentui/react/lib/Icons'

const SignIn = React.lazy(() => import('./login'))
const AdminDashboard = React.lazy(() => import('./admin'))

mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    height: '100vh',
  },
})

initializeIcons()

const Loading: React.FC<{ label?: string }> = ({ label }) => (
  <Stack horizontalAlign="center" verticalAlign="center" className={mergeStyles({ height: '100%' })}>
    <Spinner
      label={label}
      size={SpinnerSize.large}
    />
  </Stack>
)

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={
        <React.Suspense fallback={<Loading label="Cargando ..." />}>
          <SignIn />
        </React.Suspense>
      } />
      <Route path="/admin/*" element={
        <React.Suspense fallback={<Loading label="Cargando Administrador" />}>
          <AdminDashboard />
        </React.Suspense>
      } />
    </Routes>
  </Router>
)

ReactDOM.render(<App />, document.getElementById('root'))