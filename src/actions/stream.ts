"use server";
import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";
const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY!;

// 👇🏻 -- For Stream Video  --
export const tokenProvider = async (user_id: string) => {
	if (!STREAM_API_KEY) throw new Error("Stream API key secret is missing");
	if (!STREAM_API_SECRET) throw new Error("Stream API secret is missing");

	const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);

	const token = streamClient.generateUserToken({
		user_id,
		validity_in_seconds: 3600,
	});

	return token;
};

// 👇🏻 -- For Stream Chat  --
const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);

export const createStreamUser = async (
	id: string,
	name: string,
	image: string,
) => {
	const { users } = await serverClient.queryUsers({ id });
	if (users.length > 0) return users[0];

	const user = await serverClient.upsertUser({
		id,
		name,
		image,
	});

	return user;
};

export const createToken = async (id: string) => {
	if (!id) throw new Error("User is not authenticated");
	return serverClient.createToken(id);
};

export const createChannel = async (id: string, name: string, uid: string) => {
	try {
		//👇🏻 declare channel type
		const channel = serverClient.channel("livestream", id, {
			name,
			members: [uid],
			created_by_id: uid,
		});
		//👇🏻 create a channel
		await channel.create();
		return { success: true, error: null, id: channel.id };
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : "Failed to create channel",
			id: null,
		};
	}
};