import Skeleton from "react-loading-skeleton";
import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { AniListInfoTypes } from "types/info/AnilistInfoTypes";
import { Episode } from "types/api/Episode";

type EpisodeListsProps = {
  info: AniListInfoTypes;
  map: any;
  providerId: string;
  watchId: string;
  episode: Episode[];
  artStorage: any;
  track: any;
  dub: string;
};

export default function EpisodeLists({
  info,
  map,
  providerId,
  watchId,
  episode,
  artStorage,
  track,
  dub,
}: EpisodeListsProps) {
  const progress = info.mediaListEntry?.progress;

  const router = useRouter();

  return (
    <div className="w-screen lg:max-w-sm xl:max-w-lg">
      <div className="flex gap-3 px-3 lg:pl-5 pb-5">
        <button
          disabled={!track?.next}
          onClick={() => {
            router.push(
              `/en/anime/watch/${info.id}/${providerId}?id=${track?.next?.id
              }&num=${track?.next?.number}${dub ? `&dub=${dub}` : ""}`
            );
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-karla font-semibold text-sm transition-all duration-200 ${track?.next
              ? "bg-action hover:bg-action/90 text-white shadow-lg hover:shadow-xl hover:scale-105"
              : "bg-secondary text-gray-500 cursor-not-allowed"
            }`}
        >
          Next Episode
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {episode && (
          <div className="relative flex gap-2 items-center group">
            <select
              value={track?.playing?.number}
              onChange={(e) => {
                const selectedEpisode = episode.find(
                  (episode) => episode.number === parseInt(e.target.value)
                );

                router.push(
                  `/en/anime/watch/${info.id}/${providerId}?id=${selectedEpisode?.id
                  }&num=${selectedEpisode?.number}${dub ? `&dub=${dub}` : ""}`
                );
              }}
              className="flex items-center text-sm gap-5 rounded-lg bg-secondary hover:bg-secondary/80 py-2 px-4 pr-10 font-karla appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-action/50 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {episode?.map((x) => (
                <option key={x.id} value={x.number}>
                  Episode {x.number}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none transition-transform group-hover:translate-y-[-45%]" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2 lg:pl-5 py-2 scrollbar-thin px-2 scrollbar-thumb-[#313131] scrollbar-thumb-rounded-full">
        {episode && episode.length > 0 ? (
          episode.map((item) => {
            const time = artStorage?.[item.id]?.timeWatched;
            const duration = artStorage?.[item.id]?.duration;
            let prog = (time / duration) * 100;
            if (prog > 90) prog = 100;

            return (
              <Link
                href={`/en/anime/watch/${info.id
                  }/${providerId}?id=${encodeURIComponent(item.id)}&num=${item.number
                  }${dub ? `&dub=${dub}` : ""}`}
                key={item.id}
                className={`relative bg-secondary flex-center h-12 rounded-md scale-100 transition-all duration-200 ease-out font-karla font-semibold ${item.id == watchId
                    ? "pointer-events-none ring-2 ring-action bg-action/20"
                    : "cursor-pointer hover:scale-105 ring-0 hover:ring-2 hover:shadow-lg ring-white/50"
                  }`}
              >
                {item.number}
                {/* Progress bar */}
                {(progress !== undefined && progress >= item?.number) ||
                  (artStorage?.[item?.id] !== undefined && prog > 0) ? (
                  <span
                    className={`absolute bottom-0 left-0 h-1 rounded-b-md ${progress !== undefined && progress >= item?.number
                        ? "bg-green-500"
                        : "bg-red-500"
                      }`}
                    style={{
                      width:
                        progress !== undefined && progress >= item?.number
                          ? "100%"
                          : `${prog}%`,
                    }}
                  />
                ) : null}
              </Link>
            );
          })
        ) : (
          <>
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton
                key={item}
                className="bg-secondary h-12 rounded-md"
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
