import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upload from "./pages/upload";
import Gallery from "./pages/gallery";
import Navbar from "./components/navbar";
import { AppProvider } from "./context/app-provider";
import AdminDashboard from "./pages/admin/admin-dashboard";

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
