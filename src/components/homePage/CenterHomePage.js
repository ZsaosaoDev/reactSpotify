import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Slider from '~/components/slider/Slider';
import { getAlbumWithSongs, getArtistWithSongs, getListeningHistory, getSongAndArtistBySongId, getTrendingAlbums, getTrendingArtists, getTrendingSongs } from '~/apis/songApi';
import { setReduxIsPlaying, setReduxIsRight, setReduxLibrarySong } from '~/redux/reducer/songNotWhitelistSlice';
import { addNextSong, addSongList, clearSongs, setReduxCurrentSongIndex } from '~/redux/reducer/songSlice';
import NoAvatar from '~/assets/image/noAvatar.png';
import AlbumView from '~/components/listSong/AlbumView';
import ArtistSongList from '~/components/listSong/ArtistSongList';
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
    const [pageType, setPageType] = useState(null);
    const [pageId, setPageId] = useState(null);
    const [albumData, setAlbumData] = useState(null);
    const [artistData, setArtistData] = useState(null);

    // ================== FETCH DATA TRENDING ==================
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [songs, albums, artists] = await Promise.all([getTrendingSongs(), getTrendingAlbums(), getTrendingArtists()]);
                setTrendingSongs(songs);
                setTopAlbums(albums);
                setTopArtists(artists);
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

                await updateHistory();
            } catch (err) {
                console.error('Error playing song:', err);
            }
        },
        [dispatch, updateHistory]
    );

    // ================== PLAY ALBUM SONG ==================
    const mergeArtistToSong = useCallback((data) => {
        return data.songs.map((song) => ({
            song: {
                ...song,
                artist: data.artist.username,
            },
            artist: data.artist,
        }));
    }, []);

    const listenListSong = useCallback(
        async (e, songId) => {
            e.stopPropagation();
            if (!albumData) return;

            const currentIndex = albumData.songs.findIndex((song) => song.id === songId);
            if (currentIndex === -1) return;

            dispatch(clearSongs());
            dispatch(
                addSongList({
                    songs: mergeArtistToSong(albumData),
                    currentIndex,
                })
            );
            dispatch(setReduxIsRight(true));
            dispatch(setReduxIsPlaying(true));

            await updateHistory();
        },
        [albumData, dispatch, mergeArtistToSong, updateHistory]
    );

    // ================== PLAY ARTIST SONG ==================
    const listenArtist = useCallback(
        async (e, songId) => {
            e.stopPropagation();
            if (!artistData) return;

            const currentIndex = artistData.songs.findIndex((song) => song.id === songId);
            if (currentIndex === -1) return;

            dispatch(clearSongs());
            dispatch(
                addSongList({
                    songs: mergeArtistToSong(artistData),
                    currentIndex,
                })
            );
            dispatch(setReduxIsRight(true));
            dispatch(setReduxIsPlaying(true));

            await updateHistory();
        },
        [artistData, dispatch, mergeArtistToSong, updateHistory]
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

    // ================== FETCH PAGE DATA ==================
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (pageType === 'album' && pageId) {
                    const data = await getAlbumWithSongs(pageId);
                    setAlbumData(data);
                } else if (pageType === 'artist' && pageId) {
                    const data = await getArtistWithSongs(pageId);
                    setArtistData(data);
                } else {
                    setAlbumData(null);
                    setArtistData(null);
                }
                dispatch(setReduxIsRight(false));
            } catch (err) {
                console.error(`Error fetching ${pageType} data:`, err);
            }
        };
        fetchData();
    }, [pageType, pageId, dispatch]);

    // ================== HANDLE ALBUM CLICK ==================
    const handleAlbum = useCallback(
        (albumId) => {
            navigate(`/album/${albumId}`);
        },
        [navigate]
    );

    const handleLibrarySong = (e, payload) => {
        e.preventDefault();
        dispatch(setReduxLibrarySong(payload));
    };

    // ================== RENDER ==================
    const renderContent = () => {
        switch (pageType) {
            case 'album':
                return albumData ? <AlbumView albumData={albumData} onPlayListSong={listenListSong} /> : null;
            case 'artist':
                return artistData ? <ArtistSongList albumData={artistData} onPlayListSong={listenArtist} /> : null;
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
                                            >
                                            <div className="historyImage">
                                                <img src={item.imageUrl} alt={item.title} />
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
                                    <div key={album.id} className="albumItem" onClick={() => handleAlbum(album.id)}>
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
                                    <div key={artist.id} className="artistItem" onClick={() => navigate(`/artist/${artist.id}`)}>
                                        <div className="artistImage">
                                            <img src={artist.urlAvatar} alt={artist.username} />
                                        </div>
                                        <div className="artistName">{artist.username || 'No name'}</div>
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
