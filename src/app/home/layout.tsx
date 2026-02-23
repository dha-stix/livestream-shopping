import { StreamVideoProvider } from "../utils/StreamVideoProvider";
import { ProtectRoute, AuthProvider } from "../utils/AuthContext";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthProvider>
			<StreamVideoProvider>
				<ProtectRoute>{children}</ProtectRoute>
			</StreamVideoProvider>
		</AuthProvider>
	);
}