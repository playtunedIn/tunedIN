const authUrl = 'https://local.playtunedin-test.com:3001/login';

export const Login = () => {
  const redirectToAuth = () => (window.location.href = authUrl);

  return (
    <>
      <button onClick={redirectToAuth}>Log in with Spotify</button>
    </>
  );
};

export default Login;
