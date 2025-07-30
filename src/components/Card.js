import React from 'react';

const Card = ({ children, className = '', hover = false }) => (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>{children}</div>
);

export default Card; 