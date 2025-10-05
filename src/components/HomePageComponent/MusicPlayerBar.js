import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { IconLeftSong, IconRightSong, IconPlay, IconPause } from "~/assets/image/icons";
import { setReduxIsPlaying, setReduxCurrentTime } from "~/redux/reducer/songNotWhitelistSlice";
import { setReduxCurrentSongIndex } from "~/redux/reducer/songSlice";
import { listenSong, calDurationSong } from "~/apis/songApi";
import { isVideo } from "~/util/fileUtil";
import NoAvatar from '~/assets/image/noAvatar.png';
import "./MusicPlayerBar.sass";

const MusicPlayerBar = () => {
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.1);

    const mediaRef = useRef(null);
    const isDraggingRef = useRef(false);
    const prevSongIdRef = useRef(null); // FIX: Track previous song to avoid duplicate calls

    const reduxListSong = useSelector((state) => state.song.reduxListSong);
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxIsPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);
    const dispatch = useDispatch();

    const [currentSong, setCurrentSongState] = useState(null);

    // FIX: Cập nhật thời gian chạy với throttle
    const handleTimeUpdate = (e) => {
        if (isDraggingRef.current) return;

        const currentTime = e.target.currentTime;
        const duration = e.target.duration;

        if (duration > 0) {
            const newProgress = (currentTime / duration) * 100;
            setProgress(newProgress);

            // FIX: Chỉ dispatch mỗi giây để tránh re-render liên tục
            if (Math.floor(currentTime) !== Math.floor(prevSongIdRef.current?.lastTime || 0)) {
                dispatch(setReduxCurrentTime(currentTime));
                if (prevSongIdRef.current) {
                    prevSongIdRef.current.lastTime = currentTime;
                }
            }
        }
    };

    const handleTogglePlay = () => {
        if (!mediaRef.current || !mediaRef.current.src) return;
        dispatch(setReduxIsPlaying(!reduxIsPlaying));
    };

    // FIX: Cập nhật bài hát hiện tại và call listenSong API
    useEffect(() => {
        if (reduxListSong.length > 0 && reduxCurrentSongIndex >= 0 && reduxCurrentSongIndex < reduxListSong.length) {
            const newSong = reduxListSong[reduxCurrentSongIndex];
            setCurrentSongState(newSong);

            // FIX: Chỉ call listenSong khi song thực sự thay đổi
            if (newSong?.song?.id && newSong.song.id !== prevSongIdRef.current?.songId) {
                listenSong(newSong.song.id).catch((err) => {
                    console.error("Error listening song:", err);
                });
                prevSongIdRef.current = { songId: newSong.song.id, lastTime: 0 };
            }
        } else {
            setCurrentSongState(null);
            prevSongIdRef.current = null;
        }
    }, [reduxListSong, reduxCurrentSongIndex]);

    // FIX: Đồng bộ play/pause - tách riêng để tránh race condition
    useEffect(() => {
        if (!mediaRef.current || !mediaRef.current.src) return;

        const playPromise = reduxIsPlaying ? mediaRef.current.play() : Promise.resolve(mediaRef.current.pause());

        playPromise?.catch((err) => {
            // Handle play interruption
            if (err.name === 'AbortError') {
                console.log('Playback aborted');
            } else {
                console.error('Play/pause error:', err);
            }
        });
    }, [reduxIsPlaying]);

    // FIX: Auto-play khi song mới load
    useEffect(() => {
        if (mediaRef.current && currentSong?.song?.mediaUrl) {
            mediaRef.current.load();
            setProgress(0);

            if (reduxIsPlaying) {
                // Delay play to ensure media is loaded
                const timer = setTimeout(() => {
                    mediaRef.current?.play().catch(err => {
                        console.error('Auto-play error:', err);
                    });
                }, 100);
                return () => clearTimeout(timer);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSong?.song?.mediaUrl]);

    // Cập nhật âm lượng
    useEffect(() => {
        if (mediaRef.current) {
            mediaRef.current.volume = volume;
        }
    }, [volume]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    // Seek handlers
    const handleSeekStart = () => {
        isDraggingRef.current = true;
    };

    const handleSeek = (e) => {
        const newProgress = parseFloat(e.target.value);
        setProgress(newProgress);
    };

    const handleSeekEnd = (e) => {
        const newProgress = parseFloat(e.target.value);
        if (mediaRef.current && mediaRef.current.duration) {
            const newTime = (newProgress / 100) * mediaRef.current.duration;
            mediaRef.current.currentTime = newTime;
            dispatch(setReduxCurrentTime(newTime));
        }
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 100);
    };

    // Track listening duration when song changes or user skips
    const trackListeningDuration = useCallback((songId) => {
        if (!songId) return;

        calDurationSong(songId).catch(err => {
            console.error("Error tracking duration:", err);
        });

    }, []);

    // FIX: Track duration khi switch song
    useEffect(() => {
        // Return cleanup function to track duration when unmounting/changing song
        return () => {
            if (currentSong?.song?.id) {
                trackListeningDuration(currentSong.song.id);
            }
        };
    }, [currentSong?.song?.id, trackListeningDuration]);

    // FIX: Track duration khi user thoát trang
    useEffect(() => {
        const currentSongId = currentSong?.song?.id;

        const handleBeforeUnload = () => {
            if (currentSongId) {
                // Sử dụng navigator.sendBeacon để gửi request ngay cả khi trang đang đóng
                const url = `/api/songs/${currentSongId}/duration`; // Adjust API endpoint
                const data = JSON.stringify({ songId: currentSongId });

                if (navigator.sendBeacon) {
                    navigator.sendBeacon(url, data);
                } else {
                    // Fallback cho browser cũ
                    calDurationSong(currentSongId).catch(err => {
                        console.error("Error tracking duration on unload:", err);
                    });
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSong?.song?.id]);

    const handlePrev = () => {
        // Track current song trước khi chuyển
        if (currentSong?.song?.id) {
            trackListeningDuration(currentSong.song.id);
        }
        dispatch(setReduxCurrentSongIndex("prev"));
    };

    const handleNext = () => {
        // Track current song trước khi chuyển
        if (currentSong?.song?.id) {
            trackListeningDuration(currentSong.song.id);
        }
        dispatch(setReduxCurrentSongIndex("next"));
    };

    // Track khi bài hát kết thúc tự nhiên (onEnded đã gọi handleNext, sẽ track ở đó)

    // FIX: Format time helper
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="musicPlayerBar">
            <div className="left">
                <div className="currentSongImage">
                    <img
                        src={currentSong?.song?.imageUrl || NoAvatar}
                        alt={currentSong?.song?.title || "No song"}
                    />
                </div>
                <div className="currentSongInfo">
                    <div className="title">{currentSong?.song?.title || "No song selected"}</div>
                    <div className="artist">{currentSong?.song?.artist || currentSong?.artist?.name || "No artist"}</div>
                </div>
            </div>

            <div className="center">
                <div className="listenMusic">
                    {currentSong?.song?.mediaUrl ? (
                        isVideo(currentSong.song.mediaUrl) ? (
                            <video
                                ref={mediaRef}
                                src={currentSong.song.mediaUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleNext}
                                controls={false}
                                preload="metadata"
                            />
                        ) : (
                            <audio
                                ref={mediaRef}
                                src={currentSong.song.mediaUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleNext}
                                controls={false}
                                preload="metadata"
                            />
                        )
                    ) : null}
                </div>

                <div className="controls">
                    <div className="topControl">
                        <button className="iconControll" onClick={handlePrev} disabled={!currentSong}>
                            <IconLeftSong />
                        </button>
                        <button onClick={handleTogglePlay} disabled={!currentSong}>
                            <div className="iconControll playPause">
                                {reduxIsPlaying ? <IconPause /> : <IconPlay />}
                            </div>
                        </button>
                        <button className="iconControll" onClick={handleNext} disabled={!currentSong}>
                            <IconRightSong />
                        </button>
                    </div>

                    <div className="bottomControll">
                        <div className="currenTimeSong">
                            {formatTime(mediaRef.current?.currentTime)}
                        </div>
                        <div className="progress">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="0.1"
                                value={progress}
                                style={{ "--progress": `${progress}%` }}
                                onMouseDown={handleSeekStart}
                                onTouchStart={handleSeekStart}
                                onChange={handleSeek}
                                onMouseUp={handleSeekEnd}
                                onTouchEnd={handleSeekEnd}
                                disabled={!currentSong}
                            />
                        </div>
                        <div className="duration">
                            {formatTime(mediaRef.current?.duration)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="right">
                <div className="volume">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        style={{ "--progress": `${volume * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MusicPlayerBar;