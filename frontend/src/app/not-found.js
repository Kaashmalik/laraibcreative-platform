export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-xl mb-4">Page Not Found</p>
      <a href="/" className="text-blue-500 hover:underline">
        Go back home
      </a>
    </div>
  );
}
