import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
} from "firebase/auth";
import db, { auth } from "./firebase";
import {
	collection,
	query,
	where,
	getDocs,
	doc,
	setDoc,
	serverTimestamp,
	getDoc,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { createStreamUser } from "@/actions/stream.actions";

export const signUp = async (form: FormData) => {
	const username = (form.get("username") as string).trim().toLowerCase();
	const email = form.get("email") as string;
	const password = form.get("password") as string;

	try {
		// 1. Check if the username is already taken in Firestore
		// (Firebase Auth handles email uniqueness automatically, but not usernames)
		const usersRef = collection(db, "users");
		const usernameQuery = query(usersRef, where("username", "==", username));
		const querySnapshot = await getDocs(usernameQuery);

		if (!querySnapshot.empty) {
			return {
				code: "auth/username-already-in-use",
				status: 400,
				user: null,
				message: "This username is already taken.",
			};
		}

		// 2. Create the user in Firebase Authentication
		const { user } = await createUserWithEmailAndPassword(
			auth,
			email,
			password,
		);

		// 3. Update the Auth profile displayName
		await updateProfile(user, {
			displayName: username,
		});

		// 4. Create the document in the 'users' collection
		// We use user.uid as the document ID to ensure they match
		await setDoc(doc(db, "users", user.uid), {
			uid: user.uid,
			username: username,
			email: email,
			createdAt: serverTimestamp(),
		});

		return {
			code: "auth/success",
			status: 200,
			user,
			message: "Account created successfully! 🎉",
		};
	} catch (err) {
		const error = err as FirebaseError;
		console.error("Error creating user:", err);

		// Handle specific Firebase Auth errors (like email already exists)
		let message = "Failed to create user";
		if (error.code === "auth/email-already-in-use") {
			message = "This email is already registered.";
		} else if (error.code === "auth/weak-password") {
			message = "The password is too weak.";
		}

		return {
			code: error.code || "auth/failed",
			status: 500,
			user: null,
			message: message,
		};
	}
};

export const logIn = async (form: FormData) => {
	// 1. Normalize input
	const email = form.get("email") as string;
	const password = form.get("password") as string;

	try {
		// 2. Authenticate with Firebase Auth first
		// This checks if the email exists and the password is correct
		const { user } = await signInWithEmailAndPassword(auth, email, password);

		// 3. Check if the user exists in the Firestore 'users' collection
		// Since we saved the Doc ID as the UID during signup, we look it up directly
		const userDocRef = doc(db, "users", user.uid);
		const userDoc = await getDoc(userDocRef);
		await createStreamUser(
			user.uid,
			userDoc.data()?.username,
			`${process.env.NEXT_PUBLIC_IMAGE_URL}${user.displayName}`,
		);

		if (!userDoc.exists()) {
			// If the user is authenticated but has no database record,
			// we sign them out to prevent them from accessing protected pages.
			await signOut(auth);

			return {
				code: "auth/user-not-found-in-db",
				status: 404,
				user: null,
				message: "User account exists, but profile data was not found.",
			};
		}

		// 4. Success: User is authenticated and exists in the database
		return {
			code: "auth/success",
			status: 200,
			user,
			message: "Login successful! 👋",
		};
	} catch (err) {
		// 5. Handle Firebase Errors
		const error = err as FirebaseError;
		console.error("Error logging in:", error.code);

		let message = "Failed to login";

		// Modern Firebase returns 'invalid-credential' for both wrong password and wrong email
		// to prevent "User Enumeration" (hackers guessing which emails are registered).
		if (
			error.code === "auth/invalid-credential" ||
			error.code === "auth/user-not-found" ||
			error.code === "auth/wrong-password"
		) {
			message = "Invalid email or password.";
		} else if (error.code === "auth/too-many-requests") {
			message = "Too many failed attempts. Try again later.";
		}

		return {
			code: error.code || "auth/failed",
			status: 500,
			user: null,
			message: message,
		};
	}
};

export const logOut = async () => {
	try {
		await auth.signOut();
		return { code: "auth/success", status: 200, message: "Logout successful" };
	} catch (err) {
		return {
			code: "auth/failed",
			status: 500,
			message: "Failed to logout",
			err,
		};
	}
};