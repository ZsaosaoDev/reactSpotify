import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cleanReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import { addSongToPlaylist, getMyPlaylists } from '~/apis/songApi';
import Notification from '~/components/librarySong/Notification';
import './LibrarySong.sass';

const LibrarySong = () => {
    const [menuPosition, setMenuPosition] = useState(null);
    const [notificationData, setNotificationData] = useState(null);
    const [notificationKey, setNotificationKey] = useState(0);
    const [playlistPanel, setPlaylistPanel] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [closeTimer, setCloseTimer] = useState(null);
    const reduxLibrarySong = useSelector((state) => state.songNotWhite.reduxLibrarySong);
    const dispatch = useDispatch();

    // Fetch playlists on mount
    useEffect(() => {
        const loadPlaylists = async () => {
            try {
                const playlistData = await getMyPlaylists();
                console.log('Fetched playlists:', playlistData);
                setPlaylists(playlistData);
            } catch (err) {
                console.error('Failed to fetch playlists:', err);
            }
        };
        loadPlaylists();
    }, []);

    // Close menus and clean redux
    const closeMenus = () => {
        console.log('Closing menus and dispatching cleanReduxLibrarySong');
        setMenuPosition(null);
        setPlaylistPanel(null);
        dispatch(cleanReduxLibrarySong());
    };

    // Open/close context menu with viewport boundary check
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();

            // Nếu đang có menu mở, đóng nó đi
            if (menuPosition || playlistPanel) {
                console.log('Menu already open, closing it');
                closeMenus();
                return;
            }

            // Nếu chưa có menu, mở menu mới
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const menuWidth = 200;
            const menuHeight = 100;
            const x = Math.min(e.clientX, windowWidth - menuWidth);
            const y = Math.min(e.clientY, windowHeight - menuHeight);
            console.log('Opening context menu at:', { x, y });
            setMenuPosition({ x, y });
            setPlaylistPanel(null);
        };

        const handleClick = (e) => {
            const isMenuClick = e.target.closest('.library-song-menu');
            const isPlaylistClick = e.target.closest('.playlist-selection-panel');
            if (!isMenuClick && !isPlaylistClick) {
                console.log('Document clicked, closing menus');
                closeMenus();
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('click', handleClick);
        };
    }, [menuPosition, playlistPanel]);

    // Keyboard accessibility for context menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
                e.preventDefault();
                console.log('Keyboard context menu triggered');
                setMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
                setPlaylistPanel(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Scroll locking when popup or playlist panel is open
    useEffect(() => {
        const preventScroll = (e) => {
            e.preventDefault();
        };

        if (menuPosition || playlistPanel) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('wheel', preventScroll, { passive: false });
            window.addEventListener('touchmove', preventScroll, { passive: false });
        } else {
            document.body.style.overflow = 'auto';
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
        }

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
        };
    }, [menuPosition, playlistPanel]);

    // Handle menu item clicks
    const handleMenuClick = (e, action, isPlaylistAction) => {
        e.stopPropagation();
        console.log('Menu item clicked, action:', action, 'isPlaylistAction:', isPlaylistAction);
        if (!isPlaylistAction) {
            action();
            closeMenus();
        }
        // Nếu là playlist action, không làm gì khi click (chỉ hover)
    };

    // Show playlist panel
    const showPlaylistPanel = () => {
        if (closeTimer) {
            clearTimeout(closeTimer);
            setCloseTimer(null);
        }
        if (menuPosition) {
            const panelWidth = 200;
            const panelX = menuPosition.x + 200;
            const panelY = menuPosition.y;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const adjustedX = Math.min(panelX, windowWidth - panelWidth);
            const adjustedY = Math.min(panelY, windowHeight - 100);
            console.log('Setting playlistPanel:', { x: adjustedX, y: adjustedY });
            setPlaylistPanel({ x: adjustedX, y: adjustedY });
        } else {
            console.error('menuPosition is null');
        }
    };

    // Delay close playlist panel
    const delayClosePlaylistPanel = () => {
        const timer = setTimeout(() => {
            console.log('Closing playlist panel after delay');
            setPlaylistPanel(null);
        }, 300); // 300ms delay để có thời gian rê chuột qua
        setCloseTimer(timer);
    };

    // Cancel close timer khi chuột vào playlist panel
    const cancelCloseTimer = () => {
        if (closeTimer) {
            clearTimeout(closeTimer);
            setCloseTimer(null);
            console.log('Cancelled close timer');
        }
    };

    // Handle playlist selection
    const handlePlaylistSelect = async (e, playlistId) => {
        e.stopPropagation();
        console.log('Selected playlist ID:', playlistId);
        try {
            const res = await addSongToPlaylist(playlistId, reduxLibrarySong.id);
            console.log('API response:', res);
            setNotificationData(`${res.message || res} ${Date.now()}`);
            setNotificationKey((prev) => prev + 1);
        } catch (err) {
            console.error('Failed to add to playlist:', err);
        }
        closeMenus();
    };

    // Dynamic menu options based on type
    const getMenuOptions = () => {
        const { type, id } = reduxLibrarySong;
        let options = [];

        console.log('reduxLibrarySong:', { type, id });

        switch (type) {
            case 'playlist':
                options.push({
                    label: 'Add to Playlist',
                    action: showPlaylistPanel,
                    isPlaylistAction: true,
                });
                break;
            case 'artist':
                options.push({
                    label: 'Follow Artist',
                    action: () => console.log('Follow artist action'),
                    isPlaylistAction: false,
                });
                options.push({
                    label: 'View Artist Profile',
                    action: () => console.log('View artist profile action'),
                    isPlaylistAction: false,
                });
                break;
            default:
                options.push({
                    label: 'No Action Available',
                    action: () => console.log('No valid type specified'),
                    isPlaylistAction: false,
                });
                break;
        }

        return options;
    };

    return (
        <div className="library-song-container">
            <Notification key={notificationKey} message={notificationData} setNotificationData={setNotificationData} />
            {menuPosition && (
                <div
                    className="library-song-menu"
                    role="menu"
                    style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
                    onClick={closeMenus}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeMenus();
                    }}>
                    {getMenuOptions().map((option, index) => (
                        <div
                            key={index}
                            role="menuitem"
                            className="library-song-menu-item"
                            onClick={(e) => handleMenuClick(e, option.action, option.isPlaylistAction)}
                            onMouseEnter={option.isPlaylistAction ? option.action : null}
                            onMouseLeave={option.isPlaylistAction ? delayClosePlaylistPanel : null}>
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
            {playlistPanel && (
                <div
                    className="playlist-selection-panel"
                    role="menu"
                    style={{ top: `${playlistPanel.y}px`, left: `${playlistPanel.x}px` }}
                    onClick={(e) => e.stopPropagation()}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeMenus();
                    }}
                    onMouseEnter={cancelCloseTimer}
                    onMouseLeave={delayClosePlaylistPanel}>
                    {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                            <div key={playlist.id} role="menuitem" className="playlist-selection-item" onClick={(e) => handlePlaylistSelect(e, playlist.id)}>
                                {playlist.name}
                            </div>
                        ))
                    ) : (
                        <div className="playlist-selection-item">No playlists available</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LibrarySong;
