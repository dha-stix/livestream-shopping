import { useCreateChatClient } from "stream-chat-react";
import { createToken } from "@/actions/stream.actions";
import { useCallback } from "react";

export const useGetStreamClient = (
	id: string
) => {
	const tokenProvider = useCallback(async () => {
		return await createToken(id);
	}, [id]);

	const client = useCreateChatClient({
		apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
		tokenOrProvider: tokenProvider,
        userData: {
            id: id, name: "User " + id,
            image: `https://api.dicebear.com/9.x/pixel-art/svg?seed=${id}`
        },
	});

	if (!client) return { client: null };

	return { client };
};