import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getPlaylistWithListSong } from '~/apis/songApi';
import { calculateTotalTime, formatDuration } from '~/util/timeUtils';
import { setReduxIsRight } from '~/redux/reducer/songNotWhitelistSlice';
import ControlListSong from '~/components/control/ControlListSong';
import NoAvatar from '~/assets/image/noAvatar.png';
import './PlaylistView.sass';

const PlaylistView = ({ playlistId, onPlayListSong, handleLibrarySong }) => {
    const dispatch = useDispatch();
    const [hoverIndex, setHoverIndex] = useState(null);
    const [playlistData, setPlaylistData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const currentSongId = reduxListSong[currentIndex]?.song.id;
    const isPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);

    // ================== FETCH PLAYLIST DATA ==================
    useEffect(() => {
        const fetchPlaylistData = async () => {
            if (!playlistId) {
                console.warn('playlistId is missing, skipping API call');
                return;
            }

            setIsLoading(true);
            try {
                const data = await getPlaylistWithListSong(playlistId);
                console.log('Playlist data:', data);
                setPlaylistData(data);
                dispatch(setReduxIsRight(false));
            } catch (err) {
                console.error('Error fetching playlist data:', err.response || err.message);
                setPlaylistData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylistData();
    }, [playlistId, dispatch]);

    // ================== HANDLERS ==================
    const handleMouseEnter = (index) => setHoverIndex(index);
    const handleMouseLeave = () => setHoverIndex(null);

    const handlePlaySong = (e, songId) => {
        if (!playlistData) return;
        onPlayListSong(e, songId, playlistData);
    };

    const renderPlayButton = (song, index) => {
        if (song.id === currentSongId && isPlaying) {
            return (
                <img
                    src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif"
                    alt="Playing"
                    className="equalizerGif"
                />
            );
        }
        if (hoverIndex === index) {
            return <FontAwesomeIcon icon={faPlay} />;
        }
        return index + 1;
    };

    // ================== UI ==================
    if (isLoading) {
        return <div className="playlistContainer">Loading...</div>;
    }

    if (!playlistData) {
        return <div className="playlistContainer">Playlist not found</div>;
    }

    const { playlist, songs } = playlistData;

    return (
        <div className="playlistContainer">
            {/* ====== Header ====== */}
            <div className="playlistHeader">
                <div className="playlistPicture">
                    <img src={playlist.imageUrl || NoAvatar} alt={playlist.name} />
                </div>
                <div className="playlistInfo">
                    <div className="playlistTitle">{playlist.name}</div>
                    <div className="playlistDetails">
                        <div className="playlistSongCount">{songs.length} song(s)</div>
                        <div className="playlistTotalTime">{calculateTotalTime(songs)}</div>
                    </div>
                </div>
            </div>

            {/* ====== Body ====== */}
            <div className="playlistBody">
                <ControlListSong isPlaying={isPlaying} onPlayListSong={handlePlaySong} listSong={songs} />

                <div className="songList">
                    {songs.map((song, index) => (
                        <div
                            key={song.id || index}
                            className={`songItem ${song.id === currentSongId ? 'active' : ''}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                            onContextMenu={(e) => {
                                console.log(playlistId);
                                handleLibrarySong(e, [{ type: 'playlist', id: playlistId }]);
                            }}>
                            <div className="songRow">
                                <div className="songIndex">
                                    <button className="playButton" onClick={(e) => handlePlaySong(e, song.id)}>
                                        {renderPlayButton(song, index)}
                                    </button>
                                </div>
                                <div className="songImage">
                                    <img src={song.imageUrl || NoAvatar} alt={song.title} />
                                </div>
                                <div className="songInfo">
                                    <div className="songTitle">{song.title}</div>
                                    <div className="songArtist">{song.author || 'Unknown Artist'}</div>
                                </div>
                            </div>
                            <div className="songDuration">{formatDuration(song.duration)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlaylistView;
