//get-current-users-profile return type
export interface ExplicitContent {
  filter_enabled: boolean;
  filter_locked: boolean;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Followers {
  href: string | null;
  total: number;
}
export interface Image {
  url: string;
  height: number | null;
  width: number | null;
}

export interface UserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: ExplicitContent;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

//get-current-users-playlist return type

export interface Owner {
  external_urls: ExternalUrls;
  followers?: Followers; //JAMIE look into this, documentation says required, but data not coming back w this field
  href: string;
  id: string;
  type: string;
  uri: string;
  display_name: string | null;
}

export interface Tracks {
  href: string;
  total: number;
}

export interface SimplifiedPlaylistObject {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: Owner;
  public: boolean;
  snapshot_id: string;
  tracks: Tracks;
  type: string;
  uri: string;
}

export interface UserPlaylist {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SimplifiedPlaylistObject[];
}

//get-recently-played-tracks return type

export interface Cursors {
  after: string;
  before: string;
}

export interface Restrictions {
  reason: string;
}

export interface SimplifiedArtist {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface Album {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions?: Restrictions; //JAMIE not optional in documentation
  type: string;
  uri: string;
  artists: SimplifiedArtist[];
}

export interface Artist {
  external_urls: ExternalUrls;
  followers: Followers;
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

export interface ExternalIds {
  isrc: string;
  ean?: string;
  upc?: string;
}

export interface Track {
  album: Album;
  artists: Artist[] | SimplifiedArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_playable?: boolean; //JAMIE not optional in documentation
  linked_from?: object; //JAMIE not optional in documentation
  restrictions?: Restrictions; //JAMIE not optional in documentation
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
  is_local: boolean;
}

export interface Context {
  type: string;
  href: string;
  external_urls: ExternalUrls;
  uri: string;
}

export interface PlayHistoryObject {
  track: Track;
  played_at: string;
  context: Context | null;
}

export interface UserRecentTracks {
  href: string;
  limit: number;
  next: string;
  cursors: Cursors;
  total?: number; //SHOULD not be optional, documentation was wrong
  items: PlayHistoryObject[];
}

//combination of all three

export interface SpotifyData {
  get_current_users_profile: UserProfile;
  get_current_users_playlist: UserPlaylist;
  get_recently_played_tracks: UserRecentTracks;
}
