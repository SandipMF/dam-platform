import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-gray-900 p-4 text-white gap-4">
      <h1 className="text-xl font-bold">📂 DAM Platform</h1>
      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-400">
          Upload
        </Link>
        <Link to="/gallery" className="hover:text-blue-400">
          Gallery
        </Link>
      </div>
    </nav>
  );
}
