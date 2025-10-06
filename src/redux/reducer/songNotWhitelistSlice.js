import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    reduxIsPlaying: false,
    reduxDuration: 0,
    reduxIsRight: false,
    reduxLibrarySong: {}, // { type: '', id: '' }
};

const songNotWhiteListSlice = createSlice({
    name: 'songNotWhite',
    initialState,
    reducers: {
        // Set trạng thái right panel
        setReduxIsRight: (state, action) => {
            state.reduxIsRight = action.payload;
        },

        setReduxCurrentTime: (state, action) => {
            state.reduxCurrentTime = action.payload;
        },
        // setIsPlaying
        setReduxIsPlaying: (state, action) => {
            state.reduxIsPlaying = action.payload;
        },
        setReduxLibrarySong: (state, action) => {
            const { type, id } = action.payload;
            state.reduxLibrarySong = { type, id };
        },
        cleanReduxLibrarySong: (state) => {
            state.reduxLibrarySong = {};
        },
    },
});

export const { setReduxIsRight, setReduxCurrentTime, setReduxIsPlaying, setReduxLibrarySong, cleanReduxLibrarySong } = songNotWhiteListSlice.actions;
export default songNotWhiteListSlice.reducer;
