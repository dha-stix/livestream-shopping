"use client";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useState, ReactNode, useEffect, useCallback } from "react";
import { tokenProvider } from "../../actions/stream.actions"
import { useAuth } from "../utils/AuthContext";
import { Loader2 } from "lucide-react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
	const { user, loading } = useAuth();
	const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
		null
	);

	const getClient = useCallback(async () => {
		if (!user) return null;

		const client = new StreamVideoClient({
			apiKey,
			user: {
				id: user.uid,
				name: user.displayName ?? "",
				image: `${
					process.env.NEXT_PUBLIC_IMAGE_URL
				}${user.displayName?.toLowerCase()}`,
			},
			tokenProvider: () => tokenProvider(user.uid),
		});
		setVideoClient(client);
	}, [user]);

	useEffect(() => {
		getClient();
	}, [getClient]);

	if (!videoClient || loading || !user) {
		return (
			 <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            </div>
		);
	}

	return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};