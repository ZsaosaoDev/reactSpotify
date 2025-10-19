import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

import NoAvatar from '~/assets/image/noAvatar.png';
import Slider from '~/components/slider/Slider';
import { setReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import { getMySongs } from '~/apis/songApi';
import './YourMusic.sass';

const YourMusic = ({ listenSong }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [songs, setSongs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handlePlay = (e, song) => {
        e.stopPropagation();
        listenSong(e, song.id);
    };

    const handleContext = (e, payload) => {
        e.preventDefault();
        dispatch(setReduxLibrarySong(payload));
    };

    useEffect(() => {
        const fetchSongs = async () => {
            setIsLoading(true);
            try {
                const res = await getMySongs();
                setSongs(res || []);
            } catch (err) {
                console.error('Failed to load songs:', err);
                setSongs([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSongs();
    }, []);

    if (isLoading) return <div className="yourMusicContainer">Loading...</div>;
    if (songs.length === 0) return <div className="yourMusicContainer">You have no songs yet.</div>;

    return (
        <div className="yourMusicContainer">
            <div className="header">
                <h2 className="yourMusicHeader">Your Songs</h2>
                <button className="uploadButton" onClick={() => navigate('/song/upload')}>
                    Upload New Song
                </button>
            </div>
            <div className="yourMusicSection">
                {songs.map((song) => (
                    <div
                        key={song.id}
                        className="yourMusicCard"
                        onContextMenu={(e) =>
                            handleContext(e, [
                                // { type: 'playlist', id: song.id },
                                // { type: 'artist', id: song.artistId },
                            ])
                        }>
                        <div className="yourMusicImage">
                            <img src={song.imageUrl || NoAvatar} alt={song.title} />
                        </div>
                        <div className="yourMusicTitle">{song.title}</div>
                        <div className="yourMusicArtist" onClick={() => navigate(`/artist/${song.artistId}`)}>
                            {song.artistName || 'Unknown Artist'}
                        </div>
                        <div className="yourMusicPlayButton" onClick={(e) => handlePlay(e, song)}>
                            <FontAwesomeIcon icon={faPlay} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YourMusic;
