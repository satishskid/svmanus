import React from 'react';
import { UserRole } from '../types';
import { UserIcon, ClipboardDocCheckIcon, UserGroupIcon, Cog6ToothIcon } from './Icons';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLE_CONFIG = {
    USER: { label: 'User', icon: UserIcon },
    HR: { label: 'HR', icon: UserGroupIcon },
    PROVIDER: { label: 'Provider', icon: ClipboardDocCheckIcon },
    MANAGER: { label: 'Manager', icon: Cog6ToothIcon },
};

const RoleButton: React.FC<{
  role: UserRole;
  currentRole: UserRole;
  onClick: (role: UserRole) => void;
}> = ({ role, currentRole, onClick }) => {
  const isActive = role === currentRole;
  const { label, icon: Icon } = ROLE_CONFIG[role];
  return (
    <button
      onClick={() => onClick(role)}
      className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-white text-purple-700 shadow'
          : 'bg-transparent text-white hover:bg-white/20'
      }`}
      aria-pressed={isActive}
      title={label}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  return (
    <div className="flex items-center space-x-1 p-1 bg-white/10 rounded-lg" role="tablist" aria-label="View selection">
      <RoleButton role="USER" currentRole={currentRole} onClick={onRoleChange} />
      <RoleButton role="HR" currentRole={currentRole} onClick={onRoleChange} />
      <RoleButton role="PROVIDER" currentRole={currentRole} onClick={onRoleChange} />
      <RoleButton role="MANAGER" currentRole={currentRole} onClick={onRoleChange} />
    </div>
  );
};

export default RoleSwitcher;
