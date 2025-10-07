import { addSongToPlaylist, createPlaylistWithSong } from '~/apis/songApi';
import { IconPlus, IconSearch } from '~/assets/image/icons';
import { useEffect } from 'react';
import './PlaylistPanel.sass';

const PlaylistPanel = ({ position, playlists, songId, onClose, onNotification, onMouseEnter, onMouseLeave }) => {
    // Handle playlist selection
    const handlePlaylistSelect = async (e, playlistId) => {
        e.stopPropagation();
        console.log('Selected playlist ID:', playlistId);

        try {
            const res = await addSongToPlaylist(playlistId, songId);
            onNotification(res.message || res);
        } catch (err) {
            console.error('Failed to add to playlist:', err);
            onNotification('Failed to add song to playlist');
        }

        onClose();
    };

    // Handle new playlist creation
    const handleCreateNewPlaylist = async (e) => {
        e.stopPropagation();
        console.log('Creating new playlist...');

        try {
            const res = await createPlaylistWithSong(songId);
            console.log(res);
            onNotification(res.message || `Created playlist ${res.name}`);
        } catch (err) {
            onNotification('Failed to create playlist');
        }

        onClose();
    };

    // Focus playlist list on mount
    useEffect(() => {
        const playlistList = document.querySelector('.playlist-list');
        if (playlistList) {
            playlistList.focus();
        }
    }, []);

    return (
        <div
            className="playlist-panel"
            role="menu"
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }}
            onWheel={(e) => e.stopPropagation()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}>
            <div className="header">
                <div className="search">
                    <IconSearch height={14} className="icon" />
                    <input type="text" placeholder="Find a playlist" />
                </div>
                <div className="new-playlist" onClick={handleCreateNewPlaylist}>
                    <IconPlus height={14} className="icon" />
                    <span>New Playlist</span>
                </div>
            </div>
            <div
                className="playlist-list"
                tabIndex={0}
                onWheel={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const items = document.querySelectorAll('.playlist-item');
                        const current = document.activeElement;
                        const index = Array.from(items).indexOf(current);
                        const nextIndex = e.key === 'ArrowDown' ? index + 1 : index - 1;
                        if (items[nextIndex]) {
                            items[nextIndex].focus();
                        }
                    }
                }}>
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <div
                            key={playlist.id}
                            role="menuitem"
                            className="playlist-item"
                            tabIndex={-1} // Allow individual items to be focusable
                            onClick={(e) => handlePlaylistSelect(e, playlist.id)}>
                            {playlist.name}
                        </div>
                    ))
                ) : (
                    <div className="playlist-item">No playlists available</div>
                )}
            </div>
        </div>
    );
};

export default PlaylistPanel;
