import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Slider from '~/components/slider/Slider';
import {
    getListeningHistory,
    getSongAndArtistBySongId,
    getTrendingAlbums,
    getTrendingArtists,
    getTrendingSongs,
    getRecommendSongs,
} from '~/apis/songApi';
import { setReduxIsPlaying, setReduxIsRight, setReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import { addNextSong, addSongList, clearSongs, setReduxCurrentSongIndex } from '~/redux/reducer/songSlice';
import NoAvatar from '~/assets/image/noAvatar.png';
import AlbumView from '~/components/listSong/AlbumView';
import ArtistSongList from '~/components/listSong/ArtistSongList';
import Playlist from '~/components/listSong/Playlist';
import SearchView from '~/components/listSong/SearchView';
import './CenterHomePage.sass';

const CenterHomePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const reduxIsRight = useSelector((state) => state.songNotWhite.reduxIsRight);
    const isLogin = useSelector((state) => state.auth.reduxIsLogin);
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);

    const [trendingSongs, setTrendingSongs] = useState([]);
    const [topAlbums, setTopAlbums] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [listeningHistory, setListeningHistory] = useState([]);
    const [recommendSongs, setRecommendSongs] = useState([]);
    const [pageType, setPageType] = useState(null);
    const [pageId, setPageId] = useState(null);

    // ================== FETCH DATA TRENDING ==================
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [songs, albums, artists, recommend] = await Promise.all([
                    getTrendingSongs(),
                    getTrendingAlbums(),
                    getTrendingArtists(),
                    getRecommendSongs(),
                ]);
                setTrendingSongs(songs);
                setTopAlbums(albums);
                setTopArtists(artists);
                setRecommendSongs(recommend);
            } catch (err) {
                console.error('Failed to fetch trending data:', err);
            }
        };
        fetchData();
    }, []);

    // ================== FETCH HISTORY ==================
    const updateHistory = useCallback(async () => {
        if (!isLogin) return;
        try {
            const history = await getListeningHistory();
            setListeningHistory([...history]);
        } catch (err) {
            console.error('Error fetching history:', err);
        }
    }, [isLogin]);

    useEffect(() => {
        if (isLogin) {
            updateHistory();
        }
    }, [reduxCurrentSongIndex, isLogin, updateHistory]);

    // ================== PLAY SINGLE SONG ==================
    const listenSong = useCallback(
        async (e, songId) => {
            e.stopPropagation();
            dispatch(clearSongs());
            try {
                const res = await getSongAndArtistBySongId(songId);
                dispatch(addNextSong(res));
                dispatch(setReduxCurrentSongIndex(0));
                dispatch(setReduxIsRight(true));
                dispatch(setReduxIsPlaying(true));

                // Cập nhật lịch sử nghe
                await updateHistory();

                // 🔁 Cập nhật lại danh sách đề xuất sau khi nghe bài hát
                const newRecommend = await getRecommendSongs();
                setRecommendSongs(newRecommend);
            } catch (err) {
                console.error('Error playing song:', err);
            }
        },
        [dispatch, updateHistory]
    );

    // ================== MERGE ARTIST TO SONG ==================
    const mergeArtistToSong = useCallback((data) => {
        return data.songs.map((song) => ({
            song: {
                ...song,
            },
            artist: data.artist,
        }));
    }, []);

    // ================== PLAY LIST SONG (COMMON) ==================
    const playListSong = useCallback(
        async (e, songId, dataSource) => {
            e.stopPropagation();
            if (!dataSource) return;

            const currentIndex = dataSource.songs.findIndex((song) => song.id === songId);
            if (currentIndex === -1) return;

            dispatch(clearSongs());
            dispatch(
                addSongList({
                    songs: mergeArtistToSong(dataSource),
                    currentIndex,
                })
            );
            dispatch(setReduxIsRight(true));
            dispatch(setReduxIsPlaying(true));

            await updateHistory();
        },
        [dispatch, mergeArtistToSong, updateHistory]
    );

    // ================== PAGE TYPE DETECT ==================
    useEffect(() => {
        const path = location.pathname;
        const parts = path.split('/').filter(Boolean);
        if (parts.length === 2) {
            const [page, id] = parts;
            setPageType(page);
            setPageId(id);
        } else {
            setPageType(null);
            setPageId(null);
        }
    }, [location.pathname]);

    // ================== HANDLE LIBRARY SONG ==================
    const handleLibrarySong = (e, payload) => {
        e.preventDefault();
        dispatch(setReduxLibrarySong(payload));
    };

    // ================== RENDER ==================
    const renderContent = () => {
        switch (pageType) {
            case 'album':
                return pageId ? (
                    <AlbumView
                        albumId={Number(pageId)}
                        onPlayListSong={playListSong}
                        handleLibrarySong={handleLibrarySong}
                    />
                ) : null;
            case 'artist':
                return pageId ? (
                    <ArtistSongList
                        artistId={Number(pageId)}
                        onPlayListSong={playListSong}
                        handleLibrarySong={handleLibrarySong}
                    />
                ) : null;
            case 'playlist':
                return pageId ? (
                    <Playlist
                        playlistId={Number(pageId)}
                        onPlayListSong={playListSong}
                        handleLibrarySong={handleLibrarySong}
                    />
                ) : null;
            case 'search':
                return pageId ? (
                    <SearchView
                        onPlayListSong={playListSong}
                        handleLibrarySong={handleLibrarySong}
                        listenSong={listenSong}
                    />
                ) : null;
            default:
                return (
                    <>
                        {isLogin && listeningHistory.length > 0 && (
                            <div className="listeningHistoryContainer">
                                <div className="listeningHistoryTitle">Listening History</div>
                                <div className="listeningHistoryList">
                                    {listeningHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`historyItem ${reduxIsRight ? 'rightActive' : ''}`}
                                            onClick={(e) => listenSong(e, item.id)}
                                            onContextMenu={(e) => {
                                                handleLibrarySong(e, [
                                                    { type: 'playlist', id: item.id },
                                                    {
                                                        type: 'artist',
                                                        id: item.artistId,
                                                    },
                                                ]);
                                            }}>
                                            <div className="historyImage">
                                                <img src={item.imageUrl || NoAvatar} alt={item.title} />
                                            </div>
                                            <div className="nameHistorySong">{item.title}</div>
                                            <div className="playHistoryButton">
                                                <FontAwesomeIcon icon={faPlay} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="trendingContainer">
                            <div className="trendingTitle">Trending Songs</div>
                            <Slider>
                                {trendingSongs?.map((song) => (
                                    <div
                                        key={song.id}
                                        className="trendingSongItem"
                                        onContextMenu={(e) => {
                                            handleLibrarySong(e, [
                                                { type: 'playlist', id: song.id },
                                                {
                                                    type: 'artist',
                                                    id: song.artistId,
                                                },
                                            ]);
                                        }}>
                                        <div className="trendingSongImage">
                                            <img src={song.imageUrl || NoAvatar} alt={song.title} />
                                        </div>
                                        <div className="trendingSongTitle">{song.title}</div>
                                        <p className="trendingSongArtist">{song.artistName || 'No name'}</p>
                                        <div className="trendingPlayButton" onClick={(e) => listenSong(e, song.id)}>
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
                                    <div
                                        key={album.id}
                                        className="albumItem"
                                        onClick={() => navigate(`/album/${album.id}`)}
                                        onContextMenu={(e) => {
                                            handleLibrarySong(e, [
                                                { type: 'album', id: album.id },
                                                {
                                                    type: 'artist',
                                                    id: album.artistId,
                                                },
                                            ]);
                                        }}>
                                        <div className="albumImage">
                                            <img src={album.coverUrl} alt={album.name} />
                                        </div>
                                        <div className="albumName">{album.name}</div>
                                        <div className="albumArtist">{album.artistName || 'No name'}</div>
                                    </div>
                                ))}
                            </Slider>
                        </div>

                        <div className="topArtistController">
                            <div className="topArtsHeader">
                                <div className="topArtistTitle">Top Artists</div>
                                <div className="viewAllArtists">View All</div>
                            </div>
                            <Slider>
                                {topArtists.map((artist) => (
                                    <div
                                        key={artist.id}
                                        className="artistItem"
                                        onClick={() => navigate(`/artist/${artist.id}`)}
                                        onContextMenu={(e) => {
                                            handleLibrarySong(e, [
                                                {
                                                    type: 'artist',
                                                    id: artist.id,
                                                },
                                            ]);
                                        }}>
                                        <div className="artistImage">
                                            <img src={artist.urlAvatar} alt={artist.username} />
                                        </div>
                                        <div className="artistName">{artist.username || 'No name'}</div>
                                    </div>
                                ))}
                            </Slider>
                        </div>

                        <div className="recommendContainer">
                            <div className="recommendTitle">You might like</div>
                            <Slider>
                                {recommendSongs?.map((song) => (
                                    <div
                                        key={song.id}
                                        className="recommendSongItem"
                                        onContextMenu={(e) => {
                                            handleLibrarySong(e, [
                                                { type: 'playlist', id: song.id },
                                                {
                                                    type: 'artist',
                                                    id: song.artistId,
                                                },
                                            ]);
                                        }}>
                                        <div className="recommendSongImage">
                                            <img src={song.imageUrl || NoAvatar} alt={song.title} />
                                        </div>
                                        <div className="recommendSongTitle">{song.title}</div>
                                        <p className="recommendSongArtist">{song.artistName || 'No name'}</p>
                                        <div className="recommendPlayButton" onClick={(e) => listenSong(e, song.id)}>
                                            <FontAwesomeIcon icon={faPlay} />
                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </>
                );
        }
    };

    return <div className={`centerHomePage ${reduxIsRight ? 'rightActive' : ''}`}>{renderContent()}</div>;
};

export default CenterHomePage;
