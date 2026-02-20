import { AuthProvider } from "../utils/AuthContext";
import { StreamVideoProvider } from "../(stream)/StreamVideoProvider";
import { ProtectRoute } from "../utils/ProtectRoute";

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