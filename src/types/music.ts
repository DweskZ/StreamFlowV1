// types/music.ts

export interface Track {
  id: string;
  name: string;
  duration: string;
  artist_id: string;
  artist_name: string;
  artist_idstr: string;
  album_id: string;
  album_name: string;
  album_image: string;
  album_images: {
    size25: string;
    size50: string;
    size100: string;
    size130: string;
    size200: string;
    size300: string;
    size400: string;
    size500: string;
    size600: string;
  };
  license_ccurl: string;
  position: number;
  releasedate: string;
  album_datecreated: string;
  prourl: string;
  shorturl: string;
  shareurl: string;
  waveform: string;
  image: string;
  audio: string;
  audiodownload: string;
  proaudio: string;
  audiodlallowed: boolean;
  tags: {
    genres: string[];
    instruments: string[];
    vartags: string[];
  };
}

export interface Album {
  id: string;
  name: string;
  artist_id: string;
  artist_name: string;
  image: string;
  releasedate: string;
  tracks: Track[];
  totalTracks: number;
  duration: string;
}

export interface ApiResponse {
  headers: {
    status: string;
    code: number;
    error_message: string;
    warnings: string;
    results_fullcount: number;
  };
  results: Track[];
}

export interface PlaylistTrack extends Track {
  addedAt: Date;
}
