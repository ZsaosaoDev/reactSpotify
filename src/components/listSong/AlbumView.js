import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { calculateTotalTime, formatDuration } from '~/util/timeUtils';
import ControlListSong from '~/components/control/ControlListSong';
import './AlbumView.sass';

const AlbumView = ({ albumData, onPlayListSong }) => {
    const [hoverIndex, setHoverIndex] = useState(null);

    const currentIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const currentSongId = reduxListSong[currentIndex]?.song.id;
    const isPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);

    return (
        <div className="albumContainer">
            <div className="albumHeader">
                <div className="albumPicture">
                    <img src={albumData.album.coverUrl} alt={albumData.album.name} />
                </div>
                <div className="albumInfo">
                    <div className="albumTitle">{albumData.album.name}</div>
                    <div className="albumDetails">
                        <img className="albumUserAvatar" src={albumData.artist.urlAvatar} alt={albumData.artist?.username || 'Artist'} />
                        <div className="albumUserName">{albumData.artist?.username || 'No name'}</div>
                        <div className="albumSongCount">{albumData.songs.length} song(s)</div>
                        <div className="albumTotalTime">{calculateTotalTime()}</div>
                    </div>
                </div>
            </div>
            <div className="albumBody">
                <ControlListSong isPlaying={isPlaying} onPlayListSong={onPlayListSong} listSong={albumData.songs} />
                <div className="songList">
                    {albumData.songs.map((song, index) => (
                        <div
                            key={song.id || index}
                            className={`songItem ${song.id === currentSongId ? 'active' : ''}`}
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(null)}>
                            <div className="songRow">
                                <div className="songIndex">
                                    <button className="playButton" onClick={(e) => onPlayListSong(e, song.id)}>
                                        {song.id === currentSongId && isPlaying ? (
                                            <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif" alt="Playing" className="equalizerGif" />
                                        ) : hoverIndex === index ? (
                                            <FontAwesomeIcon icon={faPlay} />
                                        ) : (
                                            index + 1
                                        )}
                                    </button>
                                </div>
                                <div className="songImage">
                                    <img src={song.imageUrl} alt={song.title} />
                                </div>
                                <div className="songInfo">
                                    <div className="songTitle">{song.title}</div>
                                    <div className="songArtist">{song.artistName || albumData.artist?.username || 'Unknown Artist'}</div>
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

export default AlbumView;
