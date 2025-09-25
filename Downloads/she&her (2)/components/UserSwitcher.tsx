
import React, { Fragment } from 'react';
import { User } from '../types';
import { ChevronDownIcon, UserCircleIcon } from './Icons'; // Assuming you have these

interface UserSwitcherProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  users: User[];
}

// Simple headless-ui-like Dropdown for demonstration
const UserSwitcher: React.FC<UserSwitcherProps> = ({ currentUser, onUserChange, users }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          <UserCircleIcon className="-ml-1 h-5 w-5 text-gray-200" aria-hidden="true" />
          {currentUser.name}
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-200" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {users.map((user) => (
              <a
                href="#"
                // Fix: Use _id instead of id to match User type
                key={user._id}
                onClick={(e) => {
                  e.preventDefault();
                  onUserChange(user);
                  setIsOpen(false);
                }}
                // Fix: Use _id instead of id to match User type
                className={`block px-4 py-2 text-sm ${
                    currentUser._id === user._id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                } hover:bg-gray-100 hover:text-gray-900`}
                role="menuitem"
                // Fix: Use _id instead of id to match User type
                id={`menu-item-${user._id}`}
              >
                {user.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
