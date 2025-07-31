import React from 'react';
import { User as UserIcon } from 'lucide-react';

const Avatar = ({ src, alt, size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20'
    };
    return (
        <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0 ${className}`}>
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                // Fallback icon if no image source is provided
                <UserIcon className="w-1/2 h-1/2 text-gray-400" />
            )}
        </div>
    );
};

export default Avatar;