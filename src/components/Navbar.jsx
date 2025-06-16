import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../utils/UserContext';


const Navbar = () => {
  const { username } = useContext(UserContext);

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 shadow flex justify-between items-center">
      <div className="text-lg font-bold">Logo</div>
      <div className="space-x-4 text-sm">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/purchase" className="hover:underline">Purchase</Link>
        <Link to="/sale" className="hover:underline">Sale</Link>
        <Link to="/item" className="hover:underline">Item</Link>
        {username ? (
          <span className="ml-4">👤 {username}</span>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
