import api from './api';

async function uploadSong(formData) {
    const res = await api.post('/artist/songs', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
}

async function getAllSongGenres() {
    try {
        const res = await api.get('/artist/genres');
        console.log(res.data);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getTrendingSongs(page = 0, size = 10, days = 7) {
    try {
        const res = await api.get(
            'open/songs/trending',
            {
                params: { page, size, days },
            },
            { skipAuthCheck: true }
        );
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function getSongAndArtistBySongId(songId) {
    try {
        const res = await api.get(`user/songs/${songId}`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function listenSong(songId) {
    try {
        await api.get(`user/songs/${songId}/listen`);
    } catch (err) {
        throw err;
    }
}
async function calDurationSong(songId) {
    try {
        const res = await api.put(`user/songs/${songId}/cal-duration-song`);
        return res.data;
    } catch (err) {
        throw err;
    }
}

async function getTrendingAlbums(page = 0, size = 10) {
    try {
        const res = await api.get('open/albums/trending', {
            params: { page, size },
            skipAuthCheck: true,
        });
        return res.data.content;
    } catch (err) {
        throw err;
    }
}
async function getAlbumWithSongs(albumId) {
    try {
        const res = await api.get(`user/albums/${albumId}/songs`);
        return res.data;
    } catch (err) {
        throw err;
    }
}
async function getTrendingArtists(page = 0, size = 10, days = 7) {
    try {
        const res = await api.get(
            'open/artist/trending',
            {
                params: { page, size, days },
            },
            { skipAuthCheck: true }
        );
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function getArtistWithSongs(artistId) {
    try {
        const res = await api.get(`open/${artistId}/songs`);
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

async function getListeningHistory(page = 0, size = 10) {
    try {
        const res = await api.get('user/listening-history', {
            params: { page, size },
        });
        return res.data.content;
    } catch (err) {
        throw err;
    }
}

export {
    uploadSong,
    getAllSongGenres,
    getTrendingSongs,
    getSongAndArtistBySongId,
    listenSong,
    calDurationSong,
    getTrendingAlbums,
    getAlbumWithSongs,
    getTrendingArtists,
    getArtistWithSongs,
    getListeningHistory,
};
