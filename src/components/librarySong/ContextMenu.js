import { useEffect, useState } from 'react';
import PlaylistPanel from './PlaylistPanel';
import { useMenuOptions } from './hooks/useMenuOptions';
import './ContextMenu.sass';

const ContextMenu = ({ position, reduxData, playlists, onClose, onNotification }) => {
    const [playlistPanelPosition, setPlaylistPanelPosition] = useState(null);

    // Show playlist panel with position calculation
    const showPlaylistPanel = () => {
        const panelWidth = 200;
        const panelX = position.x + 200;
        const panelY = position.y;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const adjustedX = Math.min(panelX, windowWidth - panelWidth);
        const adjustedY = Math.min(panelY, windowHeight - 100);

        setPlaylistPanelPosition({ x: adjustedX, y: adjustedY });
    };

    // Get menu options based on reduxData type
    const baseMenuOptions = useMenuOptions(reduxData);

    // Inject showPlaylistPanel action for playlist options
    const menuOptions = baseMenuOptions.map((option) => ({
        ...option,
        action: option.isPlaylistAction ? showPlaylistPanel : option.action,
    }));

    // Scroll locking when menu is open
    useEffect(() => {
        const preventScroll = (e) => {
            e.preventDefault();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
        };
    }, []);

    // Handle menu item click
    const handleMenuItemClick = (e, option) => {
        e.stopPropagation();
        console.log('Menu item clicked:', option.label);

        if (!option.isPlaylistAction) {
            option.action();
            onClose();
        }
    };

    // Handle menu item hover (for playlist action)
    const handleMenuItemHover = (option) => {
        if (option.isPlaylistAction && option.action) {
            option.action();
        } else {
            // Close playlist panel when hovering other menu items
            setPlaylistPanelPosition(null);
        }
    };

    return (
        <>
            <div
                className="library-song-menu"
                role="menu"
                style={{ top: `${position.y}px`, left: `${position.x}px` }}
                onClick={onClose}
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                }}>
                {menuOptions.map((option, index) => (
                    <div key={index} role="menuitem" className="library-song-menu-item" onClick={(e) => handleMenuItemClick(e, option)} onMouseEnter={() => handleMenuItemHover(option)}>
                        {option.label}
                    </div>
                ))}
            </div>

            {playlistPanelPosition && <PlaylistPanel position={playlistPanelPosition} playlists={playlists} songId={reduxData.id} onClose={onClose} onNotification={onNotification} />}
        </>
    );
};

export default ContextMenu;
