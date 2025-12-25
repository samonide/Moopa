import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useState } from "react";
import { getUser } from "@/prisma/user";
import { toast } from "sonner";
import { Navbar } from "@/components/shared/NavBar";
import pls from "@/utils/request";
import { CurrentMediaTypes } from "..";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { PencilIcon, ClockIcon, StarIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

type MyListProps = {
  media: CurrentMediaTypes[];
  sessions: any;
  user: any;
  time: any;
  userSettings: any;
};

export default function MyList({
  media,
  sessions,
  user,
  time,
  userSettings,
}: MyListProps) {
  const [listFilter, setListFilter] = useState("all");
  const [useCustomList, setUseCustomList] = useState(true);

  useEffect(() => {
    if (userSettings) {
      localStorage.setItem("customList", userSettings.CustomLists);
      setUseCustomList(userSettings.CustomLists);
    }
  }, [userSettings]);

  const handleCheckboxChange = async () => {
    setUseCustomList(!useCustomList);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sessions?.user?.name,
          settings: {
            CustomLists: !useCustomList,
          },
        }),
      });
      const data = await res.json();
      if (data) {
        toast.success(`Custom List is now ${!useCustomList ? "on" : "off"}`);
      }
      localStorage.setItem("customList", String(!useCustomList));
    } catch (error) {
      console.error(error);
    }
  };

  const filterMedia = (status: string) => {
    if (status === "all") {
      return media;
    }
    return media.filter((m: { name: string }) => m.name === status);
  };

  return (
    <>
      <Head>
        <title>{user.name}'s Profile - Moopa</title>
      </Head>

      <Navbar withNav toTop shrink bgHover scrollP={110} paddingY={"py-4"} />

      <div className="min-h-screen bg-primary pt-20 lg:pt-24">
        {/* Banner */}
        {user.bannerImage && (
          <div className="relative w-full h-48 lg:h-64">
            <Image
              src={user.bannerImage}
              alt="banner"
              fill
              priority
              className="object-cover brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary" />
          </div>
        )}

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${user.bannerImage ? '-mt-16 lg:-mt-20' : ''}`}>{/* Profile Header */}
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Avatar & Basic Info */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-xl overflow-hidden ring-4 ring-primary shadow-2xl">
                <Image
                  src={user.avatar.large}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white font-outfit">
                    {user.name}
                  </h1>
                  <p className="text-white/60 text-sm mt-1">
                    Member since <UnixTimeConverter unixTime={user.createdAt} />
                  </p>
                </div>

                {sessions && user.name === sessions?.user.name && (
                  <Link href="https://anilist.co/settings/">
                    <Button
                      variant="outline"
                      size="md"
                      leftIcon={<PencilIcon className="w-4 h-4" />}
                    >
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <Card className="bg-secondary-light/50 border-white/5 hover:border-brand-500/30 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <ClockIcon className="w-4 h-4 text-brand-400" />
                      <p className="text-2xl font-bold text-white">
                        {user.statistics.anime.episodesWatched}
                      </p>
                    </div>
                    <p className="text-xs text-white/60">Total Episodes</p>
                  </CardContent>
                </Card>

                <Card className="bg-secondary-light/50 border-white/5 hover:border-brand-500/30 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <StarIcon className="w-4 h-4 text-brand-400" />
                      <p className="text-2xl font-bold text-white">
                        {user.statistics.anime.count}
                      </p>
                    </div>
                    <p className="text-xs text-white/60">Total Anime</p>
                  </CardContent>
                </Card>

                <Card className="bg-secondary-light/50 border-white/5 hover:border-brand-500/30 transition-colors">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-white mb-1">
                      {time?.days || time?.hours}
                    </p>
                    <p className="text-xs text-white/60">
                      {time?.days ? "Days" : "Hours"} Watched
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* About */}
              {user.about && (
                <Card className="bg-secondary-light/50 border-white/5">
                  <CardContent className="p-4">
                    <div
                      className="text-sm text-white/70 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: user.about }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Filters & Settings */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* List Filters */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={listFilter === "all" ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setListFilter("all")}
                >
                  Show All
                </Button>
                {media.map((item) => (
                  <Button
                    key={item.name}
                    variant={listFilter === item.name ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setListFilter(item.name)}
                  >
                    {item.name}{" "}
                    <Badge variant="ghost" className="ml-2">
                      {item.entries.length}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom List Toggle */}
            {sessions && user.name === sessions?.user.name && (
              <div className="flex items-center gap-3 px-4 py-2 bg-secondary-light/50 rounded-lg border border-white/5">
                <span className="text-sm text-white/70">Custom Lists</span>
                <input
                  type="checkbox"
                  checked={useCustomList}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 rounded accent-brand-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Anime Grid */}
          {media.length !== 0 ? (
            <div className="space-y-12 pb-12">
              {filterMedia(listFilter).map((item, index) => (
                <div key={index} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white font-outfit">
                      {item.name}
                    </h2>
                    <Badge variant="secondary" className="text-base">
                      {item.entries.length}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
                    {item.entries.map((entry) => (
                      <div key={entry.mediaId} className="relative group">
                        <Link href={`/en/anime/${entry.media.id}`}>
                          <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary-light border border-white/5 group-hover:border-brand-500/50 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:shadow-brand-500/30 group-hover:z-10 group-hover:-translate-y-2">
                            <Image
                              src={entry.media.coverImage.large}
                              alt={entry.media.title.romaji}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                            />

                            {/* Status Indicator */}
                            {entry.media.status === "RELEASING" && (
                              <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 rounded-md text-xs font-semibold z-10">
                                Airing
                              </div>
                            )}

                            {/* Progress Badge */}
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md z-10">
                              <span className="text-xs font-semibold text-white">
                                {entry.progress === entry.media.episodes
                                  ? entry.progress
                                  : entry.media.episodes === null
                                    ? entry.progress
                                    : `${entry.progress}/${entry.media.episodes}`}
                              </span>
                            </div>

                            {/* Score Badge */}
                            {entry.score > 0 && (
                              <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md flex items-center gap-1 z-10">
                                <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-semibold text-white">
                                  {entry.score}
                                </span>
                              </div>
                            )}

                            {/* Gradient Overlay - always visible but intensifies on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Title overlay on card - visible on hover */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black via-black/95 to-transparent">
                              <p className="text-sm font-semibold text-white line-clamp-2 mb-1">
                                {entry.media.title.romaji}
                              </p>
                              {entry.media.format && (
                                <p className="text-xs text-white/70">
                                  {entry.media.format.replace(/_/g, " ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-secondary-light/50 border-white/5">
              <CardContent className="py-16 text-center">
                <p className="text-lg text-white/70 mb-4">
                  {user.name === sessions?.user.name
                    ? "You haven't watched anything yet"
                    : "This user hasn't watched anything yet"}
                </p>
                <Link href="/en/search/anime">
                  <Button variant="primary">Start Watching</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const query = context.query;

  const [data, session] = await pls.post(
    "https://graphql.anilist.co/",
    {
      body: JSON.stringify({
        query: `
          query ($username: String, $status: MediaListStatus) {
            MediaListCollection(userName: $username, type: ANIME, status: $status, sort: SCORE_DESC) {
              user {
                id
                name
                about (asHtml: true)
                createdAt
                avatar {
                    large
                }
                statistics {
                  anime {
                      count
                      episodesWatched
                      minutesWatched
                  }
                }
                bannerImage
              }
              lists {
                name
                status
                entries {
                  mediaId
                  score
                  progress
                  media {
                    id
                    status
                    title {
                      romaji
                      english
                    }
                    coverImage {
                        large
                    }
                    episodes
                  }
                }
              }
            }
          }
        `,
        variables: {
          username: query.user,
        },
      }),
    },
    context
  );

  const user = data?.data?.MediaListCollection?.user;
  const lists = data?.data?.MediaListCollection?.lists || [];

  if (!user) {
    return {
      notFound: true,
    };
  }

  const time = getTime(user?.statistics?.anime?.minutesWatched);
  const userSettings = await getUser(query.user);

  // Serialize Date objects to avoid Next.js serialization errors
  const serializedUserSettings = userSettings ? {
    ...userSettings,
    WatchListEpisode: userSettings.WatchListEpisode?.map((episode: any) => ({
      ...episode,
      createdDate: episode.createdDate ? episode.createdDate.toISOString() : null,
    })) || [],
  } : null;

  return {
    props: {
      media: lists,
      sessions: session || null,
      user: user,
      time: time || { days: 0, hours: 0 },
      userSettings: serializedUserSettings,
    },
  };
}

const UnixTimeConverter = ({ unixTime }: { unixTime: number }) => {
  if (!unixTime) return null;
  const dateObject = new Date(unixTime * 1000);
  const humanDateFormat = dateObject.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return <>{humanDateFormat}</>;
};

const getTime = (minutes: number) => {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor(minutes / 60);
  return { days, hours };
};
