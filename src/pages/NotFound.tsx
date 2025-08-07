import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
      <p className="text-muted-foreground text-lg mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Button asChild variant="outline">
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  );
}
