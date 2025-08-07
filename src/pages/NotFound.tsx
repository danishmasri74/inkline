import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-5xl font-bold mb-4 text-foreground">404</h1>
      <p className="text-muted-foreground mb-6 text-lg">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="text-sm px-4 py-2 border border-border rounded-md hover:bg-muted transition"
      >
        Go to Home
      </Link>
    </div>
  );
}
