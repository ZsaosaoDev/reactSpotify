import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import rootReducer from "./reducer/rootReducer";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth", "song"], // chỉ lưu reducer "auth"
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // tắt check vì redux-persist lưu non-serializable data
        }),
});

export const persistor = persistStore(store);