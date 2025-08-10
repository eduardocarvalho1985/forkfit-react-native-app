import { appleAuth } from "@invertase/react-native-apple-authentication";
import {
  AppleAuthProvider,
  GoogleAuthProvider,
  signInWithCredential,
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";

// Configure Google Sign-In
// Make sure to replace with your actual webClientId
export const configureGoogleSignIn = (webClientId: string) => {
  GoogleSignin.configure({
    webClientId,
  });
};

export const authService = {
  // Email/Password Authentication
  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password
      );
      return userCredential;
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in");
    }
  },

  async signUpWithEmail(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        getAuth(),
        email,
        password
      );
      return userCredential;
    } catch (error: any) {
      throw new Error(error.message || "Failed to create account");
    }
  },

  // Google Sign-In
  async signInWithGoogle() {
    try {
      console.log("Starting Google Sign-In process...");

      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      console.log("Google Play Services are available.");

      // Get the user's ID token
      const signInResult = await GoogleSignin.signIn();
      console.log("Google Sign-In successful");

      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error("No ID token found");
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(
        getAuth(),
        googleCredential
      );
      console.log("User signed in with Google:", userCredential.user.uid);

      return userCredential;
    } catch (error: any) {
      console.error("Error during Google Sign-In:", error);
      throw new Error(error.message || "Failed to sign in with Google");
    }
  },

  // Apple Sign-In
  async signInWithApple() {
    try {
      console.log("Starting Apple Sign-In process...");

      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      console.log("Apple Auth Request Response received");

      // Ensure Apple returned a user identityToken
      if (!appleAuthRequestResponse.identityToken) {
        throw new Error("Apple Sign-In failed - no identity token returned");
      }

      // Create a Firebase credential from the response
      const { identityToken, nonce } = appleAuthRequestResponse;
      const appleCredential = AppleAuthProvider.credential(
        identityToken,
        nonce
      );

      // Sign the user in with the credential
      const userCredential = await signInWithCredential(
        getAuth(),
        appleCredential
      );
      console.log("User signed in with Apple:", userCredential.user.uid);

      return userCredential;
    } catch (error: any) {
      console.error("Error during Apple Sign-In:", error);
      throw new Error(error.message || "Failed to sign in with Apple");
    }
  },

  // Sign Out
  async signOut() {
    try {
      await firebaseSignOut(getAuth());
      // Also sign out from Google if they were signed in with Google
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        console.log("Google sign out not needed or failed:", googleError);
      }
      console.log("Sign out successful");
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw new Error("Failed to sign out");
    }
  },
};
