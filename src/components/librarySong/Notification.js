import './Notification.sass';
import { useEffect, useState } from 'react';

const Notification = ({ data, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (data) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose(); // thông báo cho parent nếu cần
            }, 3000); // 3 giây

            return () => clearTimeout(timer);
        }
    }, [data, onClose]);

    return (
        <div className={`notification ${visible ? 'show' : ''}`}>
            <p>{data}</p>
        </div>
    );
};

export default Notification;
