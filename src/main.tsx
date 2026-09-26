import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import RoutineDetail from './pages/RoutineDetail.tsx'
import PointDetail from './pages/PointDetail.tsx'
import Safety from './pages/Safety.tsx'
import BodyMap from './pages/BodyMap.tsx'
import AllPoints from './pages/AllPoints.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="routine/:routineId" element={<RoutineDetail />} />
          <Route path="point/:pointId" element={<PointDetail />} />
          <Route path="safety" element={<Safety />} />
          <Route path="map" element={<BodyMap />} />
          <Route path="points" element={<AllPoints />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
