import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/shared/NavBar";
import Footer from "@/components/shared/footer";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function MangaProviderPage() {
    const router = useRouter();
    const { provider, mangaId } = router.query;

    const [manga, setManga] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedScanlator, setSelectedScanlator] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [chaptersPerPage] = useState(20);

    useEffect(() => {
        if (!provider || !mangaId) return;

        async function fetchMangaData() {
            setLoading(true);
            setError(null);

            try {
                // Fetch chapters
                const chaptersResponse = await fetch(
                    `/api/v2/manga/chapters?mangaId=${encodeURIComponent(mangaId)}&provider=${provider}`
                );

                if (!chaptersResponse.ok) {
                    throw new Error("Failed to fetch chapters");
                }

                const chaptersData = await chaptersResponse.json();
                setChapters(chaptersData);

                // Extract manga info from first chapter URL if available
                if (chaptersData.length > 0) {
                    // For now, we'll use a simple manga object
                    // In the future, you might want to add a separate manga info endpoint
                    setManga({
                        title: "Manga Title", // This should come from a manga info endpoint
                        id: mangaId,
                    });
                }
            } catch (err) {
                console.error("Error fetching manga data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchMangaData();
    }, [provider, mangaId]);

    // Get unique scanlators
    const scanlators = ["all", ...new Set(chapters.map(c => c.scanlator || "Unknown"))];

    // Filter chapters by scanlator
    const filteredChapters = selectedScanlator === "all"
        ? chapters
        : chapters.filter(c => (c.scanlator || "Unknown") === selectedScanlator);

    // Pagination
    const indexOfLastChapter = currentPage * chaptersPerPage;
    const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
    const currentChapters = filteredChapters.slice(indexOfFirstChapter, indexOfLastChapter);
    const totalPages = Math.ceil(filteredChapters.length / chaptersPerPage);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="lds-ellipsis">
                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                        <p className="mt-4">Loading manga...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                        <p>{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="mt-4 px-6 py-2 bg-action rounded-md hover:bg-action/80"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>{manga?.title || "Manga"} - Moopa</title>
            </Head>
            <Navbar />

            <main className="min-h-screen max-w-7xl mx-auto px-4 py-8">
                <div className="bg-secondary rounded-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold mb-2">{manga?.title || "Manga"}</h1>
                    <p className="text-gray-400">Provider: <span className="capitalize">{provider}</span></p>
                    <p className="text-gray-400">Total Chapters: {chapters.length}</p>
                </div>

                <div className="bg-secondary rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold">Chapters</h2>

                        {scanlators.length > 1 && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400">Scanlator:</label>
                                <div className="relative">
                                    <select
                                        value={selectedScanlator}
                                        onChange={(e) => {
                                            setSelectedScanlator(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="px-4 py-2 bg-primary rounded-md outline-none focus:ring-2 focus:ring-action appearance-none pr-10"
                                    >
                                        {scanlators.map((scanlator) => (
                                            <option key={scanlator} value={scanlator}>
                                                {scanlator === "all" ? "All Scanlators" : scanlator}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {currentChapters.map((chapter) => (
                            <Link
                                key={chapter.id}
                                href={`/en/manga/provider/read?provider=${provider}&chapterId=${encodeURIComponent(chapter.id)}`}
                                className="block p-4 bg-primary rounded-md hover:bg-primary/70 hover:ring-2 hover:ring-action transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold">{chapter.title}</h3>
                                        {chapter.scanlator && (
                                            <p className="text-sm text-gray-400 mt-1">
                                                by {chapter.scanlator}
                                            </p>
                                        )}
                                    </div>
                                    {chapter.language && (
                                        <span className="text-xs px-2 py-1 bg-secondary rounded uppercase">
                                            {chapter.language}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-primary rounded-md hover:bg-primary/70 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <span className="text-sm text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-primary rounded-md hover:bg-primary/70 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
