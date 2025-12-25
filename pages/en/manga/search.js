import Head from "next/head";
import { Navbar } from "@/components/shared/NavBar";
import Footer from "@/components/shared/footer";
import MangaProviderSearch from "@/components/manga/MangaProviderSearch";
import MobileNav from "@/components/shared/MobileNav";

export default function MangaSearchPage() {
    return (
        <>
            <Head>
                <title>Search Manga - Moopa</title>
                <meta name="description" content="Search and read manga from multiple providers" />
            </Head>

            <Navbar />
            <MobileNav />

            <main className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Manga Search</h1>
                        <p className="text-gray-400">
                            Search for manga from Comix and other providers
                        </p>
                    </div>

                    <MangaProviderSearch />
                </div>
            </main>

            <Footer />
        </>
    );
}
