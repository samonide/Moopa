import { GetServerSideProps } from 'next';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, Cog6ToothIcon, BookOpenIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAniList } from '@/lib/anilist/useAnilist';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../api/auth/[...nextauth]';

interface MangaPage {
    url: string;
    index: number;
    headers?: {
        Referer?: string;
    };
}

interface MangaChapter {
    id: string;
    number: number;
    title?: string;
}

interface ReaderProps {
    pages: MangaPage[];
    chapters: MangaChapter[];
    currentChapter: MangaChapter;
    mangaId: string;
    provider: string;
    anilistId?: string;
    mangaTitle?: string;
    session?: any;
}

export default function MangaReader({
    pages,
    chapters,
    currentChapter,
    mangaId,
    provider,
    anilistId,
    mangaTitle,
    session,
}: ReaderProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(0);
    const [showUI, setShowUI] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showChapterList, setShowChapterList] = useState(false);
    const [pageGap, setPageGap] = useState(true);
    const [fitWidth, setFitWidth] = useState(true);
    const [autoSync, setAutoSync] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
    const [hasMarkedProgress, setHasMarkedProgress] = useState(false);
    const { markProgress } = useAniList(session);

    const currentChapterIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
    const nextChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
    const prevChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

    // Auto sync to AniList when reaching 80% of chapter
    useEffect(() => {
        if (autoSync && session && anilistId && currentPage >= pages.length * 0.8 && !hasMarkedProgress) {
            markProgress({
                mediaId: parseInt(anilistId),
                progress: currentChapter.number,
                stats: null,
                volumeProgress: 0,
                notes: ''
            });
            setHasMarkedProgress(true);
            console.log('Marked progress:', currentChapter.number);
        }
    }, [currentPage, pages.length, autoSync, session, anilistId, currentChapter.number, hasMarkedProgress, markProgress]);

    // Reset progress marker when chapter changes
    useEffect(() => {
        setHasMarkedProgress(false);
    }, [currentChapter.id]);

    // Scroll tracking
    // Scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;

            const container = containerRef.current;

            // Find current page
            const pageElements = container.querySelectorAll('.manga-page');
            pageElements.forEach((el, index) => {
                const rect = el.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                if (rect.top <= containerRect.top + containerRect.height / 2 &&
                    rect.bottom >= containerRect.top + containerRect.height / 2) {
                    setCurrentPage(index);
                }
            });
        };

        const container = containerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && prevChapter) {
                goToChapter(prevChapter.id);
            } else if (e.key === 'ArrowRight' && nextChapter) {
                goToChapter(nextChapter.id);
            } else if (e.key === 'f' || e.key === 'F') {
                setShowUI(prev => !prev);
            } else if (e.key === 'ArrowUp') {
                containerRef.current?.scrollBy({ top: -200, behavior: 'smooth' });
            } else if (e.key === 'ArrowDown') {
                containerRef.current?.scrollBy({ top: 200, behavior: 'smooth' });
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [nextChapter, prevChapter]);

    const goToChapter = (chapterId: string) => {
        router.push(`/en/manga/read-new/${provider}/${encodeURIComponent(chapterId)}?mangaId=${encodeURIComponent(mangaId)}${anilistId ? `&anilistId=${anilistId}` : ''}`);
    };

    const getImageUrl = (page: MangaPage) => {
        const referer = page.headers?.Referer || 'https://comix.to';
        return `/api/proxy/image?url=${encodeURIComponent(page.url)}&referer=${encodeURIComponent(referer)}`;
    };

    const handleImageLoad = (index: number) => {
        setLoadedImages(prev => new Set([...prev, index]));
    };

    return (
        <>
            <Head>
                <title>
                    {mangaTitle ? `${mangaTitle} - Chapter ${currentChapter.number}` : `Chapter ${currentChapter.number}`}
                </title>
                <meta name="robots" content="noindex" />
            </Head>

            <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col">
                {/* Top Bar */}
                {showUI && (
                    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent">
                        <div className="flex items-center justify-between p-4">
                            <Link
                                href={anilistId ? `/en/manga/${anilistId}` : '#'}
                                className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                            >
                                <ChevronLeftIcon className="w-6 h-6" />
                                <span className="font-semibold">{mangaTitle || 'Back'}</span>
                            </Link>

                            <div className="flex items-center gap-4">
                                <span className="text-white/80">
                                    Chapter {currentChapter.number}
                                    {currentChapter.title && ` - ${currentChapter.title}`}
                                </span>
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Cog6ToothIcon className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                    <div className="fixed top-16 right-4 z-50 bg-secondary rounded-lg p-4 shadow-xl w-72">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Reader Settings</h3>
                            <button onClick={() => setShowSettings(false)}>
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Page Gap</span>
                                <input
                                    type="checkbox"
                                    checked={pageGap}
                                    onChange={(e) => setPageGap(e.target.checked)}
                                    className="w-4 h-4"
                                />
                            </label>

                            <label className="flex items-center justify-between">
                                <span>Fit Width</span>
                                <input
                                    type="checkbox"
                                    checked={fitWidth}
                                    onChange={(e) => setFitWidth(e.target.checked)}
                                    className="w-4 h-4"
                                />
                            </label>

                            {session && anilistId && (
                                <label className="flex items-center justify-between">
                                    <span>Auto Sync Progress</span>
                                    <input
                                        type="checkbox"
                                        checked={autoSync}
                                        onChange={(e) => setAutoSync(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                </label>
                            )}

                            <div className="pt-2 border-t border-white/10">
                                <p className="text-xs text-white/50 mb-2">Keyboard Shortcuts</p>
                                <div className="text-xs text-white/70 space-y-1">
                                    <div>← → : Prev/Next Chapter</div>
                                    <div>↑ ↓ : Scroll</div>
                                    <div>F : Toggle UI</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chapter List Drawer */}
                {showChapterList && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowChapterList(false)}
                        />
                        <div className="fixed right-0 top-0 bottom-0 w-80 bg-secondary z-50 overflow-y-auto shadow-2xl">
                            <div className="sticky top-0 bg-secondary border-b border-white/10 p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <BookOpenIcon className="w-5 h-5" />
                                        Chapters ({chapters.length})
                                    </h3>
                                    <button onClick={() => setShowChapterList(false)}>
                                        <XMarkIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-2">
                                {chapters.map((chapter) => {
                                    const isCurrent = chapter.id === currentChapter.id;
                                    return (
                                        <button
                                            key={chapter.id}
                                            onClick={() => {
                                                goToChapter(chapter.id);
                                                setShowChapterList(false);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${isCurrent
                                                ? 'bg-action text-white'
                                                : 'hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        Chapter {chapter.number}
                                                    </div>
                                                    {chapter.title && (
                                                        <div className="text-sm text-white/60 line-clamp-1">
                                                            {chapter.title}
                                                        </div>
                                                    )}
                                                </div>
                                                {isCurrent && (
                                                    <div className="text-xs bg-white/20 px-2 py-1 rounded">
                                                        Reading
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* Reader Container */}
                <div
                    ref={containerRef}
                    className={`flex-1 overflow-y-auto overflow-x-hidden ${showUI ? 'pt-16 pb-20' : ''
                        } scrollbar-thin scrollbar-thumb-white/20`}
                    onClick={() => setShowUI(prev => !prev)}
                >
                    <div className={pageGap ? 'space-y-4' : ''}>
                        {pages.map((page, index) => (
                            <div
                                key={index}
                                data-page={index}
                                className={`manga-page flex justify-center ${fitWidth ? 'px-4' : ''}`}
                            >
                                <div className="relative">
                                    {!loadedImages.has(index) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                    <img
                                        src={getImageUrl(page)}
                                        alt={`Page ${index + 1}`}
                                        className={`${fitWidth ? 'max-w-full h-auto' : 'max-h-screen'} select-none`}
                                        onLoad={() => handleImageLoad(index)}
                                        draggable={false}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                {showUI && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="flex items-center justify-between p-4">
                            <button
                                onClick={() => prevChapter && goToChapter(prevChapter.id)}
                                disabled={!prevChapter}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${prevChapter
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                <ChevronLeftIcon className="w-5 h-5" />
                                <span>Previous</span>
                            </button>

                            <div className="flex items-center gap-4 text-center text-white/80">
                                <div className="text-sm">
                                    Page {currentPage + 1} of {pages.length}
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max={pages.length}
                                    value={currentPage + 1}
                                    onChange={(e) => {
                                        const pageNum = parseInt(e.target.value) - 1;
                                        if (pageNum >= 0 && pageNum < pages.length) {
                                            const pageElement = containerRef.current?.querySelector(`[data-page="${pageNum}"]`);
                                            pageElement?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                    className="w-16 bg-white/10 text-white text-center rounded px-2 py-1 text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            <button
                                onClick={() => nextChapter && goToChapter(nextChapter.id)}
                                disabled={!nextChapter}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${nextChapter
                                    ? 'bg-white/10 hover:bg-white/20 text-white'
                                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                <span>Next</span>
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const { provider, chapterId } = context.params as { provider: string; chapterId: string };
        const { mangaId, anilistId } = context.query;

        if (!mangaId || typeof mangaId !== 'string') {
            return { notFound: true };
        }

        const session = await getServerSession(context.req, context.res, authOptions);

        // Fetch pages
        const pagesResponse = await fetch(
            `http://localhost:3000/api/v2/manga/pages?chapterId=${encodeURIComponent(
                chapterId
            )}&provider=${provider}`
        );

        if (!pagesResponse.ok) {
            throw new Error('Failed to fetch pages');
        }

        const pages = await pagesResponse.json();

        // Fetch chapters
        const comixMangaId = mangaId.split('|').slice(0, 2).join('|');
        const chaptersResponse = await fetch(
            `http://localhost:3000/api/v2/manga/chapters?mangaId=${encodeURIComponent(
                comixMangaId
            )}&provider=${provider}`
        );

        let chapters = [];
        if (chaptersResponse.ok) {
            chapters = await chaptersResponse.json();
        }

        const currentChapter = chapters.find((ch: MangaChapter) => ch.id === chapterId) || {
            id: chapterId,
            number: 0,
            title: '',
        };

        // Fetch manga info if anilistId provided
        let mangaTitle = '';
        if (anilistId) {
            try {
                const infoResponse = await fetch('https://graphql.anilist.co/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: `
              query ($id: Int) {
                Media(id: $id, type: MANGA) {
                  title {
                    romaji
                    english
                    native
                  }
                }
              }
            `,
                        variables: { id: parseInt(anilistId as string) },
                    }),
                });
                const json = await infoResponse.json();
                mangaTitle = json.data?.Media?.title?.romaji || json.data?.Media?.title?.english || '';
            } catch (err) {
                console.error('Failed to fetch manga title:', err);
            }
        }

        return {
            props: {
                pages,
                chapters,
                currentChapter,
                mangaId,
                provider,
                anilistId: anilistId || null,
                mangaTitle,
                session: session || null,
            },
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);
        return { notFound: true };
    }
};
