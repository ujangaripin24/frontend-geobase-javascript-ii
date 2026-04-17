import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./modules/HomePage/views/HomePage";
import DashboardPage from "./modules/DashboardPage/views/DashboardPage";
import AboutPage from "./modules/AboutPage/views/AboutPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
