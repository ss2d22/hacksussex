import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to HackSussex</h1>
      <p className="text-xl mb-8 text-center">
        Sign in to access your personalized dashboard with charts and more.
      </p>
      <div className="space-x-4">
        <Button asChild>
          <Link to="/sign-in">Sign In</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/sign-up">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
