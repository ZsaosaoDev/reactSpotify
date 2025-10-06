import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useSelector } from 'react-redux';

import { formatDuration, calculateTotalTime } from "~/util/timeUtils";
import "./ArtistSongList.sass";

const ArtistSongList = ({ albumData, onPlayListSong }) => {
    const [hoverIndex, setHoverIndex] = useState(null);

    const currentIndex = useSelector(state => state.song.reduxCurrentSongIndex);
    const isPlaying = useSelector(state => state.songNotWhite.reduxIsPlaying);

    return (
        <div className="artistContainer">
            <div className="artistHeader">
                <div className="artistPicture">
                    <img src={albumData.album.coverUrl} alt={albumData.album.name} />
                </div>
                <div className="artistInfo">
                    <div className="artistTitle">{albumData.album.name}</div>
                    <div className="artistDetails">
                        <img
                            className="artistUserAvatar"
                            src={albumData.artist.urlAvatar}
                            alt={albumData.artist?.username || "Artist"}
                        />
                        <div className="artistUserName">
                            {albumData.artist?.username || "No name"}
                        </div>
                        <div className="artistSongCount">
                            {albumData.songs.length} song(s)
                        </div>
                        <div className="artistTotalTime">
                            {calculateTotalTime()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="artistBody">
                <div className="artistControls"></div>
                <div className="artistSongList">
                    {albumData.songs.map((song, index) => (
                        <div
                            key={song.id || index}
                            className={`artistSongItem ${index === currentIndex ? 'active' : ''}`}
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(null)}
                        >
                            <div className="artistSongRow">
                                <div className="artistSongIndex">
                                    <button
                                        className="artistPlayButton"
                                        onClick={(e) => onPlayListSong(e, song.id)}
                                    >

                                        {index === currentIndex && isPlaying ? (
                                            <img
                                                src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif"
                                                alt="Playing"
                                                className="artistEqualizerGif"
                                            />
                                        ) : hoverIndex === index ? (
                                            <FontAwesomeIcon icon={faPlay} />
                                        ) : (
                                            index + 1
                                        )}
                                    </button>
                                </div>
                                <div className="artistSongImage">
                                    <img src={song.imageUrl} alt={song.title} />
                                </div>
                                <div className="artistSongInfo">
                                    <div className="artistSongTitle">{song.title}</div>
                                    <div className="artistSongArtist">
                                        {song.artistName ||
                                            albumData.artist?.username ||
                                            "Unknown Artist"}
                                    </div>
                                </div>
                            </div>
                            <div className="artistSongDuration">
                                {formatDuration(song.duration)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArtistSongList;