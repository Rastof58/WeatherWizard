const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
}

export const tmdbApi = {
  async getTrending(page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const response = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}&page=${page}`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending content');
    }
    return response.json();
  },

  async getPopularMovies(page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`);
    if (!response.ok) {
      throw new Error('Failed to fetch popular movies');
    }
    return response.json();
  },

  async getPopularTVShows(page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`);
    if (!response.ok) {
      throw new Error('Failed to fetch popular TV shows');
    }
    return response.json();
  },

  async searchMulti(query: string, page = 1): Promise<{ results: TMDBMovie[]; total_pages: number }> {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodedQuery}&page=${page}`);
    if (!response.ok) {
      throw new Error('Failed to search content');
    }
    return response.json();
  },

  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    const [detailsResponse, creditsResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`)
    ]);

    if (!detailsResponse.ok || !creditsResponse.ok) {
      throw new Error('Failed to fetch movie details');
    }

    const [details, credits] = await Promise.all([
      detailsResponse.json(),
      creditsResponse.json()
    ]);

    return {
      ...details,
      credits: credits
    };
  },

  async getTVDetails(tvId: number): Promise<TMDBMovieDetails> {
    const [detailsResponse, creditsResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE_URL}/tv/${tvId}/credits?api_key=${TMDB_API_KEY}`)
    ]);

    if (!detailsResponse.ok || !creditsResponse.ok) {
      throw new Error('Failed to fetch TV show details');
    }

    const [details, credits] = await Promise.all([
      detailsResponse.json(),
      creditsResponse.json()
    ]);

    return {
      ...details,
      credits: credits
    };
  },

  getImageUrl(path: string | null, size: 'w200' | 'w500' | 'w1280' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },

  getStreamUrl(tmdbId: number, isMovie: boolean = true): string {
    const type = isMovie ? 'movie' : 'tv';
    return `https://vidsrc.to/embed/${type}/${tmdbId}`;
  }
};
