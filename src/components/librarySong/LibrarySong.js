import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cleanReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import { addSongToPlaylist } from '~/apis/songApi';
import Notification from '~/components/librarySong/Notification';
import './LibrarySong.sass';

const LibrarySong = () => {
    const [menuPosition, setMenuPosition] = useState(null);
    const [notificationData, setNotificationData] = useState(null);
    const reduxLibrarySong = useSelector((state) => state.songNotWhite.reduxLibrarySong);
    const dispatch = useDispatch();

    // Open/close context menu with viewport boundary check
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const menuWidth = 200; // Adjust based on actual menu size
            const menuHeight = 100;
            const x = Math.min(e.clientX, windowWidth - menuWidth);
            const y = Math.min(e.clientY, windowHeight - menuHeight);
            setMenuPosition((prev) => (prev ? null : { x, y }));
        };

        const handleClick = () => {
            setMenuPosition(null);
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
        };
    }, []);

    // Keyboard accessibility for context menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                e.preventDefault();
                setMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Scroll locking when popup is open
    useEffect(() => {
        const preventScroll = (e) => e.preventDefault();

        if (menuPosition) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('wheel', preventScroll, { passive: false });
            window.addEventListener('touchmove', preventScroll, { passive: false });
        } else {
            document.body.style.overflow = 'auto';
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
            dispatch(cleanReduxLibrarySong());
        }

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
        };
    }, [menuPosition, dispatch]);

    // Handle menu item clicks
    const handleMenuClick = (e, action) => {
        e.stopPropagation();
        setMenuPosition(null);
        action();
    };

    // Handle clicks on the menu container (background) to close it
    const handleMenuContainerClick = (e) => {
        e.stopPropagation();
        setMenuPosition(null);
    };

    // Handle right-click on the menu to close it
    const handleMenuContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuPosition(null);
    };
    const [notificationKey, setNotificationKey] = useState(0);
    // Dynamic menu options based on type
    const getMenuOptions = () => {
        const { type, id } = reduxLibrarySong;
        let options = [];

        switch (type) {
            case 'playlist':
                options.push({
                    label: 'Add to Playlist',
                    action: async () => {
                        try {
                            const res = await addSongToPlaylist(1, id);
                            setNotificationData(res);
                            setNotificationKey((prev) => prev + 1); // Change key to re-trigger Notification
                        } catch (err) {
                            console.error('Failed to add to playlist:', err);
                        }
                    },
                });
                break;
            case 'artist':
                options.push({
                    label: 'Follow Artist',
                    action: () => {
                        try {
                            console.log(`Action for ${type}`);
                        } catch (err) {
                            console.error('Failed to follow artist:', err);
                        }
                    },
                });
                options.push({
                    label: 'View Artist Profile',
                    action: () => {
                        try {
                            console.log('View profile');
                        } catch (err) {
                            console.error('Failed to view profile:', err);
                        }
                    },
                });
                break;
            default:
                options.push({
                    label: 'No Action Available',
                    action: () => console.log('No valid type specified'),
                });
                break;
        }

        return options;
    };
    return (
        <div className="library-song-container">
            <Notification key={notificationKey} message={notificationData} />
            {menuPosition && (
                <div
                    className="library-song-menu"
                    role="menu"
                    style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
                    onClick={handleMenuContainerClick}
                    onContextMenu={handleMenuContextMenu}>
                    {getMenuOptions().map((option, index) => (
                        <div key={index} role="menuitem" className="library-song-menu-item" onClick={(e) => handleMenuClick(e, option.action)} onContextMenu={(e) => e.stopPropagation()}>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibrarySong;
