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
    const encodedToken = params.get('token')?.toString();
    setToken(encodedToken);
  }, []);
  useEffect(() => {
    const fetchMe = async () => {
      const accessResponse = await fetch('https://local.playtunedin-test.com:3001/self', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const body = await accessResponse.json();
      setUser(body.user);
    };
    if (token) {
      fetchMe();
    }
  }, [token]);
  return (
    <>
      <h2>Success! {user?.display_name}</h2>
      {user?.images?.length && <img src={user.images[0].url} />}
    </>
  );
};

export default Login;
