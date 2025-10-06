import { IconClockCircle, IconList, IconMoreCircle, IconPause, IconPlay, IconPlusCircle } from '~/assets/image/icons';
import { useDispatch, useSelector } from 'react-redux';
import { setReduxIsPlaying, setReduxIsRight } from '~/redux/reducer/songNotWhitelistSlice';
import './ControlListSong.sass';

const ControlListSong = ({ onPlayListSong, listSong }) => {
    const dispatch = useDispatch();
    const reduxCurrentSongIndex = useSelector((state) => state.song.reduxCurrentSongIndex);
    const reduxListSong = useSelector((state) => state.song.reduxListSong);

    const anySongMatchedCurrenSongIndex = () => listSong.some((song) => song.id === reduxListSong[reduxCurrentSongIndex]?.song.id);

    const isPlaying = useSelector((state) => state.songNotWhite.reduxIsPlaying);

    const handleTogglePlay = (e) => {
        if (listSong && listSong.length > 0) {
            if (isPlaying) {
                dispatch(setReduxIsPlaying(false));
            } else {
                if (reduxCurrentSongIndex === null || reduxCurrentSongIndex === -1) {
                    onPlayListSong(e, listSong[0].id);
                } else {
                    onPlayListSong(e, reduxCurrentSongIndex);
                }

                dispatch(setReduxIsPlaying(true));
                dispatch(setReduxIsRight(true));
            }
        }
    };

    return (
        <div className="controlListSong">
            <div className="controls">
                <div className="left">
                    <button className="playButton" onClick={(e) => handleTogglePlay(e)}>
                        {anySongMatchedCurrenSongIndex() ? <IconPause /> : <IconPlay />}
                    </button>
                    <button className="plusCircle">
                        <IconPlusCircle />
                    </button>
                    <button className="clockCircle">
                        <IconClockCircle />
                    </button>
                    <button className="moreCircle">
                        <IconMoreCircle />
                    </button>
                </div>
                <div className="right">
                    <span>List</span>
                    <button className="list">
                        <IconList />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlListSong;
