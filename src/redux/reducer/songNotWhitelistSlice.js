import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reduxIsPlaying: false,
    reduxDuration: 0,
    reduxIsRight: false,
};

const songNotWhiteListSlice = createSlice({
    name: "songNotWhite",
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
        }
    },
});

export const { setReduxIsRight, setReduxCurrentTime, setReduxIsPlaying } = songNotWhiteListSlice.actions;
export default songNotWhiteListSlice.reducer;
