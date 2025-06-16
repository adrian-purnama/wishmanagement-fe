import { useContext } from 'react';
import { UserContext } from '../../../utils/UserContext';
import Navbar from '../../components/Navbar';

const HomePage = () => {
  const { username } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Inventory Tracker</h1>
        {username ? (
          <p className="text-lg mb-4">Hello, <strong>{username}</strong> 👋</p>
        ) : (
          <p className="text-lg mb-4">Please log in to access your data.</p>
        )}
        <ul className="list-disc list-inside text-sm leading-loose">
          <li>Track your purchases and item details</li>
          <li>Record and analyze your sales</li>
          <li>Visualize spending and gain over time</li>
          <li>Manage your product inventory easily</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
