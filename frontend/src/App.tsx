import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Upload from "./pages/upload";
// import Gallery from "./pages/gallery";
import Navbar from "./components/navbar";
import { AppProvider } from "./context/app-provider";
import Loader from "./components/loader";
// import AdminDashboard from "./pages/admin/admin-dashboard";

// Lazy load
const Upload = lazy(() => import("./pages/upload"));
const Gallery = lazy(() => import("./pages/gallery"));
const AdminDashboard = lazy(() => import("./pages/admin/admin-dashboard"));

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Suspense fallback={<Loader message="Loading..." />}>
          <Navbar />

          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </Router>
    </AppProvider>
  );
}
