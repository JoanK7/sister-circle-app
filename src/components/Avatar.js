import React from 'react';

const Avatar = ({ user, size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl'
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className={`bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold ${sizeClasses[size]} ${className}`}>
            {getInitials(user?.displayName || user?.fullName)}
        </div>
    );
};

export default Avatar; 