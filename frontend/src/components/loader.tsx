export default function Loader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gray-950 text-gray-400">
      <div className="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">{message}</p>
    </div>
  );
}
