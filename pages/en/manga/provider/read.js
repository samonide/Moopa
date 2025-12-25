import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { Navbar } from "@/components/shared/NavBar";
import Footer from "@/components/shared/footer";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowLeftIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";

export default function MangaProviderReader() {
    const router = useRouter();
    const { provider, chapterId } = router.query;

    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [layout, setLayout] = useState(1); // 1: single, 2: double, 3: long strip
    const [visible, setVisible] = useState(true);

    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (!provider || !chapterId) return;

        async function fetchPages() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/v2/manga/pages?chapterId=${encodeURIComponent(chapterId)}&provider=${provider}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch pages");
                }

                const pagesData = await response.json();
                setPages(pagesData);
                setCurrentPage(0);
            } catch (err) {
                console.error("Error fetching pages:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPages();
    }, [provider, chapterId]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (layout === 3) return; // Disable for long strip

            if (e.key === "ArrowRight" || e.key === "d") {
                nextPage();
            } else if (e.key === "ArrowLeft" || e.key === "a") {
                previousPage();
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [currentPage, pages.length, layout]);

    const nextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
            scrollToTop();
        }
    };

    const previousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            scrollToTop();
        }
    };

    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    };

    const goToPage = (pageNum) => {
        if (pageNum >= 0 && pageNum < pages.length) {
            setCurrentPage(pageNum);
            scrollToTop();
        }
    };

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
                        <p className="mt-4">Loading chapter...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error || pages.length === 0) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                        <p>{error || "No pages found"}</p>
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
                <title>Reading Chapter - Moopa</title>
            </Head>

            {/* Top Navigation Bar */}
            <div
                className={`fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur transition-transform duration-300 ${visible ? "translate-y-0" : "-translate-y-full"
                    }`}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 hover:text-action"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Back
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-sm">
                            Page {currentPage + 1} / {pages.length}
                        </span>

                        <select
                            value={layout}
                            onChange={(e) => setLayout(Number(e.target.value))}
                            className="px-3 py-1 bg-secondary rounded-md text-sm"
                        >
                            <option value={1}>Single Page</option>
                            <option value={2}>Double Page</option>
                            <option value={3}>Long Strip</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setVisible(!visible)}
                        className="lg:hidden p-2 hover:bg-secondary rounded-md"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Main Reader */}
            <main
                ref={scrollContainerRef}
                className="min-h-screen bg-black pt-16"
                onClick={() => setVisible(!visible)}
            >
                {layout === 3 ? (
                    // Long Strip Mode
                    <div className="max-w-4xl mx-auto">
                        {pages.map((page, index) => (
                            <div key={index} className="relative w-full">
                                <Image
                                    src={page.url}
                                    alt={`Page ${index + 1}`}
                                    width={1200}
                                    height={1800}
                                    className="w-full h-auto"
                                    priority={index < 3}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Single/Double Page Mode
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                previousPage();
                            }}
                            disabled={currentPage === 0}
                            className="absolute left-4 p-3 bg-primary/80 rounded-full hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed z-10"
                        >
                            <ChevronLeftIcon className="w-6 h-6" />
                        </button>

                        <div className="flex gap-4 max-w-7xl">
                            {layout === 2 && currentPage > 0 && (
                                <div className="relative max-h-[90vh]">
                                    <Image
                                        src={pages[currentPage - 1]?.url}
                                        alt={`Page ${currentPage}`}
                                        width={800}
                                        height={1200}
                                        className="h-[90vh] w-auto object-contain"
                                    />
                                </div>
                            )}

                            <div className="relative max-h-[90vh]">
                                <Image
                                    src={pages[currentPage]?.url}
                                    alt={`Page ${currentPage + 1}`}
                                    width={800}
                                    height={1200}
                                    className="h-[90vh] w-auto object-contain"
                                    priority
                                />
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                nextPage();
                            }}
                            disabled={currentPage === pages.length - 1}
                            className="absolute right-4 p-3 bg-primary/80 rounded-full hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed z-10"
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </main>

            {/* Bottom Navigation Bar */}
            {layout !== 3 && (
                <div
                    className={`fixed bottom-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"
                        }`}
                >
                    <div className="px-4 py-4">
                        {/* Page Slider */}
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-sm whitespace-nowrap">
                                {currentPage + 1}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max={pages.length - 1}
                                value={currentPage}
                                onChange={(e) => goToPage(Number(e.target.value))}
                                className="flex-1"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-sm whitespace-nowrap">{pages.length}</span>
                        </div>

                        {/* Quick Navigation */}
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPage(0);
                                }}
                                className="px-3 py-1 text-sm bg-secondary rounded-md hover:bg-secondary/70"
                            >
                                First
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    previousPage();
                                }}
                                disabled={currentPage === 0}
                                className="px-3 py-1 text-sm bg-secondary rounded-md hover:bg-secondary/70 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextPage();
                                }}
                                disabled={currentPage === pages.length - 1}
                                className="px-3 py-1 text-sm bg-secondary rounded-md hover:bg-secondary/70 disabled:opacity-50"
                            >
                                Next
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPage(pages.length - 1);
                                }}
                                className="px-3 py-1 text-sm bg-secondary rounded-md hover:bg-secondary/70"
                            >
                                Last
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
