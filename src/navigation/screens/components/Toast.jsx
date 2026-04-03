/* Toast.jsx */
import React, { useEffect } from 'react';
import './Toast.css';

function Toast({ message, type, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(); // Automatically close after 3 seconds
        }, 3000);

        return () => clearTimeout(timer); // Cleanup if component unmounts
    }, [onClose]);

    return (
        <div className={`custom-toast ${type}`}>
            {message}
        </div>
    );
}

export default Toast;