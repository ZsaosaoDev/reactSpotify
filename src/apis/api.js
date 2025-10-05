import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { store } from '../redux/store';
import { setReduxAccessToken } from "../redux/reducer/authSlice";

const BASE_URL = 'http://localhost:8080/api';

// Tạo instance Axios mặc định
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// --- Biến dùng để quản lý refresh queue ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom =>
        error ? prom.reject(error) : prom.resolve(token)
    );
    failedQueue = [];
};

// --- Helper: set Authorization header ---
const setAuthHeader = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

// --- Hàm khởi tạo khi app bật lại ---
const initializeAuthHeader = async () => {
    const token = store.getState().auth.reduxAccessToken;
    if (!token) return;

    try {
        const { exp } = jwtDecode(token);
        const isExpired = Date.now() >= exp * 1000;

        if (!isExpired) {
            // Token còn hạn -> dùng luôn
            setAuthHeader(token);
        } else {
            // Token hết hạn -> gọi refresh ngay khi app mở
            try {
                const res = await axios.get(`${BASE_URL}/auth/access-token`, { withCredentials: true });
                const newToken = res.data.accessToken;

                store.dispatch(setReduxAccessToken(newToken));
                setAuthHeader(newToken);
            } catch (err) {
                console.warn('❌ Failed to refresh access token on init:', err);
                store.dispatch(setReduxAccessToken(null));
                setAuthHeader(null);
            }
        }
    } catch (error) {
        console.warn('⚠️ Invalid token in store:', error);
        store.dispatch(setReduxAccessToken(null));
        setAuthHeader(null);
    }
};

// --- Gọi hàm khởi tạo ngay khi import ---
initializeAuthHeader();

// --- Interceptor: kiểm tra & refresh token khi request ---
api.interceptors.request.use(async (config) => {
    if (config.skipAuthCheck) return config;

    const token = store.getState().auth.reduxAccessToken;

    if (!token) {
        setAuthHeader(null);
        return config;
    }

    try {
        const { exp } = jwtDecode(token);

        // Token hết hạn -> refresh
        if (Date.now() >= exp * 1000) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const res = await axios.get(`${BASE_URL}/auth/access-token`, { withCredentials: true });
                    const newToken = res.data.accessToken;

                    store.dispatch(setReduxAccessToken(newToken));
                    setAuthHeader(newToken);
                    processQueue(null, newToken);

                    return {
                        ...config,
                        headers: {
                            ...config.headers,
                            'Authorization': `Bearer ${newToken}`,
                        },
                    };
                } catch (err) {
                    processQueue(err, null);
                    store.dispatch(setReduxAccessToken(null));
                    setAuthHeader(null);
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            // Có request khác đang refresh -> đợi xong
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token) => {
                        resolve({
                            ...config,
                            headers: {
                                ...config.headers,
                                'Authorization': token ? `Bearer ${token}` : undefined,
                            },
                        });
                    },
                    reject: (err) => reject(err),
                });
            });
        } else {
            // Token còn hạn
            setAuthHeader(token);
            return {
                ...config,
                headers: {
                    ...config.headers,
                    'Authorization': `Bearer ${token}`,
                },
            };
        }
    } catch (error) {
        console.warn('⚠️ Error decoding token:', error);
        store.dispatch(setReduxAccessToken(null));
        setAuthHeader(null);
        return config;
    }
}, (error) => Promise.reject(error));

// --- Export helper để update token thủ công ---
export const updateAuthHeader = (token) => {
    setAuthHeader(token);
};

export default api;
