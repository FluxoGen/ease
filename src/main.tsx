import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/manrope'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import RoutineDetail from './pages/RoutineDetail.tsx'
import PointDetail from './pages/PointDetail.tsx'
import Safety from './pages/Safety.tsx'
import Settings from './pages/Settings.tsx'
import About from './pages/About.tsx'
import BodyMap from './pages/BodyMap.tsx'
import AllPoints from './pages/AllPoints.tsx'
import AtlasSweep from './dev/AtlasSweep.tsx'
import { hideSplash, restoreNativeState } from './native'
import { initTheme } from './theme'

// Android: restore saved settings before the first render (instant on the web).
restoreNativeState().finally(() => {
  initTheme()
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="routine/:routineId" element={<RoutineDetail />} />
          <Route path="point/:pointId" element={<PointDetail />} />
          <Route path="safety" element={<Safety />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
          <Route path="map" element={<BodyMap />} />
          <Route path="points" element={<AllPoints />} />
          {import.meta.env.DEV && <Route path="atlas-dev" element={<AtlasSweep />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
  // Never leave the Android splash up, even if the first render fails.
  setTimeout(hideSplash, 3000)
})
