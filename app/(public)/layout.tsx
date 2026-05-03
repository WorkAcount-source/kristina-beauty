import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
