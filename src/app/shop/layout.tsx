import { AuthProvider, ProtectRoute } from "../utils/AuthContext";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthProvider>
			<ProtectRoute>{children}</ProtectRoute>
		</AuthProvider>
	);
}