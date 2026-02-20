import { useEffect, useState } from "react";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useGetLiveStreams = () => {
    const client = useStreamVideoClient();
    const [calls, setCalls] = useState<Call[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCalls = async () => {
            if (!client) return;

            setIsLoading(true);

            try {
                // Query calls that are of type 'livestream'
                const { calls } = await client.queryCalls({
                    sort: [{ field: "starts_at", direction: -1 }], // Newest first
                    filter_conditions: {
                        type: 'livestream',
                        // Optional: only show calls that are officially 'live' 
                        // (host has clicked Go Live)
                        backstage: false, 
                        // Ensure the call hasn't ended
                        ended_at: { $exists: false },
                    },
                    limit: 25,
                    watch: true, // This enables real-time updates if a call state changes
                });

           
                setCalls(calls);
            } catch (error) {
                console.error("Error querying livestreams:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCalls();
    }, [client]);


    return { calls, isLoading };
};