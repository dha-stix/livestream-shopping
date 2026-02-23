import { useCreateChatClient } from "stream-chat-react";
import { createToken } from "@/actions/stream";
import { useCallback } from "react";

export const useGetStreamClient = (
	user: { id: string; name: string } | null,
) => {
	const tokenProvider = useCallback(async () => {
		return await createToken(user?.id || "");
	}, [user?.id]);


	const client = useCreateChatClient({
		apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
		tokenOrProvider: tokenProvider,
        userData: {
            id: user?.id || "",
            name: user?.name || "User",
            image:`${process.env.NEXT_PUBLIC_IMAGE_URL}${user?.name}`,
        },
	});

	if (!client) return { client: null };

	return { client };
};