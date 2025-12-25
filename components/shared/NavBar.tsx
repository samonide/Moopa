import { useSearch } from "@/lib/context/isOpenState";
import { getCurrentSeason } from "@/utils/getTimes";
import { ArrowLeftIcon, ArrowUpCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { UserIcon } from "@heroicons/react/24/solid";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AniListInfoTypes } from "types/info/AnilistInfoTypes";
import { cn } from "@/lib/utils";

const getScrollPosition = (el: Window | Element = window) => {
  if (el instanceof Window) {
    return { x: el.pageXOffset, y: el.pageYOffset };
  } else {
    return { x: el.scrollLeft, y: el.scrollTop };
  }
};

type NavbarProps = {
  info?: AniListInfoTypes | null;
  scrollP?: number;
  toTop?: boolean;
  withNav?: boolean;
  paddingY?: string;
  home?: boolean;
  back?: boolean;
  manga?: boolean;
  shrink?: boolean;
  bgHover?: boolean;
};

export function Navbar({
  info = null,
  scrollP = 200,
  toTop = false,
  withNav = false,
  paddingY = "py-4",
  home = false,
  back = false,
  manga = false,
  shrink = false,
  bgHover = false,
}: NavbarProps) {
  const { data: session }: { data: any } = useSession();
  const router = useRouter();
  const [scrollPosition, setScrollPosition] = useState<
    { x: number; y: number } | undefined
  >();
  const { setIsOpen } = useSearch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const year = new Date().getFullYear();
  const season = getCurrentSeason();

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(getScrollPosition());
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isScrolled = (scrollPosition?.y ?? 0) >= scrollP;

  return (
    <>
      <nav
        className={cn(
          "z-[200] fixed top-0 w-full transition-all duration-300 ease-out",
          // Transparent on home, solid backdrop on other pages
          home ? "bg-transparent" : "backdrop-blur-xl bg-primary/95 border-b border-white/5",
          isScrolled && !home && "shadow-lg shadow-black/20",
          isScrolled && home && "bg-primary/80 backdrop-blur-sm",
          bgHover && "hover:bg-secondary/50",
          isScrolled && shrink ? "py-2" : paddingY
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between mx-auto px-6 lg:px-8",
            home ? "lg:max-w-[90%] gap-10" : "max-w-screen-2xl"
          )}
        >
          {/* Left Section */}
          <div
            className={cn(
              "flex items-center",
              withNav ? `${home ? "" : "w-[20%]"} gap-6` : "w-full gap-5"
            )}
          >
            {info ? (
              <>
                <button
                  type="button"
                  className="flex-center w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={() => {
                    back
                      ? router.back()
                      : manga
                        ? router.push("/en/search/manga")
                        : router.push("/en");
                  }}
                  aria-label="Go back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>

                <span
                  className={cn(
                    "font-inter font-semibold text-base w-[50%] line-clamp-1 select-none transition-all duration-300",
                    (scrollPosition?.y ?? 0) >= scrollP + 80
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                >
                  {info.title.romaji}
                </span>
              </>
            ) : (
              <Link
                href="/en"
                className={cn(
                  "flex-center font-outfit font-bold tracking-tight",
                  home
                    ? "text-4xl text-brand hover:text-brand-400 transition-colors"
                    : "text-white text-2xl hover:text-brand-400 transition-colors"
                )}
              >
                moopa
              </Link>
            )}
          </div>

          {/* Center Navigation */}
          {withNav && (
            <ul
              className={cn(
                "hidden w-full items-center gap-8 font-inter text-sm font-medium lg:flex",
                home ? "justify-start" : "justify-center"
              )}
            >
              <li>
                <Link
                  href={`/en/search/anime?season=${season}&year=${year}`}
                  className="text-white/70 hover:text-brand-400 transition-colors duration-200 relative group"
                >
                  This Season
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-400 transition-all duration-200 group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link
                  href="/en/search/manga"
                  className="text-white/70 hover:text-brand-400 transition-colors duration-200 relative group"
                >
                  Manga
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-400 transition-all duration-200 group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link
                  href="/en/search/anime"
                  className="text-white/70 hover:text-brand-400 transition-colors duration-200 relative group"
                >
                  Anime
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-400 transition-all duration-200 group-hover:w-full" />
                </Link>
              </li>
              <li>
                <Link
                  href="/en/schedule"
                  className="text-white/70 hover:text-brand-400 transition-colors duration-200 relative group"
                >
                  Schedule
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-400 transition-all duration-200 group-hover:w-full" />
                </Link>
              </li>

              {!session && (
                <li>
                  <button
                    onClick={() => signIn("AniListProvider")}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-400 rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    Sign In
                  </button>
                </li>
              )}
              {session && (
                <li>
                  <Link
                    href={`/en/profile/${session?.user?.name}`}
                    className="text-white/70 hover:text-brand-400 transition-colors duration-200 relative group"
                  >
                    My List
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-400 transition-all duration-200 group-hover:w-full" />
                  </Link>
                </li>
              )}
            </ul>
          )}

          {/* Right Section */}
          <div className="flex w-[20%] justify-end items-center gap-3">
            <button
              type="button"
              title="Search"
              onClick={() => setIsOpen(true)}
              className="flex-center w-9 h-9 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                  className="w-9 h-9 rounded-full ring-2 ring-brand-500/30 hover:ring-brand-400 transition-all duration-200 overflow-hidden"
                  aria-label="Profile menu"
                >
                  <Image
                    src={session?.user?.image?.large}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="w-9 h-9 object-cover"
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-12 w-40 bg-secondary/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 animate-slide-in">
                    <Link
                      href={`/en/profile/${session?.user?.name}`}
                      className="block px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-150"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ redirect: true })}
                      className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-150"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("AniListProvider")}
                title="Login With AniList"
                className="w-9 h-9 bg-brand-500/20 hover:bg-brand-500/30 rounded-full overflow-hidden transition-all duration-200 flex-center"
                aria-label="Login with AniList"
              >
                <UserIcon className="w-5 h-5 text-brand-400" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Scroll to Top Button */}
      {toTop && (
        <button
          type="button"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          className={cn(
            "fixed bottom-24 lg:bottom-14 right-6 z-[500] w-12 h-12 bg-brand-500 hover:bg-brand-400 rounded-full shadow-lg shadow-brand-500/30 flex-center transition-all duration-300",
            (scrollPosition?.y ?? 0) >= 180
              ? "translate-x-0 opacity-100"
              : "translate-x-24 opacity-0 pointer-events-none"
          )}
          aria-label="Scroll to top"
        >
          <ArrowUpCircleIcon className="w-6 h-6 text-white" />
        </button>
      )}
    </>
  );
}
