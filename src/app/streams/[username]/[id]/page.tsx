"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, ShoppingBag } from "lucide-react";
import {
	StreamCall,
	StreamTheme,
	CallControls,
	useStreamVideoClient,
	Call,
	LivestreamPlayer,
	useCallStateHooks,
	ParticipantView,
	useCall,
} from "@stream-io/video-react-sdk";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/utils/AuthContext";
import { useGetStreamClient } from "@/app/utils/useGetStreamClient";
import {
	Channel,
	Chat,
	MessageInput,
	VirtualizedMessageList,
	Window,
} from "stream-chat-react";
import type { Channel as ChannelType } from "stream-chat";

export default function Page() {
	const { user } = useAuth();

	if (!user) {
		return (
			<div className='h-screen w-full flex items-center justify-center bg-black text-white'>
				<Loader2 className='animate-spin' size={48} />
			</div>
		);
	}

	return <StreamPage uid={user.uid} />;
}

const StreamPage = ({ uid }: { uid: string }) => {
	const { id } = useParams<{ username: string; id: string }>();
	const videoClient = useStreamVideoClient();
	const [channel, setChannel] = useState<ChannelType | null>(null);
	const { client: chatClient } = useGetStreamClient(uid);

	const [call, setCall] = useState<Call | null>(null);

	useEffect(() => {
		if (!videoClient || !chatClient) return;
		const myCall = videoClient.call("livestream", id);
		myCall.join().then(() => setCall(myCall));

		const channel = chatClient.channel("livestream", id);
		channel
			.watch()
			.catch((e) => console.error("Failed to watch chat channel:", e));
		setChannel(channel);

		return () => {
			myCall.leave();
		};
	}, [videoClient, chatClient, id]);

	if (!call || !chatClient || !channel)
		return (
			<div className='h-screen w-full flex items-center justify-center bg-black text-white'>
				<Loader2 className='animate-spin' size={48} />
			</div>
		);

	return (
		<StreamCall call={call}>
			<StreamTheme>
				<Chat client={chatClient} theme='str-chat__theme-dark'>
					<Channel channel={channel}>
						<LivestreamContent />
					</Channel>
				</Chat>
			</StreamTheme>
		</StreamCall>
	);
};

const LivestreamContent = () => {
	const { username } = useParams<{ username: string }>();
	const router = useRouter();
	const call = useCall();
	const [isChatOpen, setIsChatOpen] = useState(true);

	const { useIsCallLive, useLocalParticipant } = useCallStateHooks();
	const isLive = useIsCallLive();
	const localParticipant = useLocalParticipant();

	const handleGoLive = async () => {
		try {
			await call?.goLive();
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<div className='flex flex-col w-full h-screen max-h-screen bg-[#080808] text-white overflow-hidden'>
			{/* 1. HEADER */}
			<div className='h-14 border-b border-white/10 flex justify-between items-center px-4 shrink-0 bg-[#121212] z-20'>
				<div className='flex items-center gap-3'>
					<h1 className='text-sm font-bold truncate max-w-37.5'>
						{call?.state.custom.title || "Livestream"}
					</h1>
					<Link
						href={`/shop/${username}/products`}
						target='_blank'
						className='flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 px-3 py-1 rounded-md transition  font-bold'
					>
						<ShoppingBag size={14} />
						<span>My Shop</span>
					</Link>
				</div>

				<div className='flex items-center gap-3'>
					<button
						onClick={() => setIsChatOpen(!isChatOpen)}
						className={`p-2 rounded-md transition ${isChatOpen ? "bg-blue-600" : "bg-white/10"}`}
					>
						<MessageSquare size={18} />
					</button>

					{!isLive ? (
						<button
							onClick={handleGoLive}
							className='bg-red-600 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider'
						>
							Go Live
						</button>
					) : (
						<div className='flex items-center gap-2 bg-red-600/20 px-3 py-1 rounded-full border border-red-600/50'>
							<span className='w-2 h-2 bg-red-600 rounded-full animate-pulse' />
							<span className='text-[10px] font-bold text-red-500 uppercase tracking-widest'>
								Live
							</span>
						</div>
					)}
				</div>
			</div>

			{/* 2. MAIN BODY (Video + Chat) */}
			<div className='flex-1 flex overflow-hidden relative'>
				{/* Video Section */}
				<div className='flex-1 relative bg-black flex items-center justify-center overflow-hidden'>
					{isLive ? (
						<div className='w-full h-full relative'>
							<LivestreamPlayer
								callType='livestream'
								callId={call?.id as string}
							/>
						</div>
					) : (
						localParticipant && (
							<div className='w-full h-full max-w-4xl p-6'>
								<div className='w-full h-full rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl'>
									<ParticipantView participant={localParticipant} />
									<div className='absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-[10px] text-yellow-500 font-bold border border-yellow-500/20'>
										PREVIEW MODE
									</div>
								</div>
							</div>
						)
					)}
				</div>

				{/* COMPACT CHAT SECTION */}
				<div
					className={`${isChatOpen ? "w-87.5" : "w-0"} transition-all duration-300 bg-[#0c0c0c] border-l border-white/5 flex flex-col shrink-0 overflow-hidden`}
				>
					{isChatOpen && (
						<Window>
							<div className='p-3 border-b border-white/5 flex justify-between items-center shrink-0'>
								<span className='text-[11px] font-bold text-gray-400 uppercase tracking-widest'>
									Live Chat
								</span>
							</div>
							<VirtualizedMessageList />
							<div className='p-2 bg-[#0c0c0c]'>
								<MessageInput />
							</div>
						</Window>
					)}
				</div>
			</div>

			{/* 3. CONTROLS FOOTER */}
			<div className='h-20 bg-[#121212] border-t border-white/5 flex items-center justify-center shrink-0 z-20 gap-4'>
				<CallControls onLeave={() => router.push("/")} />
				<EndCallButton call={call!} />
			</div>

			
		</div>
	);
};

const EndCallButton = ({ call }: { call: Call }) => {
	const { useLocalParticipant } = useCallStateHooks();
	const localParticipant = useLocalParticipant();
	const router = useRouter();

	const participantIsHost =
		localParticipant &&
		call.state.createdBy &&
		localParticipant.userId === call.state.createdBy.id;

	if (!participantIsHost) return null;

	const handleEndCall = async () => {
		const confirmEnd = window.confirm(
			"Are you sure you want to end the stream for everyone?",
		);
		if (confirmEnd) {
			await call.endCall();
			router.push("/home");
		}
	};

	return (
		<button
			className='bg-red-600 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-red-700 transition uppercase tracking-tight'
			onClick={handleEndCall}
		>
			End Stream
		</button>
	);
};