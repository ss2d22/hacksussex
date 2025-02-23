import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/react-router";
import ProtectedPage from "./pages/ProtectedPage";
import Home from "./pages/Home";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <>
      <div className="dark bg-background text-foreground min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Home />
                </SignedIn>
                <SignedOut>
                  <LandingPage />
                </SignedOut>
              </>
            }
          />
          <Route
            path="/sign-in"
            element={
              <SignedOut>
                <SignIn />
              </SignedOut>
            }
          />
          <Route
            path="/sign-up"
            element={
              <SignedOut>
                <SignUp />
              </SignedOut>
            }
          />
          <Route
            path="/protected"
            element={
              <SignedIn>
                <ProtectedPage />
              </SignedIn>
            }
          />
          <Route
            path="*"
            element={
              <SignedIn>
                <Navigate to="/" replace />
              </SignedIn>
            }
          />
        </Routes>
      </div>
    </>
  );
}
