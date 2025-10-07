import { addSongToPlaylist, createPlaylistWithSong } from '~/apis/songApi';
import { IconPlus, IconSearch } from '~/assets/image/icons';
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

    const handleCreateNewPlaylist = async (e) => {
        e.stopPropagation();
        console.log('Creating new playlist...');

        try {
            const res = await createPlaylistWithSong(songId);
            console.log(res);
            onNotification(res.message || 'Created playlist' + res.name);
        } catch (err) {
            onNotification('Failed to create playlist');
        }

        // Đóng panel sau khi tạo xong
        onClose();
    };

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
            <div className="playlist-list">
                {playlists.length > 0 ? (
                    playlists.map((playlist) => (
                        <div key={playlist.id} role="menuitem" className="playlist-item" onClick={(e) => handlePlaylistSelect(e, playlist.id)}>
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
