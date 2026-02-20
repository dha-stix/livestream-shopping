import { AuthProvider } from "../utils/AuthContext";
import { ProtectRoute } from "../utils/ProtectRoute";

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