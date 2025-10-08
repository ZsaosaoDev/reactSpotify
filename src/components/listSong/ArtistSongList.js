import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getArtistWithSongsAndAlbums } from '~/apis/songApi';
import { formatDuration, calculateTotalTime } from '~/util/timeUtils';
import { setReduxIsRight } from '~/redux/reducer/songNotWhitelistSlice';
import './ArtistSongList.sass';

const ArtistSongList = ({ artistId, onPlayListSong }) => {
    const dispatch = useDispatch();
    const [hoverIndex, setHoverIndex] = useState(null);
    const [artistData, setArtistData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const currentIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const currentSongId = reduxListSong[currentIndex]?.song.id;
    const isPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);

    // ================== FETCH ARTIST DATA ==================
    useEffect(() => {
        const fetchArtistData = async () => {
            if (!artistId) return;

            setIsLoading(true);
            try {
                const data = await getArtistWithSongsAndAlbums(artistId);
                setArtistData(data);
                dispatch(setReduxIsRight(false));
            } catch (err) {
                console.error('Error fetching artist data:', err);
                setArtistData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtistData();
    }, [artistId, dispatch]);

    // ================== HANDLERS ==================
    const handleMouseEnter = (index) => {
        setHoverIndex(index);
    };

    const handleMouseLeave = () => {
        setHoverIndex(null);
    };

    const handlePlaySong = (e, songId) => {
        if (!artistData) return;
        onPlayListSong(e, songId, artistData);
    };

    const renderPlayButton = (song, index) => {
        if (song.id === currentSongId && isPlaying) {
            return (
                <img
                    src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif"
                    alt="Playing"
                    className="artistEqualizerGif"
                />
            );
        }
        if (hoverIndex === index) {
            return <FontAwesomeIcon icon={faPlay} />;
        }
        return index + 1;
    };

    // ================== RENDER ==================
    if (isLoading) {
        return <div className="artistContainer">Loading...</div>;
    }

    if (!artistData) {
        return <div className="artistContainer">Artist not found</div>;
    }

    const { album, artist, songs } = artistData;

    return (
        <div className="artistContainer">
            <div className="artistHeader">
                <div className="artistPicture">
                    <img src={album.coverUrl} alt={album.name} />
                </div>
                <div className="artistInfo">
                    <div className="artistTitle">{album.name}</div>
                    <div className="artistDetails">
                        <img className="artistUserAvatar" src={artist.urlAvatar} alt={artist?.username || 'Artist'} />
                        <div className="artistUserName">{artist?.username || 'No name'}</div>
                        <div className="artistSongCount">{songs.length} song(s)</div>
                        <div className="artistTotalTime">{calculateTotalTime(songs)}</div>
                    </div>
                </div>
            </div>

            <div className="artistBody">
                <div className="artistControls"></div>

                <div className="artistSongList">
                    {songs.map((song, index) => (
                        <div
                            key={song.id || index}
                            className={`artistSongItem ${song.id === currentSongId ? 'active' : ''}`}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}>
                            <div className="artistSongRow">
                                <div className="artistSongIndex">
                                    <button className="artistPlayButton" onClick={(e) => handlePlaySong(e, song.id)}>
                                        {renderPlayButton(song, index)}
                                    </button>
                                </div>
                                <div className="artistSongImage">
                                    <img src={song.imageUrl} alt={song.title} />
                                </div>
                                <div className="artistSongInfo">
                                    <div className="artistSongTitle">{song.title}</div>
                                    <div className="artistSongArtist">
                                        {song.artistName || artist?.username || 'Unknown Artist'}
                                    </div>
                                </div>
                            </div>
                            <div className="artistSongDuration">{formatDuration(song.duration)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArtistSongList;
