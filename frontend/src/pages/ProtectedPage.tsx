import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/react-router";

function ProtectedPage() {
  return (
    <>
      <SignedIn>
        <h1>Protected Content</h1>
        <p>You can see this because you're signed in.</p>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default ProtectedPage;
