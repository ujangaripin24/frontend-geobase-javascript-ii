import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./modules/HomePage/views/HomePage";
import DashboardPage from "./modules/DashboardPage/DashboardPage/views/DashboardPage";
import AboutPage from "./modules/AboutPage/views/AboutPage";
import MasterDataPage from "./modules/DashboardPage/MasterDataPage/views/MasterDataPage";
import LocationDataPage from "./modules/DashboardPage/LocationDataPage/views/LocationDataPage";
import AppLayout from "./layouts/AppLayout";
import AddLocationDataPage from "./modules/DashboardPage/LocationDataPage/views/AddLocationDataPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="master-data" element={<MasterDataPage />} />
            <Route path="location-data" element={<LocationDataPage />} />
            <Route path="location-data/add" element={<AddLocationDataPage />} />
          </Route>
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
