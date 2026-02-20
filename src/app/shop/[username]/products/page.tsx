"use client";
import { useEffect, useState } from "react";
import {
	ShoppingBag,
	X,
	Plus,
	Minus,
	Trash2,
	CheckCircle2,
	Globe,
	ExternalLink,
} from "lucide-react";
import { checkoutCart, getProductsByUsername } from "@/app/utils/db-functions";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function Page() {
	const { username } = useParams<{ username: string }>();
	const [products, setProducts] = useState<FirebaseProduct[]>([]);
	const [sellerID, setSellerID] = useState<string>("");

	useEffect(() => {
		const fetchProducts = async () => {
			const { success, products, sellerID } =
				await getProductsByUsername(username);
			if (success && sellerID) {
				setProducts(products);
				setSellerID(sellerID);
			} else {
				console.error("Failed to fetch products for username:", username);
			}
		};
		fetchProducts();
	}, [username]); // Placeholder for fetching products from DB based on username

	return (
		<StreamPage username={username} products={products} sellerID={sellerID} />
	);
}

const StreamPage = ({
	username,
	products,
	sellerID,
}: {
	username: string;
	products: FirebaseProduct[];
	sellerID: string;
}) => {
	const [cart, setCart] = useState<CartItem[]>([]);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [isSuccessOpen, setIsSuccessOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [paidAmount, setPaidAmount] = useState(0);

	const addToCart = (product: FirebaseProduct) => {
		setCart((prev) => {
			// 1. Find if the item is already in the cart
			const existingItem = prev.find((item) => item.id === product.id);

			if (existingItem) {
				// 2. If it exists, check if adding one more would exceed stock
				if (existingItem.quantity < product.stock) {
					return prev.map((item) =>
						item.id === product.id
							? { ...item, quantity: item.quantity + 1 }
							: item,
					);
				} else {
					// Optional: Alert the user they hit the limit
					alert(`Only ${product.stock} items available in stock.`);
					return prev;
				}
			}

			// 3. If it's a new item, check if there's at least 1 in stock
			if (product.stock > 0) {
				return [...prev, { ...product, quantity: 1 }];
			} else {
				alert("This item is currently out of stock.");
				return prev;
			}
		});
	};

	const decreaseQuantity = (productId: string) => {
		setCart((prev) =>
			prev.map((item) =>
				item.id === productId && item.quantity > 1
					? { ...item, quantity: item.quantity - 1 }
					: item,
			),
		);
	};

	const removeFromCart = (productId: string) => {
		setCart((prev) => prev.filter((item) => item.id !== productId));
	};

	const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
	const cartTotal = cart.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);

	const handleCheckout = async () => {
		// 1. Prevent checkout if cart is empty or already processing
		if (cart.length === 0) return;

		try {
			// Optional: Add a loading state here if you have one
			setIsProcessing(true);

			// 2. Perform the Firestore update
			// This reduces stock and increases number_sold for all items in the batch
			await checkoutCart(cart, sellerID);

			// 3. UI Updates (only run if the DB update was successful)
			setPaidAmount(cartTotal);
			setIsCartOpen(false);
			setCart([]); // Clear the cart
			setIsSuccessOpen(true);

			await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds before refreshing or updating UI

			location.reload(); // Refresh the page to get updated stock values (optional, can be optimized by updating state instead)

			console.log("Checkout successful and database updated.");
		} catch (error) {
			console.error("Checkout failed:", error);
			alert("There was an error processing your order. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};
	return (
		<div className='flex flex-col min-h-screen bg-black text-white'>
			{/* Navbar */}
			<Navbar
				cartCount={cartCount}
				setIsCartOpen={setIsCartOpen}
				isCartOpen={isCartOpen}
			/>

			{/* --- NEW PROFILE SECTION --- */}
			<Header username={username} />

			{/* Product List */}
			<main className='p-10'>
				<div className='flex items-center justify-center gap-3 mb-8'>
					<div className='h-px w-8 bg-zinc-800'></div>
					<h2 className='text-sm font-black uppercase tracking-[0.3em] text-zinc-500'>
						Shop Products
					</h2>
					<div className='h-px w-8 bg-zinc-800'></div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
					{products.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							addToCart={addToCart}
							cart={cart}
						/>
					))}
				</div>
			</main>

			{/* Cart Modal Overlay (unchanged logic, refined UI) */}
			{isCartOpen && (
				<CartModal
					cart={cart}
					decreaseQuantity={decreaseQuantity}
					removeFromCart={removeFromCart}
					cartTotal={cartTotal}
					handleCheckout={handleCheckout}
					isProcessing={isProcessing}
					setIsCartOpen={setIsCartOpen}
					addToCart={addToCart}
				/>
			)}

			{/* Success Modal */}
			{isSuccessOpen && (
				<SuccessModal
					paidAmount={paidAmount}
					setIsSuccessOpen={setIsSuccessOpen}
				/>
			)}
		</div>
	);
};

// ---- Sub components ---
// Nav
const Navbar = ({
	cartCount,
	setIsCartOpen,
	isCartOpen,
}: {
	cartCount: number;
	setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
	isCartOpen: boolean;
}) => {
	return (
		<nav className='w-full h-[10vh] bg-black border-b border-zinc-900 flex items-center justify-between px-8 py-2 sticky top-0 z-10'>
			<h1 className='text-2xl font-black tracking-tighter italic'>
				StreamLIVE
			</h1>

			<button
				onClick={() => setIsCartOpen(!isCartOpen)}
				className='relative p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition border border-zinc-700 shadow-lg'
			>
				<ShoppingBag size={20} />
				{cartCount > 0 && (
					<span className='absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in fade-in zoom-in duration-300'>
						{cartCount}
					</span>
				)}
			</button>
		</nav>
	);
};
// Header Component with profile info and external link
const Header = ({ username }: { username: string }) => {
	return (
		<header className='flex flex-col items-center pt-12 pb-8 px-6 text-center border-b border-zinc-900'>
			{/* Profile Image / Avatar */}
			<div className='w-24 h-24 rounded-full bg-linear-to-tr from-zinc-700 to-zinc-900 border-2 border-zinc-800 p-1 mb-4 shadow-xl'>
				<div className='w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden'>
					{/* Placeholder Initials or Image */}
					<span className='text-3xl font-bold text-zinc-400 uppercase'>
						{username?.charAt(0) || "S"}
					</span>
				</div>
			</div>

			{/* Name & Bio */}
			<h1 className='text-3xl font-black mb-2 lowercase'>@{username}</h1>
			<p className='text-zinc-400 max-w-md leading-relaxed text-sm mb-4'>
				Digital creator specializing in high-quality stream assets and animated
				overlays. Building the future of streaming interfaces, one pixel at a
				time.
			</p>

			{/* External URL */}
			<Link
				href={`https://streamlive.io/${username}`}
				target='_blank'
				className='flex items-center gap-2 text-zinc-500 hover:text-white transition text-xs font-semibold bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800'
			>
				<Globe size={14} />
				streamlive.io/{username}
				<ExternalLink size={12} />
			</Link>
		</header>
	);
};

// Reusable Product Card Component
const ProductCard = ({
	product,
	addToCart,
	cart,
}: {
	product: FirebaseProduct;
	addToCart: (product: FirebaseProduct) => void;
	cart: CartItem[];
}) => {
	return (
		<div
			key={product.id}
			className='group border border-zinc-800 p-6 rounded-2xl bg-zinc-900/40 flex flex-col items-center gap-4 hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/60'
		>
			<div className='w-full aspect-square bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800 group-hover:border-zinc-700 transition-colors'>
				<ShoppingBag className='text-zinc-800' size={40} />
			</div>
			<h3 className='text-lg font-bold'>{product.name}</h3>
			<p className='text-xl font-bold text-zinc-400'>
				${product.price.toFixed(2)}
			</p>
			<button
				disabled={
					product.stock === 0 ||
					cart.find((i) => i.id === product.id)?.quantity === product.stock
				}
				onClick={() => addToCart(product)}
				className='w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200 transition active:scale-95'
			>
				{product.stock < 1 ? "Out of Stock" : "Add to Cart"}
			</button>
		</div>
	);
};

// Modal Components (Cart & Success) - Refined UI and UX
const SuccessModal = ({
	paidAmount,
	setIsSuccessOpen,
}: {
	paidAmount: number;
	setIsSuccessOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	return (
		<div
			className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-in fade-in duration-300'
			onClick={() => setIsSuccessOpen(false)}
		>
			<div
				className='w-full max-w-sm bg-zinc-950 border border-zinc-800 p-8 rounded-4xl text-center shadow-2xl animate-in zoom-in-95 duration-300'
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex justify-center mb-6'>
					<div className='p-4 bg-green-500/10 rounded-full border border-green-500/20'>
						<CheckCircle2 size={64} className='text-green-500' />
					</div>
				</div>

				<h2 className='text-3xl font-black mb-2'>Order Confirmed</h2>
				<p className='text-zinc-400 mb-8 text-sm leading-relaxed px-4'>
					Transaction complete. You have successfully paid{" "}
					<span className='text-white font-black'>
						${paidAmount.toFixed(2)}
					</span>
					.
				</p>

				<button
					onClick={() => setIsSuccessOpen(false)}
					className='w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black py-4 rounded-2xl transition border border-zinc-800 uppercase text-xs tracking-widest'
				>
					Return to Store
				</button>
			</div>
		</div>
	);
};

// Cart Modal Component with quantity controls and improved UX
const CartModal = ({
	cart,
	decreaseQuantity,
	removeFromCart,
	cartTotal,
	handleCheckout,
	isProcessing,
	setIsCartOpen,
	addToCart,
}: {
	cart: CartItem[];
	decreaseQuantity: (productId: string) => void;
	removeFromCart: (productId: string) => void;
	cartTotal: number;
	handleCheckout: () => void;
	isProcessing: boolean;
	setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
	addToCart: (product: FirebaseProduct) => void;
}) => {
	return (
		<div
			className='fixed inset-0 bg-black/60 z-20 flex justify-end backdrop-blur-sm'
			onClick={() => setIsCartOpen(false)}
		>
			<div
				className='w-full max-w-md bg-zinc-950 h-full p-6 flex flex-col shadow-2xl border-l border-zinc-800 animate-in slide-in-from-right duration-300'
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex justify-between items-center mb-8'>
					<h2 className='text-2xl font-black'>Your Bag</h2>
					<button
						onClick={() => setIsCartOpen(false)}
						className='p-2 hover:bg-zinc-800 rounded-full transition'
					>
						<X size={24} />
					</button>
				</div>

				<div className='grow overflow-y-auto space-y-4 pr-2'>
					{cart.length === 0 ? (
						<div className='text-center text-zinc-600 mt-20'>
							<ShoppingBag size={48} className='mx-auto mb-4 opacity-10' />
							<p className='font-medium'>Your bag is empty</p>
						</div>
					) : (
						cart.map((item) => (
							<div
								key={item.id}
								className='flex justify-between items-center p-4 bg-zinc-900/50 rounded-xl border border-zinc-800'
							>
								<div className='flex-1'>
									<p className='font-bold text-lg'>{item.name}</p>
									<p className='text-sm font-bold text-zinc-500'>
										${(item.price * item.quantity).toFixed(2)}
									</p>
								</div>

								<div className='flex items-center gap-4'>
									<div className='flex items-center bg-black rounded-lg border border-zinc-700 p-1'>
										<button
											onClick={() => decreaseQuantity(item.id)}
											className={`p-1 transition ${item.quantity <= 1 ? "text-zinc-800 cursor-not-allowed" : "text-zinc-500 hover:text-white"}`}
											disabled={item.quantity <= 1}
										>
											<Minus size={14} />
										</button>
										<span className='w-8 text-center text-xs font-black'>
											{item.quantity}
										</span>
										<button
											onClick={() => addToCart(item)}
											className='p-1 hover:text-white text-zinc-500 transition'
										>
											<Plus size={14} />
										</button>
									</div>

									<button
										onClick={() => removeFromCart(item.id)}
										className='text-zinc-700 hover:text-red-500 transition p-1'
									>
										<Trash2 size={18} />
									</button>
								</div>
							</div>
						))
					)}
				</div>

				<div className='border-t border-zinc-900 pt-6 mt-6'>
					<div className='flex justify-between text-xl font-black mb-6 px-2 italic'>
						<span className='text-zinc-500 uppercase text-sm tracking-widest not-italic'>
							Total
						</span>
						<span>${cartTotal.toFixed(2)}</span>
					</div>
					<button
						onClick={handleCheckout}
						disabled={cart.length === 0 || isProcessing}
						className='w-full bg-white text-black font-black py-4 rounded-xl hover:bg-zinc-200 transition uppercase tracking-tighter disabled:opacity-30 disabled:grayscale'
					>
						{isProcessing ? "Processing..." : "Complete Purchase"}
					</button>
				</div>
			</div>
		</div>
	);
};