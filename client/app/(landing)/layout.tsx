import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full">
      <Navbar />

      <main
        className="w-full h-full"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
    </div>
  );
}
