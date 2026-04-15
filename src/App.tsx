import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./modules/HomePage/views/HomePage";
import DashboardPage from "./modules/DashboardPage/views/DashboardPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
