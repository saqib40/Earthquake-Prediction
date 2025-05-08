import { BrowserRouter, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/landing"
import Login from "./pages/login"
import Signup from "./pages/signup"
import Dashboard from "./pages/dashboard"
import Predict from "./pages/predict"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/create" element={<Predict />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App