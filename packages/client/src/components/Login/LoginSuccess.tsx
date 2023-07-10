import { useState, useEffect } from 'react';

type User = {
  display_name: string;
  images: { url: string }[];
};

export const Login = () => {
  const [token, setToken] = useState<string>();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('access_token')?.toString());
  }, []);
  useEffect(() => {
    const fetchMe = async () => {
      const accessResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const body = await accessResponse.json();
      setUser(body);
    };
    fetchMe();
  }, [token]);
  return (
    <>
      <h2>Success! {user?.display_name}</h2>
      {user?.images?.length && <img src={user.images[0].url} />}
    </>
  );
};

export default Login;
