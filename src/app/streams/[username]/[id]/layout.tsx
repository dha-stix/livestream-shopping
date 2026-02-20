import { StreamVideoProvider } from "@/app/(stream)/StreamVideoProvider";
import { AuthProvider } from "../../../utils/AuthContext";
import { ProtectRoute } from "@/app/utils/ProtectRoute";

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