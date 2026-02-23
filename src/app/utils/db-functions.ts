import db from "./firebase";
import {
	collection,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	onSnapshot,
	query,
	orderBy,
	getDocs,
	where,
	writeBatch,
	increment,
} from "firebase/firestore";

import image1 from "./files/images/image1.jpg";
import image2 from "./files/images/image2.jpg";
import image3 from "./files/images/image3.jpg";
import image4 from "./files/images/image4.jpg";

const IMAGES = [image1, image2, image3, image4];
// const VIDEOS = ["https://www.youtube.com/shorts/M4sLQh5gA04?feature=share", "https://www.youtube.com/shorts/8f-zYskHkO8?feature=share", "https://www.youtube.com/shorts/pOuNSoukRDI?feature=share"];

/**
 * 
 * Generates a URL-friendly slug from livestream title and as the call ID for the stream. It appends 4 random letters to ensure uniqueness.
 * Example: "My Awesome Stream!" -> "my-awesome-stream-abcd"
 */
export const generateID = (title: string): string => {
	// Convert title to lowercase and replace spaces and non-alphanumerics with hyphens
	const slug = title
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s]/g, "") // remove special characters
		.replace(/\s+/g, "-"); // replace spaces with hyphens

	// Generate 4 random lowercase letters
	const randomLetters = Array.from({ length: 4 }, () =>
		String.fromCharCode(97 + Math.floor(Math.random() * 26)),
	).join("");

	return `${slug}-${randomLetters}`;
};

export const myAd: FeedItem = {
	id: 99,
	type: "ad",
	color: "bg-zinc-800",
	brandName: "DhaStix Beauty Store",
	ctaLabel: "Shop Now",
	description:
		"Get 20% off on all Premium Streamer Overlays! Limited time only. 🚀",
	shopUrl: "/shop/dhastix/products",
};

// const generateID = () => Math.random().toString(36).substring(2, 24);
/**
 * ADD PRODUCT
 * Path: users/{userId}/products
 */
export const addProductToDB = async (
	userId: string,
	name: string,
	price: number,
	stock: number,
) => {
	try {
		const productRef = collection(db, "users", userId, "products");
		const docRef = await addDoc(productRef, {
			name,
			price,
			stock,
			number_sold: 0, // Initialized at 0
		});
		return { success: true, id: docRef.id };
	} catch (error) {
		console.error("Error adding product:", error);
		throw error;
	}
};

/**
 * UPDATE PRODUCT
 * Path: users/{userId}/products/{productId}
 */
export const updateProductInDB = async (
	userId: string,
	productId: string,
	updates: Partial<FirebaseProduct>,
) => {
	try {
		const docRef = doc(db, "users", userId, "products", productId);
		await updateDoc(docRef, updates);
		return { success: true };
	} catch (error) {
		console.error("Error updating product:", error);
		throw error;
	}
};

/**
 * DELETE PRODUCT
 */
export const deleteProductFromDB = async (
	userId: string,
	productId: string,
) => {
	try {
		const docRef = doc(db, "users", userId, "products", productId);
		await deleteDoc(docRef);
		return { success: true };
	} catch (error) {
		console.error("Error deleting product:", error);
		throw error;
	}
};

/**
 *  Real-time Listener (Recommended for UI)
 * This function takes a callback that runs every time the data changes.
 */
export const subscribeToProducts = (
	userId: string,
	callback: (products: FirebaseProduct[]) => void,
) => {
	const productRef = collection(db, "users", userId, "products");

	// Order by 'name' instead of 'createdAt'
	const q = query(productRef, orderBy("name", "asc"));

	return onSnapshot(
		q,
		(snapshot) => {
			const products = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as FirebaseProduct[];

			callback(products);
		},
		(error) => {
			console.error("Snapshot error:", error);
		},
	);
};

/**
 * Fetch all products for a user based on their username.
 * Useful for public profile pages (e.g., mysite.com/username)
 */
export const getProductsByUsername = async (username: string) => {
	try {
		// STEP 1: Find the user by username
		const usersRef = collection(db, "users");
		// Ensure username casing matches how you saved it (e.g., lowercase)
		const userQuery = query(usersRef, where("username", "==", username.trim()));
		const userSnapshot = await getDocs(userQuery);

		// If no user is found with that username, return an error state
		if (userSnapshot.empty) {
			return {
				success: false,
				userExists: false,
				products: [],
				message: "User not found",
			};
		}

		// Get the userId (which is the document ID) from the first matched document
		const userId = userSnapshot.docs[0].id;

		// STEP 2: Fetch the products using the found userId
		const productsRef = collection(db, "users", userId, "products");

		// Optional: order by name so it looks neat
		const productsQuery = query(productsRef, orderBy("name", "asc"));
		const productsSnapshot = await getDocs(productsQuery);

		const products: FirebaseProduct[] = productsSnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as FirebaseProduct[];

		return {
			success: true,
			userExists: true,
			sellerID: userId,
			products: products,
		};
	} catch (error) {
		console.error("Error fetching products by username:", error);
		return {
			success: false,
			userExists: false,
			sellerID: null,
			products: [],
			message: "An error occurred while fetching products",
		};
	}
};

export const checkoutCart = async (cart: CartItem[], sellerID: string) => {
	const batch = writeBatch(db);

	try {
		cart.forEach((item) => {
			// Reference to the specific product in the seller's sub-collection
			const productRef = doc(db, "users", sellerID, "products", item.id);

			batch.update(productRef, {
				// Atomicly reduce stock by the quantity in cart
				stock: item.quantity < item.stock ? increment(-item.quantity) : 0,
				// Atomicly increase number_sold by the quantity in cart
				number_sold:
					item.quantity <= item.stock
						? increment(item.quantity)
						: increment(item.stock),
			});
		});

		// Commit all updates at once
		await batch.commit();
		return { success: true };
	} catch (error) {
		console.error("Checkout failed:", error);
		throw error;
	}
};

/**
 * Returns a single random picture from the array
 */
export const getRandomPicture = () => {
    const randomIndex = Math.floor(Math.random() * IMAGES.length);
    return IMAGES[randomIndex];
};

/**
 * Returns a single random video from the array
 */
// export const getRandomVideo = () => {
//     const randomIndex = Math.floor(Math.random() * VIDEOS.length);
//     return VIDEOS[randomIndex];
// };