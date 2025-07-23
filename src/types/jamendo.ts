export interface JamendoTrack {
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
    "size25": string;
    "size50": string;
    "size100": string;
    "size130": string;
    "size200": string;
    "size300": string;
    "size400": string;
    "size500": string;
    "size600": string;
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

export interface JamendoResponse {
  headers: {
    status: string;
    code: number;
    error_message: string;
    warnings: string;
    results_fullcount: number;
  };
  results: JamendoTrack[];
}

export interface PlaylistTrack extends JamendoTrack {
  addedAt: Date;
}