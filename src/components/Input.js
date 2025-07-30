import React from 'react';

const Input = ({ label, error, className = '', type = 'text', ...props }) => (
    <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <input type={type} className={`input-field ${error ? 'input-error' : ''} ${className}`} {...props} />
        {error && <p className="error-message">{error}</p>}
    </div>
);

export default Input; 