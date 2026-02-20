"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link"; // Import Link for navigation
import {
	Plus,
	Trash2,
	Edit3,
	DollarSign,
	Package,
	ShoppingCart,
	TrendingUp,
	Save,
	X,
	ExternalLink,
	ShoppingBag,
	Loader2,
} from "lucide-react";
import { User } from "firebase/auth";
import {
	subscribeToProducts,
	addProductToDB,
	deleteProductFromDB,
	updateProductInDB,
} from "@/app/utils/db-functions";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/utils/AuthContext";

export default function Page() {
	const [products, setProducts] = useState<FirebaseProduct[]>([]);
	const { username } = useParams<{ username: string }>();
	const [loading, setLoading] = useState(true);
	const { user } = useAuth();

	useEffect(() => {
		if (!user) return;

		// Start listening to the subcollection
		const unsubscribe = subscribeToProducts(user.uid, (fetchedProducts) => {
			setProducts(fetchedProducts);
			setLoading(false);
		});

		// Clean up the listener when the component unmounts
		return () => unsubscribe();
	}, [user]);

	// This will automatically recalculate every time the 'products' array changes
	const calcItems = useMemo(() => {
		const revenue = products.reduce(
			(acc, curr) => acc + curr.number_sold * curr.price,
			0,
		);
		const itemsSold = products.reduce((acc, curr) => acc + curr.number_sold, 0);
		const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);

		return {
			revenue,
			itemsSold,
			totalStock,
		};
	}, [products]); // Re-run calculation only when products change

	if (loading)
		return (
			<div className='min-h-screen flex items-center justify-center bg-black text-white font-sans'>
				<div className='text-center space-y-6'>
					<Loader2 className='mx-auto animate-spin' size={48} />
					<h1 className='text-3xl font-black tracking-tighter italic'>
						Loading Dashboard...
					</h1>
					<p className='text-zinc-500 text-lg font-medium'>
						Fetching your products and stats, please wait.
					</p>
				</div>
			</div>
		);
	return (
		<>
			{user && user.displayName === username ? (
				<CreatorDashboard
					user={user}
					products={products}
					calcItems={calcItems}
				/>
			) : (
				<div className='min-h-screen flex items-center justify-center bg-black text-white font-sans'>
					<div className='text-center space-y-6'>
						<h1 className='text-4xl font-black tracking-tighter italic'>
							Access Denied
						</h1>
						<p className='text-zinc-500 text-lg font-medium'>
							You do not have permission to view this dashboard.
						</p>
						<Link
							href='/home'
							className='inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-6 py-3 rounded-xl border border-zinc-700 transition text-sm font-bold'
						>
							Go Back Home
						</Link>
					</div>
				</div>
			)}
		</>
	);
}

const CreatorDashboard = ({
	user,
	products,
	calcItems,
}: {
	user: User;
	products: FirebaseProduct[];
	calcItems: { revenue: number; itemsSold: number; totalStock: number };
}) => {
	const { displayName: username } = user;

	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [newProduct, setNewProduct] = useState({
		name: "",
		price: "",
		stock: "",
	});

	const avgOrderValue =
		calcItems.itemsSold > 0 ? calcItems.revenue / calcItems.itemsSold : 0;

	const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!user) return alert("You must be logged in");
		try {
			// 1. Call the Firebase function
			await addProductToDB(
				user.uid,
				newProduct.name,
				parseFloat(newProduct.price) || 0,
				parseInt(newProduct.stock) || 0,
			);

			// 2. Reset UI State
			setNewProduct({ name: "", price: "", stock: "" });
			setIsAdding(false);
		} catch (err) {
			console.error("Failed to add product:", err);
		}
	};

	const handleDelete = async (id: string) => {
		if (!user) return;

		if (confirm("Permanently delete this product from your shop?")) {
			try {
				// Call the Firebase function
				await deleteProductFromDB(user.uid, id);
			} catch (err) {
				console.error("Failed to delete product:", err);
			}
		}
	};

	const handleUpdate = async (
		id: string,
		field: keyof FirebaseProduct,
		value: string,
	) => {
		if (!user) return;

		try {
			// 1. Determine the correct data type for the field
			const formattedValue = field === "name" ? value : parseFloat(value) || 0;

			// 2. Call the Firebase function
			await updateProductInDB(user.uid, id, {
				[field]: formattedValue,
			});
		} catch (err) {
			console.error("Failed to update product:", err);
		}
	};

	return (
		<div className='min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black'>
			{/* --- UPDATED NAVBAR --- */}
			<nav className='w-full h-[12vh] border-b border-zinc-800 flex items-center justify-between px-8 bg-black/80 backdrop-blur-xl sticky top-0 z-50'>
				<div className='flex items-center gap-3'>
					<h1 className='text-2xl font-black tracking-tighter italic'>
						StreamLIVE
					</h1>
					<span className='bg-zinc-800 text-zinc-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest hidden sm:inline-block'>
						Dashboard
					</span>
				</div>

				<div className='flex items-center gap-6'>
					{/* View Shop Link */}
					<Link
						href={`/shop/${username}/products`}
						target='_blank'
						className='flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-4 py-2 rounded-xl border border-zinc-800 transition text-sm font-bold'
					>
						<ShoppingBag size={18} />
						<span>View Shop</span>
						<ExternalLink size={14} className='opacity-50' />
					</Link>

					{/* Creator Info & Status */}
					<div className='flex items-center gap-4 border-l border-zinc-800 pl-6'>
						<div className='text-right'>
							<div className='flex items-center justify-end gap-2 mb-0.5'>
								<span className='relative flex h-2 w-2'>
									<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
									<span className='relative inline-flex rounded-full h-2 w-2 bg-green-500'></span>
								</span>
								<p className='text-[10px] text-green-500 font-black uppercase tracking-tighter'>
									Live Now
								</p>
							</div>
							<p className='text-sm font-black tracking-tight leading-tight'>
								@{username}
							</p>
						</div>

						{/* Avatar */}
						<div className='relative'>
							<div className='w-12 h-12 rounded-2xl bg-linear-to-tr from-zinc-700 to-zinc-900 border border-zinc-700 shadow-xl flex items-center justify-center overflow-hidden'>
								<span className='text-xl font-black text-zinc-400 uppercase'>
									{username?.charAt(0).toUpperCase()}
								</span>
							</div>
						</div>
					</div>
				</div>
			</nav>

			<main className='p-6 md:p-10 max-w-7xl mx-auto space-y-10'>
				{/* Dashboard Metrics Grid */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					<StatCard
						title='Total Revenue'
						value={`$${calcItems.revenue.toLocaleString()}`}
						icon={<DollarSign className='text-green-400' />}
					/>
					<StatCard
						title='Items Sold'
						value={calcItems.itemsSold.toLocaleString()}
						icon={<ShoppingCart className='text-blue-400' />}
					/>
					<StatCard
						title='Total Stock'
						value={calcItems.totalStock.toLocaleString()}
						icon={<Package className='text-orange-400' />}
					/>
					<StatCard
						title='Avg. Order'
						value={`$${avgOrderValue.toFixed(2)}`}
						icon={<TrendingUp className='text-purple-400' />}
					/>
				</div>

				{/* Header & Toggle Section */}
				<div className='flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800 gap-4'>
					<div>
						<h2 className='text-2xl font-black text-zinc-100'>
							Inventory Management
						</h2>
						<p className='text-zinc-500 text-sm font-medium mt-1'>
							Add or modify your digital stream products
						</p>
					</div>
					<button
						onClick={() => setIsAdding(!isAdding)}
						className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all duration-300 ${
							isAdding
								? "bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700"
								: "bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5"
						}`}
					>
						{isAdding ? (
							<>
								<X size={20} /> Cancel
							</>
						) : (
							<>
								<Plus size={20} /> New Product
							</>
						)}
					</button>
				</div>

				{/* Add Product Form */}
				{isAdding && (
					<form
						onSubmit={handleAddProduct}
						className='bg-zinc-900 border border-zinc-700 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500'
					>
						<div className='md:col-span-1 space-y-2'>
							<label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1'>
								Product Name
							</label>
							<input
								required
								type='text'
								placeholder='Overlay Pack'
								className='w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 focus:border-white outline-none transition'
								value={newProduct.name}
								onChange={(e) =>
									setNewProduct({ ...newProduct, name: e.target.value })
								}
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1'>
								Price ($)
							</label>
							<input
								required
								type='number'
								step='0.01'
								placeholder='0.00'
								className='w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 focus:border-white outline-none transition'
								value={newProduct.price}
								onChange={(e) =>
									setNewProduct({ ...newProduct, price: e.target.value })
								}
							/>
						</div>
						<div className='space-y-2'>
							<label className='text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1'>
								Initial Stock
							</label>
							<input
								required
								type='number'
								placeholder='100'
								className='w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 focus:border-white outline-none transition'
								value={newProduct.stock}
								onChange={(e) =>
									setNewProduct({ ...newProduct, stock: e.target.value })
								}
							/>
						</div>
						<div className='flex items-end'>
							<button
								type='submit'
								className='w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl transition shadow-lg shadow-green-900/20 active:scale-95'
							>
								Save to Shop
							</button>
						</div>
					</form>
				)}

				{/* Inventory Table */}
				<div className='bg-zinc-900/20 border border-zinc-800 rounded-4xl overflow-hidden'>
					<div className='overflow-x-auto'>
						<table className='w-full text-left'>
							<thead className='bg-zinc-900/60 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800'>
								<tr>
									<th className='px-8 py-5'>Product Details</th>
									<th className='px-8 py-5'>Price</th>
									<th className='px-8 py-5'>Stock Level</th>
									<th className='px-8 py-5'>Performance</th>
									<th className='px-8 py-5 text-right'>Actions</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-zinc-800/40'>
								{products.map((product) => (
									<tr
										key={product.id}
										className='group hover:bg-white/1 transition-colors'
									>
										<td className='px-8 py-6'>
											<p className='font-bold text-lg'>{product.name}</p>
											<p className='text-zinc-600 text-xs font-mono uppercase tracking-tighter mt-0.5'>
												ID-{product.id}
											</p>
										</td>
										<td className='px-8 py-6'>
											{editingId === product.id ? (
												<input
													autoFocus
													className='bg-black border border-zinc-700 rounded-lg px-3 py-2 w-28 outline-none focus:border-blue-500 font-bold'
													type='number'
													value={product.price}
													onChange={(e) =>
														handleUpdate(product.id, "price", e.target.value)
													}
												/>
											) : (
												<span className='text-zinc-200 font-bold text-lg'>
													${product.price.toFixed(2)}
												</span>
											)}
										</td>
										<td className='px-8 py-6'>
											{editingId === product.id ? (
												<input
													className='bg-black border border-zinc-700 rounded-lg px-3 py-2 w-24 outline-none focus:border-blue-500 font-bold'
													type='number'
													value={product.stock}
													onChange={(e) =>
														handleUpdate(product.id, "stock", e.target.value)
													}
												/>
											) : (
												<div className='flex flex-col gap-1'>
													<span
														className={`text-xs font-black uppercase ${product.stock < 10 ? "text-red-500" : "text-zinc-500"}`}
													>
														{product.stock < 10 ? "Low Stock" : "In Stock"}
													</span>
													<span className='font-bold'>
														{product.stock} units
													</span>
												</div>
											)}
										</td>
										<td className='px-8 py-6'>
											<div className='flex flex-col'>
												<span className='text-zinc-300 font-black tracking-tight'>
													{product.number_sold} sales
												</span>
												<span className='text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5'>
													$
													{(
														product.price * product.number_sold
													).toLocaleString()}{" "}
													total
												</span>
											</div>
										</td>
										<td className='px-8 py-6 text-right'>
											<div className='flex justify-end gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity'>
												<button
													onClick={() =>
														setEditingId(
															editingId === product.id ? null : product.id,
														)
													}
													className={`p-3 rounded-xl transition border ${editingId === product.id ? "bg-blue-600 border-blue-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"}`}
												>
													{editingId === product.id ? (
														<Save size={18} />
													) : (
														<Edit3 size={18} />
													)}
												</button>
												<button
													onClick={() => handleDelete(product.id)}
													className='p-3 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition'
												>
													<Trash2 size={18} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</div>
	);
};

// Internal Component for Stat Cards
const  StatCard = ({
	title,
	value,
	icon,
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
}) => {
	return (
		<div className='bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between hover:bg-zinc-900/60 transition-all group'>
			<div className='space-y-1'>
				<p className='text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]'>
					{title}
				</p>
				<p className='text-3xl font-black italic'>{value}</p>
			</div>
			<div className='p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/50 group-hover:scale-110 transition-transform duration-500'>
				{icon}
			</div>
		</div>
	);
}