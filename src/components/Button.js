import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => (
    <button className={`btn ${variant} ${size} ${className}`} {...props}>{children}</button>
);

export default Button; 