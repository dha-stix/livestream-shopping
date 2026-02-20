// utils/ProtectRoute.tsx
"use client";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation"; // Use 'next/router' if using Pages router
import { useEffect } from "react";

export const ProtectRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        // Only redirect if loading is finished AND there is no user
        if (!loading && !user) {
          router.push("/"); // Change this to your login path
        }
    }, [user, loading, router]);

    // 1. While Firebase is initializing, show nothing or a spinner
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            </div>
        );
    }
    // 2. If there is no user after loading, the useEffect will handle the redirect
    if (!user) {
        return null; // Or you can return a message like "Redirecting to login..."
    }   

    // 3. If there is a user, render the protected content (TikTokUI)
    return <>{children}</>;
};