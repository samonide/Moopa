import { useEffect, useState } from "react";
import ChapterSelector from "./chapters";
import axios from "axios";
import pls from "@/utils/request";

export default function ChaptersComponent({
  info,
  mangaId,
  aniId,
  setWatch,
  chapter,
  setChapter,
  loading,
  setLoading,
  notFound,
  setNotFound,
}) {
  const [useNewProvider, setUseNewProvider] = useState(false);

  useEffect(() => {
    setLoading(true);
  }, [aniId]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Always try Comix first when we have title info
        if (info) {
          const searchQuery = info?.title?.romaji || info?.title?.english || info?.title?.native;

          if (searchQuery) {
            try {
              console.log('[Comix] Searching for:', searchQuery);
              const searchResponse = await fetch(`/api/v2/manga/search?query=${encodeURIComponent(searchQuery)}&provider=comix`);

              if (searchResponse.ok) {
                const searchResults = await searchResponse.json();
                console.log('[Comix] Search results:', searchResults.length);

                if (searchResults && searchResults.length > 0) {
                  console.log('[Comix] Found manga:', searchResults[0].title, searchResults[0].id);

                  // Get chapters from Comix
                  const chaptersResponse = await fetch(`/api/v2/manga/chapters?mangaId=${encodeURIComponent(searchResults[0].id)}&provider=comix`);

                  if (chaptersResponse.ok) {
                    const comixChapters = await chaptersResponse.json();
                    console.log('[Comix] Found chapters:', comixChapters.length);

                    if (comixChapters && comixChapters.length > 0) {
                      // Format to match expected structure
                      setChapter([
                        {
                          providerId: 'comix',
                          chapters: comixChapters,
                        }
                      ]);
                      setUseNewProvider(true);
                      setLoading(false);
                      console.log('[Comix] Successfully loaded chapters');
                      return;
                    }
                  } else {
                    console.log('[Comix] Chapters response not ok:', chaptersResponse.status);
                  }
                } else {
                  console.log('[Comix] No search results found');
                }
              } else {
                console.log('[Comix] Search response not ok:', searchResponse.status);
              }
            } catch (error) {
              console.log('[Comix] Provider failed:', error);
            }
          }
        }

        // Only try Anify if we have a mangaId (skip if Anify is down/slow)
        if (mangaId) {
          try {
            console.log('[Anify] Fetching chapters for:', mangaId);
            const response = await fetch(`/api/v2/manga/anify-chapters?id=${encodeURIComponent(mangaId)}`, {
              signal: AbortSignal.timeout(8000) // 8 second timeout
            });

            if (response.ok) {
              const Chapters = await response.json();

              if (Chapters && Chapters.length > 0) {
                console.log('[Anify] Found chapters:', Chapters.length);
                setChapter(Chapters);
                setUseNewProvider(false);
                setLoading(false);
                return;
              } else {
                console.log('[Anify] No chapters found');
              }
            } else {
              console.log('[Anify] API request failed:', response.status);
            }
          } catch (error) {
            console.log('[Anify] Skipped due to timeout or error:', error.message);
          }
        }

        // If we got here, neither provider found chapters
        console.log('[Final] No chapters found from any provider');
        setLoading(false);
        setNotFound(true);
      } catch (error) {
        console.error('[Error] Failed to fetch chapters:', error);
        setLoading(false);
        setNotFound(true);
      }
    }
    fetchData();
  }, [mangaId, info]);

  return (
    <div>
      {!loading ? (
        notFound ? (
          <div className="h-[20vh] lg:w-full flex-center flex-col gap-5">
            <p className="text-center font-karla font-bold lg:text-lg">
              Oops!<br></br> It looks like this manga is not available.
            </p>
          </div>
        ) : info && chapter && chapter.length > 0 ? (
          <ChapterSelector
            chaptersData={chapter}
            mangaId={mangaId}
            data={info}
            setWatch={setWatch}
          />
        ) : (
          <div className="flex justify-center">
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )
      ) : (
        <div className="flex justify-center">
          <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
}
