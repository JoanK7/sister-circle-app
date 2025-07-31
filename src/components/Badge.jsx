import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-pink-100 text-pink-700',
        secondary: 'bg-purple-100 text-purple-700',
        success: 'bg-green-100 text-green-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;