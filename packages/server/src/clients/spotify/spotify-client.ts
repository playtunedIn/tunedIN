type Image = {
  url: string;
};

type Profile = {
  display_name: string;
  external_urls: Record<string, string>;
  href: string;
  id: string;
  images: Image[];
  type: string;
  uri: string;
  country: string;
  product: string;
  explicit_content: { filter_enabled: boolean; filter_locked: boolean };
  email: string;
};

export const getSelf = async (token: string): Promise<Profile> => {
  // use the access token to access the Spotify Web API
  const options = {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token },
    json: true,
  };
  const accessResponse = await fetch('https://api.spotify.com/v1/me', options);
  const profileBody = (await accessResponse.json()) as Profile;
  return profileBody;
};
