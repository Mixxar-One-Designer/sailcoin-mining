// pages/index.js
import useAuth from '../hooks/useAuth';

export default function Home() {
  const user = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to the Sailcoin Mining Page</h1>
      <p>User ID: {user.uid}</p>
      {/* Your mining page content */}
    </div>
  );
}