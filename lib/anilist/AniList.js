export async function aniListData({ sort, page = 1 }) {
  const resAnilist = await fetch(`https://graphql.anilist.co`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
            query (
      $id: Int
      $page: Int
      $perPage: Int
      $search: String
      $sort: [MediaSort]
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
          perPage
        }
        media(id: $id, search: $search, sort: $sort type: ANIME) {
          id
          idMal
          status
          title {
            romaji
            english
          }
          bannerImage
          coverImage {
            extraLarge
            color
          }
          description
        }
      }
    }
  `,
      variables: {
        page: page,
        perPage: 15,
        sort,
      },
    }),
  });

  const anilistData = await resAnilist.json();

  // Handle API errors
  if (!resAnilist.ok) {
    console.error('AniList API Error:', anilistData);
    return {
      props: {
        data: [],
      },
    };
  }

  // Check if data exists
  if (!anilistData?.data?.Page?.media) {
    console.error('Invalid AniList response:', anilistData);
    return {
      props: {
        data: [],
      },
    };
  }

  const data = anilistData.data.Page.media;

  return {
    props: {
      data,
    },
  };
}
