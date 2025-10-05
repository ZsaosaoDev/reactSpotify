import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';

import Slider from '~/components/slider/Slider';
import { getTrendingSongs, getSongAndArtistBySongId, getTopAlbums, getAlbumWithSongs, calDurationSong } from "~/apis/songApi"
import { setReduxIsRight, setReduxIsPlaying } from "~/redux/reducer/songNotWhitelistSlice"
import { addNextSong, setReduxCurrentSongIndex, clearSongs, addSongList } from "~/redux/reducer/songSlice";
import "./CenterHomePage.sass";

const CenterHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const reduxIsRight = useSelector(state => state.songNotWhite.reduxIsRight);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [trendingSongs, setTrendingSongs] = useState([]);
    const [topAlbums, setTopAlbums] = useState([]);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const songs = await getTrendingSongs();
                setTrendingSongs(songs);
                const albums = await getTopAlbums();
                setTopAlbums(albums);
            } catch (err) {
                console.error("Failed to fetch songs:", err);
            }
        };
        fetchSongs();
    }, []);

    // FIX: Loại bỏ logic calDuration sai
    const listenMusic = async (e, songId) => {
        e.stopPropagation();
        try {
            const res = await getSongAndArtistBySongId(songId);
            dispatch(addNextSong(res));
            dispatch(setReduxCurrentSongIndex("next"));
            dispatch(setReduxIsRight(true));
            dispatch(setReduxIsPlaying(true));
        } catch (err) {
            console.error("Error playing song:", err);
        }
    };

    const mergeArtistToSong = (data) => {
        return data.songs.map(song => ({
            song: {
                ...song,
                artist: data.artist.username // FIX: Đảm bảo có artist name
            },
            artist: data.artist
        }));
    }

    // FIX: Sửa logic listenAlbum
    const listenAlbum = async (e, songId) => {
        e.stopPropagation();

        if (!abumData) return;

        const currentIndex = abumData.songs.findIndex(song => song.id === songId);

        if (currentIndex === -1) {
            console.error("Song not found in album");
            return;
        }

        // Clear old songs và add album songs
        dispatch(clearSongs());
        dispatch(addSongList({
            songs: mergeArtistToSong(abumData),
            currentIndex: currentIndex
        }));

        dispatch(setReduxIsRight(true));
        dispatch(setReduxIsPlaying(true));
    };

    const handleAlbum = (albumId) => {
        navigate(`/album/${albumId}`);
    };

    const [pageType, setPageType] = useState(null);
    const [pageId, setPageId] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        const parts = path.split("/").filter(Boolean);

        if (parts.length === 2) {
            const [page, id] = parts;
            setPageType(page);
            setPageId(id);
        } else {
            setPageType(null);
            setPageId(null);
        }
    }, [location.pathname]);

    const [abumData, setAlbumData] = useState(null);

    useEffect(() => {
        if (pageType === "album" && pageId) {
            console.log("Page Type:", pageType, "Page ID:", pageId);
            getAlbumWithSongs(pageId)
                .then((data) => {
                    setAlbumData(data);
                    dispatch(setReduxIsRight(false));
                })
                .catch((err) => {
                    console.error("Error fetching album data:", err);
                });
        } else {
            setAlbumData(null); // FIX: Reset khi không phải album page
        }
    }, [pageType, pageId, dispatch]);

    return (
        <div className={`centerHomePage ${reduxIsRight ? "rightActive" : ""}`}>
            {pageType === "album" && abumData ? (
                <div className="albumContainer">
                    <div className="albumHeader">
                        <div className="albumPicture">
                            <img src={abumData.album.coverUrl} alt={abumData.album.name} />
                        </div>
                        <div className="albumInfo">
                            <div className="albumTitle">{abumData.album.name}</div>
                            <div className="albumDetails">
                                <img className="albumUserAvatar" src={abumData.artist.urlAvatar} alt="" />
                                <div className="albumUserName">{abumData.artist?.username || "No name"}</div>
                                <div className="albumSongCount">{abumData.songs.length} song(s)</div>
                                <div className="albumTotalTime">
                                    {(() => {
                                        const totalSeconds = abumData.songs.reduce((sum, song) => sum + (song.duration || 0), 0);
                                        const minutes = Math.floor(totalSeconds / 60);
                                        const seconds = totalSeconds % 60;
                                        return `${minutes}min ${seconds.toString().padStart(2, "0")}sec`;
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="albumBody">
                        <div className="albumControls"></div>
                        <div className="songList">
                            {abumData.songs.map((song, index) => (
                                <div key={song.id || index} className="songItem"
                                    onMouseEnter={() => setHoverIndex(index)}
                                    onMouseLeave={() => setHoverIndex(null)}>
                                    <div className="songRow">
                                        <div className="songIndex">
                                            <button className="playButton" onClick={(e) => listenAlbum(e, song.id)}>
                                                {hoverIndex === index ? (<FontAwesomeIcon icon={faPlay} />) : (index + 1)}
                                            </button>
                                        </div>
                                        <div className="songImage">
                                            <img src={song.imageUrl} alt={song.title} />
                                        </div>
                                        <div className="songInfo">
                                            <div className="songTitle">{song.title}</div>
                                            <div className="songArtist">{song.artistName || abumData.artist?.username || "Unknown Artist"}</div>
                                        </div>
                                    </div>
                                    <div className="songDuration">
                                        {(() => {
                                            const minutes = Math.floor(song.duration / 60);
                                            const seconds = song.duration % 60;
                                            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="trendingContainer">
                        <div className="trendingTitle">Trending Songs</div>
                        <Slider>
                            {trendingSongs?.map((song) => (
                                <div key={song.id} className="trendingSongItem">
                                    <div className="trendingSongImage">
                                        <img src={song.imageUrl} alt={song.title} />
                                    </div>
                                    <div className="trendingSongTitle">{song.title}</div>
                                    <p className="trendingSongArtist">{song.artistName || "No name"}</p>
                                    <div className="trendingPlayButton" onClick={(e) => listenMusic(e, song.id)}>
                                        <FontAwesomeIcon icon={faPlay} />
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>

                    <div className="topAlbumsContainer">
                        <div className="topAlbumsHeader">
                            <div className="topAlbumsTitle">Top Albums</div>
                            <div className="viewAllAlbums">View All</div>
                        </div>
                        <Slider>
                            {topAlbums?.map((album) => (
                                <div key={album.id} className="albumItem" onClick={() => handleAlbum(album.id)}>
                                    <div className="albumImage">
                                        <img src={album.coverUrl} alt={album.name} />
                                    </div>
                                    <div className="albumName">{album.name}</div>
                                    <div className="albumArtist">{album.artistName || "No name"}</div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </>
            )}
        </div>
    );
};

export default CenterHomePage;