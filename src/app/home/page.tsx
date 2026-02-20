"use client";
import { useState } from "react";
import {
	Home,
	Search,
	Compass,
	Users,
	Video,
	PlusSquare,
	MessageCircle,
	Heart,
	Bookmark,
	Share2,
	ChevronUp,
	ChevronDown,
	Volume2,
	MoreHorizontal,
	X,
	Play,
	ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logOut } from "../utils/auth-functions";
import { useAuth } from "../utils/AuthContext";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { generateSlug, myAd } from "../utils/db-functions";
import { createChannel } from "@/actions/stream.actions";
import { useGetLiveStreams } from "../utils/useGetLiveStreams";

export default function TikTokUI() {
	const router = useRouter();
	const { user } = useAuth();
	const client = useStreamVideoClient();
	const [activeIndex, setActiveIndex] = useState(0);
	const [call, setCall] = useState<Call | null>(null);
	const { calls } = useGetLiveStreams();
	const combinedFeed: FeedItem[] = [...calls];
	if (combinedFeed.length > 0) {
		combinedFeed.splice(1, 0, myAd);
	} else {
		combinedFeed.push(myAd);
	}
	const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
	const [isSuccessState, setIsSuccessState] = useState(false);
	const [liveForm, setLiveForm] = useState({
		title: "",
		content: "",
		hashtags: "",
	});

	// --- INFINITE NAVIGATION LOGIC ---
	const nextPost = () =>
		setActiveIndex((prev) => (prev === combinedFeed.length - 1 ? 0 : prev + 1));

	const prevPost = () =>
		setActiveIndex((prev) => (prev === 0 ? combinedFeed.length - 1 : prev - 1));

	const handleSubmitForm = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!client || !user)
			return console.error("Stream Video client is not initialized");
		try {
			const call = client.call("livestream", generateSlug(liveForm.title));
			if (!call) throw new Error("Failed to create meeting");

			await call.getOrCreate({
				data: {
					custom: {
						title: liveForm.title,
						description: liveForm.content,
						hashtags: liveForm.hashtags.split(",").map((tag) => tag.trim()),
					},
					members: [{ user_id: user.uid as string, role: "host" }],
				},
			});

			//create channel
			await createChannel(call.id, liveForm.title, user.uid as string);

			setIsSuccessState(true);
			setCall(call);
		} catch (error) {
			console.error("Error creating call:", error);
		}
	};

	const handleFinalRedirect = () =>
		router.push(`/streams/${user?.displayName}/${call?.id}`);

	const handleLogOut = async () => {
		const { message, status } = await logOut();
		if (status !== 200) {
			return alert(message);
		}
		router.push("/");
	};

	const closeModal = () => {
		setIsLiveModalOpen(false);
		setTimeout(() => setIsSuccessState(false), 300);
	};

	return (
		<div className='flex h-screen bg-black text-white overflow-hidden relative'>
			{/* --- LEFT SIDEBAR --- */}
			<aside className='w-64 border-r border-gray-800 p-4 hidden md:flex flex-col gap-2'>
				<h1 className='text-2xl font-black tracking-tighter italic mb-8 px-2'>
					StreamLIVE
				</h1>
				<NavItem icon={<Home size={24} />} label='For You' active />
				<div onClick={() => setIsLiveModalOpen(true)}>
					<NavItem icon={<Video size={24} />} label='GO LIVE' />
				</div>
				<NavItem icon={<Compass size={24} />} label='Explore' />
				<NavItem icon={<Users size={24} />} label='Following' />
				<NavItem icon={<PlusSquare size={24} />} label='Upload' />
				<NavItem icon={<Search size={24} />} label='Profile' />
				<NavItem icon={<MoreHorizontal size={24} />} label='More' />
			</aside>

			{/* --- MAIN CONTENT AREA --- */}
			<main className='flex-1 relative flex flex-col'>
				<header className='absolute top-0 w-full z-20 flex justify-between items-center p-4'>
					<div className='bg-[#2f2f2f] rounded-full px-4 py-1.5 flex items-center gap-2 w-96'>
						<input
							type='text'
							placeholder='Search'
							className='bg-transparent outline-none w-full text-sm'
						/>
						<Search size={18} className='text-gray-400' />
					</div>
					<button
						onClick={handleLogOut}
						className='bg-[#fe2c55] px-4 py-1.5 rounded text-sm font-semibold transition hover:brightness-110 cursor-pointer active:scale-95'
					>
						Log out
					</button>
				</header>

				<div className='flex-1 flex items-center justify-center relative overflow-hidden'>
					<div
						className='transition-transform duration-500 ease-out flex flex-col items-center h-full'
						style={{ transform: `translateY(-${activeIndex * 100}%)` }}
					>
						{combinedFeed.map((item) => (
							<div
								key={item.id}
								className='min-h-full w-full flex justify-center items-center py-4'
							>
								{"brandName" in item ? (
									<AdCard ad={item} />
								) : (
									<PostCard call={item} />
								)}
							</div>
						))}
					</div>

					{/* NO LONGER DISABLED - ALLOWS INFINITE LOOPING */}
					<div className='absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30'>
						<button
							onClick={prevPost}
							className='p-3 rounded-full bg-gray-800/50 hover:bg-gray-700 transition active:scale-95 shadow-lg'
						>
							<ChevronUp size={30} />
						</button>
						<button
							onClick={nextPost}
							className='p-3 rounded-full bg-gray-800/50 hover:bg-gray-700 transition active:scale-95 shadow-lg'
						>
							<ChevronDown size={30} />
						</button>
					</div>
				</div>
			</main>

			{/* --- GO LIVE MODAL --- */}
			{isLiveModalOpen && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'>
					<div className='bg-zinc-900 w-full max-w-md rounded-2xl p-8 border border-gray-800 relative animate-in zoom-in-95 duration-200 text-center'>
						<button
							onClick={closeModal}
							className='absolute top-4 right-4 text-gray-400 hover:text-white transition'
						>
							<X size={24} />
						</button>
						{!isSuccessState ? (
							<>
								<h2 className='text-2xl font-bold mb-6 text-left'>
									Create a Live Stream
								</h2>
								<form
									onSubmit={handleSubmitForm}
									className='flex flex-col gap-5 text-left'
								>
									<div className='flex flex-col gap-1.5'>
										<label className='text-sm font-semibold text-gray-400 uppercase tracking-widest text-[10px]'>
											Title
										</label>
										<input
											required
											type='text'
											placeholder="What's your stream about?"
											className='bg-zinc-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-[#fe2c55] transition text-sm'
											value={liveForm.title}
											onChange={(e) =>
												setLiveForm({ ...liveForm, title: e.target.value })
											}
										/>
									</div>
									<div className='flex flex-col gap-1.5'>
										<label className='text-sm font-semibold text-gray-400 uppercase tracking-widest text-[10px]'>
											Content / Description
										</label>
										<textarea
											rows={3}
											placeholder='Give more details...'
											className='bg-zinc-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-[#fe2c55] transition resize-none text-sm'
											value={liveForm.content}
											onChange={(e) =>
												setLiveForm({ ...liveForm, content: e.target.value })
											}
										/>
									</div>
									<div className='flex flex-col gap-1.5'>
										<label className='text-sm font-semibold text-gray-400 uppercase tracking-widest text-[10px]'>
											Hashtags
										</label>
										<input
											type='text'
											placeholder='#gaming #fashion #live'
											className='bg-zinc-800 border border-gray-700 rounded-lg p-3 outline-none focus:border-[#fe2c55] transition text-sm'
											value={liveForm.hashtags}
											onChange={(e) =>
												setLiveForm({ ...liveForm, hashtags: e.target.value })
											}
										/>
									</div>
									<button
										type='submit'
										className='bg-[#fe2c55] py-4 rounded-lg font-bold text-lg mt-2 transition hover:brightness-110 active:scale-[0.98]'
									>
										Go Live Now
									</button>
								</form>
							</>
						) : (
							<div className='animate-in fade-in zoom-in-90 duration-300 py-4'>
								<div className='w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 mx-auto'>
									<Play
										size={40}
										className='text-green-500 fill-green-500 ml-1'
									/>
								</div>
								<h2 className='text-2xl font-bold mb-3'>
									You&apos;re now live!
								</h2>
								<p className='text-gray-400 mb-8 max-w-70 leading-relaxed mx-auto text-sm'>
									Your audience is waiting. Click the button below to start
									streaming.
								</p>
								<button
									onClick={handleFinalRedirect}
									className='w-full bg-[#fe2c55] py-4 rounded-lg font-bold text-lg transition hover:brightness-110 active:scale-[0.98] shadow-lg shadow-red-500/20'
								>
									Start Streaming
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// --- SUB-COMPONENTS ---

const NavItem = ({
	icon,
	label,
	active = false,
}: {
	icon: React.ReactNode;
	label: string;
	active?: boolean;
}) => (
	<div
		className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-gray-900 transition ${active ? "text-[#fe2c55]" : "text-white"}`}
	>
		{icon}
		<span className='font-semibold text-lg'>{label}</span>
	</div>
);

const AdCard = ({ ad }: { ad: Ad }) => (
	<Link
		href={ad.shopUrl}
		className='relative h-[85vh] aspect-9/16 bg-zinc-900 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border border-zinc-700 group cursor-pointer'
	>
		<div
			className={`absolute inset-0 w-full h-full ${ad.color} flex items-center justify-center`}
		>
			<ShoppingCart size={80} className='text-white/10' />
		</div>
		<div className='absolute top-4 left-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border border-white/20'>
			Sponsored
		</div>
		<div className='absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black via-black/60 to-transparent'>
			<h3 className='font-black text-xl mb-1 flex items-center gap-2'>
				{ad.brandName}
				<div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
					<X size={10} strokeWidth={4} className='rotate-45' />
				</div>
			</h3>
			<p className='text-sm text-zinc-300 leading-snug mb-6'>
				{ad.description}
			</p>
			<div className='bg-white text-black font-black py-4 rounded-lg text-center transition hover:bg-zinc-200 active:scale-[0.98] flex items-center justify-center gap-2'>
				<span>{ad.ctaLabel}</span>
				<Play size={14} fill='black' />
			</div>
		</div>
	</Link>
);

const PostCard = ({ call }: { call: Call }) => (
	<Link
		href={`/streams/${call.state.createdBy?.name}/${call.id}`}
		target='_blank'
		className='relative h-[85vh] aspect-9/16 bg-zinc-900 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center border border-gray-800 group'
	>
		<div
			className={`absolute inset-0 w-full h-full bg-zinc-500 flex items-center justify-center`}
		>
			<p className='text-4xl font-bold opacity-20 italic text-black'>
				{call.id}
			</p>
		</div>
		<div className='absolute top-4 left-4'>
			<Volume2 size={24} />
		</div>
		<div className='absolute bottom-4 left-4 right-16'>
			<h3 className='font-bold text-lg mb-1'>@{call.state.createdBy?.name}</h3>
			<p className='text-sm'>
				{call.state?.custom$?.source?._value.title || "Untitled Stream"}
			</p>
			<p className='text-sm'>
				{call.state?.custom$?.source?._value.description || "Untitled Stream"}{" "}
				{call.state?.custom$?.source?._value.hashtags || "#CapCut"}{" "}
			</p>
		</div>
		<div className='absolute bottom-8 right-4 flex flex-col gap-6 items-center'>
			<ActionIcon icon={<Heart size={28} fill='white' />} label='20.5k' />
			<ActionIcon
				icon={<MessageCircle size={28} fill='white' />}
				label={"400"}
			/>
			<ActionIcon icon={<Bookmark size={28} fill='white' />} label='1.2k' />
			<ActionIcon icon={<Share2 size={28} fill='white' />} label='1.5k' />
			<div className='w-10 h-10 rounded-full border-2 border-white overflow-hidden mt-2'>
				<div className='w-full h-full bg-linear-to-tr from-yellow-400 to-red-500' />
			</div>
		</div>
	</Link>
);

const ActionIcon = ({
	icon,
	label,
}: {
	icon: React.ReactNode;
	label: string;
}) => (
	<div className='flex flex-col items-center'>
		<div className='p-3 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition active:scale-90'>
			{icon}
		</div>
		<span className='text-xs mt-1 font-semibold'>{label}</span>
	</div>
);