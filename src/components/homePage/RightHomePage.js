import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import NoAvatar from '~/assets/image/noAvatar.png';
import { isVideo } from '~/util/fileUtil';
import { IconRightArrowBox } from '~/assets/image/icons';
import { setReduxIsRight } from '~/redux/reducer/songNotWhitelistSlice';
import './RightHomePage.sass';

const RightHomePage = () => {
    const dispatch = useDispatch();
    const reduxIsRight = useSelector((state) => state.songNotWhite.reduxIsRight);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxIsPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);
    const reduxCurrentTime = useSelector((state) => state.songNotWhite.reduxCurrentTime);

    const [currentSong, setCurrentSong] = useState(null);
    const [nextSong, setNextSong] = useState(null);

    const mediaRef = useRef(null);
    const lastSyncTimeRef = useRef(0);

    // Update current song
    useEffect(() => {
        if (reduxListSong.length > 0 && reduxCurrentSongIndex >= 0 && reduxCurrentSongIndex < reduxListSong.length) {
            setCurrentSong(reduxListSong[reduxCurrentSongIndex]);
        } else setCurrentSong(null);
    }, [reduxListSong, reduxCurrentSongIndex]);

    // Update next song
    useEffect(() => {
        if (reduxListSong.length > 0 && reduxCurrentSongIndex + 1 < reduxListSong.length) {
            setNextSong(reduxListSong[reduxCurrentSongIndex + 1]);
        } else setNextSong(null);
    }, [reduxListSong, reduxCurrentSongIndex]);

    // Sync currentTime
    useEffect(() => {
        if (mediaRef.current?.src && !isNaN(reduxCurrentTime)) {
            const diff = Math.abs(mediaRef.current.currentTime - reduxCurrentTime);
            if (diff > 1 && Math.abs(lastSyncTimeRef.current - reduxCurrentTime) > 1) {
                mediaRef.current.currentTime = reduxCurrentTime;
                lastSyncTimeRef.current = reduxCurrentTime;
            }
        }
    }, [reduxCurrentTime]);

    // Load new media
    useEffect(() => {
        if (mediaRef.current && currentSong?.song?.mediaUrl) {
            mediaRef.current.load();
            lastSyncTimeRef.current = 0;
        }
    }, [currentSong?.song?.mediaUrl]);

    // Sync play/pause
    useEffect(() => {
        if (mediaRef.current?.src) {
            if (reduxIsPlaying) {
                mediaRef.current.play().catch((err) => console.error('Right panel play error:', err));
            } else mediaRef.current.pause();
        }
    }, [reduxIsPlaying, currentSong?.song?.mediaUrl]);

    const handleCloseRightPanel = () => dispatch(setReduxIsRight(false));

    return (
        <div className={`rightHomePage ${reduxIsRight ? 'rightActive' : ''}`}>
            {!currentSong ? (
                <div className="noSongPlaying">Chưa có bài đang nghe</div>
            ) : (
                <div className="currentSongContainer">
                    <div className="mediaContainer">
                        <div className="headerSong">
                            <button onClick={handleCloseRightPanel} className="closeButton">
                                <IconRightArrowBox />
                            </button>
                            <div className="imageTitle">{currentSong.artist?.name || currentSong.song?.artist || 'Chưa thuộc album'}</div>
                        </div>
                        {currentSong.song?.mediaUrl && isVideo(currentSong.song.mediaUrl) ? (
                            <video ref={mediaRef} src={currentSong.song.mediaUrl} controls={false} muted playsInline />
                        ) : (
                            <>
                                <img src={currentSong.song.imageUrl || NoAvatar} alt={currentSong.song.title} className="songImage" />
                                <audio ref={mediaRef} src={currentSong.song.mediaUrl} controls={false} muted preload="metadata" />
                            </>
                        )}
                    </div>

                    <div className={`songInfoContainer ${isVideo(currentSong?.song?.mediaUrl) ? 'video' : 'audio'}`}>
                        <div className="songTitleContainer">{currentSong?.song?.title || 'Chưa có tiêu đề'}</div>
                        <div className="artistContainer">
                            <img className="artistAvatar" src={currentSong.artist?.urlAvatar || NoAvatar} alt="artist-avatar" />
                            <div className="artistName">{currentSong?.artist?.name || currentSong?.song?.artist || 'Unknown Artist'}</div>
                            <div className="artistActions">
                                <div className="monthlyListeners">2,016,341 Monthly Listeners</div>
                                <div className="followButton">Follow</div>
                            </div>
                        </div>
                    </div>

                    <div className="nextSongContainer">
                        <div className="nextSongHeader">
                            <div className="nextSongLabel">Next in queue</div>
                            <div className="openQueueButton">Open Queue</div>
                        </div>
                        {nextSong ? (
                            <div className="nextSongContent">
                                <img src={nextSong?.song?.imageUrl || NoAvatar} alt={nextSong?.song?.title || 'Unknown Song'} className="nextSongCover" />
                                <div className="nextSongDetails">
                                    <div className="nextSongTitle">{nextSong?.song?.title || 'Chưa có tiêu đề'}</div>
                                    <div className="nextSongArtist">{nextSong?.artist?.name || nextSong?.song?.artist || 'Unknown Artist'}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="nextSongContent">
                                <div className="noNextSong">No upcoming songs</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RightHomePage;
