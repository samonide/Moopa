import {
  BookOpenIcon,
  PlayIcon,
  PlusIcon,
  ShareIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  FilmIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { convertSecondsToTime } from "@/utils/getTimes";
import Skeleton from "react-loading-skeleton";
import { AniListInfoTypes } from "types/info/AnilistInfoTypes";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type DetailTopProps = {
  info?: AniListInfoTypes | null;
  statuses?: any;
  handleOpen: () => void;
  watchUrl: string | undefined;
  progress?: number;
  color?: string | null;
};

export default function DetailTop({
  info,
  statuses = undefined,
  handleOpen,
  watchUrl,
  progress,
}: DetailTopProps) {
  const router = useRouter();
  const [readMore, setReadMore] = useState(false);
  const isAnime = info?.type === "ANIME";

  useEffect(() => {
    setReadMore(false);
  }, [info?.id]);

  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${isAnime ? "Watch" : "Read"} Now - ${info?.title?.english}`,
          url: window.location.href,
        });
      } else {
        alert("Web Share API is not supported in this browser.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const getMonth = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1];
  };

  return (
    <div className="w-full px-4 lg:px-0 pt-8 lg:pt-16">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Poster */}
        <div className="shrink-0 w-full lg:w-[220px]">
          <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl group">
            {info ? (
              <Image
                src={
                  info?.coverImage?.extraLarge?.toString() ??
                  info?.coverImage?.toString()
                }
                alt={info?.title?.romaji || "Poster"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority
              />
            ) : (
              <Skeleton className="h-full" />
            )}

            {/* Floating Rating */}
            {info?.averageScore && (
              <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg flex items-center gap-1.5 shadow-lg">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold text-sm">
                  {(info.averageScore / 10).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-5">
          {/* Title & Metadata */}
          <div className="space-y-3">
            {/* Season/Year */}
            <div className="flex items-center gap-2 text-brand-400 text-sm font-medium">
              <CalendarIcon className="w-4 h-4" />
              {info ? (
                <span>
                  {info?.season?.toLowerCase() || getMonth(info?.startDate?.month)}{" "}
                  {info?.seasonYear || info?.startDate?.year}
                </span>
              ) : (
                <Skeleton width={120} />
              )}
            </div>

            {/* Main Title */}
            <h1 className="font-outfit font-bold text-3xl lg:text-5xl text-white leading-tight">
              {info ? (
                info?.title?.romaji || info?.title?.english
              ) : (
                <Skeleton height={50} width={400} />
              )}
            </h1>

            {/* English Title */}
            {info?.title?.english && info?.title?.english !== info?.title?.romaji && (
              <h2 className="font-inter text-lg text-white/60">
                {info?.title?.english}
              </h2>
            )}

            {/* Badges */}
            {info && (
              <div className="flex flex-wrap items-center gap-2">
                {info.format && (
                  <Badge variant="secondary">
                    {info.format.replace(/_/g, " ")}
                  </Badge>
                )}
                {info.status && (
                  <Badge
                    variant={
                      info.status === "RELEASING"
                        ? "success"
                        : info.status === "FINISHED"
                          ? "default"
                          : "warning"
                    }
                  >
                    {info.status === "RELEASING"
                      ? "Airing"
                      : info.status === "FINISHED"
                        ? "Finished"
                        : info.status}
                  </Badge>
                )}
                {info.episodes && (
                  <Badge variant="ghost">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {info.episodes} Episodes
                  </Badge>
                )}
                {info.duration && (
                  <Badge variant="ghost">
                    <FilmIcon className="w-3 h-3 mr-1" />
                    {info.duration} min
                  </Badge>
                )}
                {info.genres?.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          {info?.description && (
            <div className="space-y-2">
              <p
                className={cn(
                  "text-white/70 text-base leading-relaxed",
                  !readMore && "line-clamp-3"
                )}
                dangerouslySetInnerHTML={{
                  __html: info.description.replace(/<br\s*\/?>/gi, " "),
                }}
              />
              {info.description.length > 200 && (
                <button
                  onClick={() => setReadMore(!readMore)}
                  className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
                >
                  {readMore ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {info ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={isAnime ? <PlayIcon className="w-5 h-5" /> : <BookOpenIcon className="w-5 h-5" />}
                  onClick={() => {
                    if (isAnime) {
                      // For anime, go directly to watch page with source1 (maps to hianime internally)
                      const episodeNum = progress && progress > 0 ? progress : 1;
                      router.push(`/en/anime/watch/${info.id}/source1?num=${episodeNum}`);
                    } else {
                      router.push(watchUrl ?? "#");
                    }
                  }}
                  className="min-w-[160px]"
                >
                  {progress && progress > 0 ? (
                    statuses?.value === "COMPLETED" ? (
                      isAnime ? "Rewatch" : "Reread"
                    ) : !watchUrl && info?.nextAiringEpisode ? (
                      <span className="text-sm">
                        {convertSecondsToTime(info.nextAiringEpisode.timeUntilAiring)}
                      </span>
                    ) : (
                      "Continue"
                    )
                  ) : isAnime ? (
                    "Watch Now"
                  ) : (
                    "Read Now"
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<PlusIcon className="w-5 h-5" />}
                  onClick={handleOpen}
                >
                  Add to List
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<HeartIcon className="w-5 h-5" />}
                >
                  <span className="hidden sm:inline">Favorite</span>
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  leftIcon={<ShareIcon className="w-5 h-5" />}
                  onClick={handleShareClick}
                >
                  <span className="hidden sm:inline">Share</span>
                </Button>

                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://anilist.co/${info.type.toLowerCase()}/${info.id}`}
                >
                  <Button variant="ghost" size="lg">
                    <Image
                      src="/svg/anilist-icon.svg"
                      alt="AniList"
                      width={20}
                      height={20}
                    />
                  </Button>
                </a>
              </>
            ) : (
              <div className="flex gap-3">
                <Skeleton width={160} height={44} />
                <Skeleton width={140} height={44} />
                <Skeleton width={100} height={44} />
              </div>
            )}
          </div>

          {/* Stats Grid */}
          {info && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {info.averageScore && (
                <div className="bg-secondary-light/50 rounded-lg p-4 border border-white/5">
                  <div className="text-white/50 text-xs font-medium mb-1">Score</div>
                  <div className="text-white text-xl font-bold">
                    {info.averageScore}%
                  </div>
                </div>
              )}
              {info.popularity && (
                <div className="bg-secondary-light/50 rounded-lg p-4 border border-white/5">
                  <div className="text-white/50 text-xs font-medium mb-1">Popularity</div>
                  <div className="text-white text-xl font-bold">
                    #{info.popularity.toLocaleString()}
                  </div>
                </div>
              )}
              {info.trending && (
                <div className="bg-secondary-light/50 rounded-lg p-4 border border-white/5">
                  <div className="text-white/50 text-xs font-medium mb-1">Trending</div>
                  <div className="text-white text-xl font-bold">
                    #{info.trending}
                  </div>
                </div>
              )}
              {info.favourites && (
                <div className="bg-secondary-light/50 rounded-lg p-4 border border-white/5">
                  <div className="text-white/50 text-xs font-medium mb-1">Favorites</div>
                  <div className="text-white text-xl font-bold">
                    {info.favourites.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
