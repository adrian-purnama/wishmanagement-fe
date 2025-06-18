import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { UserContext } from '../../utils/UserContext';

const Navbar = () => {
  const { username, setUsername, setIsLoggedin } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen(!open);

  const handleLogout = () => {
    localStorage.removeItem('wish-token');
    setUsername(null);
    setIsLoggedin(false);
    setOpen(false);
    navigate('/');
  };

  const AuthButtons = () =>
    username ? (
      <div className="flex items-center gap-2">
        <span>👤 {username}</span>
        <button onClick={handleLogout} className="text-sm hover:underline text-red-300">
          Logout
        </button>
      </div>
    ) : (
      <>
        <Link to="/login" className="hover:underline">Login</Link>
        <Link to="/register" className="hover:underline">Register</Link>
      </>
    );

  return (
    <nav className="bg-blue-600 text-white dark:bg-gray-900 shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold">Logo</div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center text-sm">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/purchase" className="hover:underline">Purchase</Link>
          <Link to="/sale" className="hover:underline">Sale</Link>
          <Link to="/item" className="hover:underline">Item</Link>
          <AuthButtons />
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden" onClick={toggleMenu}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Collapsible Menu */}
      {open && (
        <div className="md:hidden px-6 pb-4 animate-fade-in-down space-y-2 text-sm bg-blue-600 dark:bg-gray-900">
          <Link to="/dashboard" onClick={toggleMenu} className="block hover:underline">Dashboard</Link>
          <Link to="/purchase" onClick={toggleMenu} className="block hover:underline">Purchase</Link>
          <Link to="/sale" onClick={toggleMenu} className="block hover:underline">Sale</Link>
          <Link to="/item" onClick={toggleMenu} className="block hover:underline">Item</Link>
          {username ? (
            <div className="pt-2 text-white space-y-2">
              <div>👤 {username}</div>
              <button
                onClick={handleLogout}
                className="block text-left w-full text-red-300 hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" onClick={toggleMenu} className="block hover:underline">Login</Link>
              <Link to="/register" onClick={toggleMenu} className="block hover:underline">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
