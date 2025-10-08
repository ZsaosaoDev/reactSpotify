import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { follow, unfollow, followedArtistApi, followedAlbumApi } from '~/apis/songApi';
import { IconClose, IconFollow, IconPlusCircle, IconTriangle } from '~/assets/image/icons';
import { setReduxRefresh } from '~/redux/reducer/songNotWhitelistSlice';

export const useMenuOptions = (reduxData, onNotification) => {
    const dispatch = useDispatch();
    const [followedArtists, setFollowedArtists] = useState(null);

    const reduxLibrarySong = useSelector((state) => state.songNotWhite.reduxLibrarySong);

    useEffect(() => {
        const fetchFollowedArtists = async () => {
            try {
                const result = await followedArtistApi();
                setFollowedArtists(result || []);
            } catch (error) {
                console.error('Failed to fetch followed artists:', error);
                setFollowedArtists([]);
            }
        };

        fetchFollowedArtists();
    }, []);

    const [followedAlbums, setFollowedAlbums] = useState(null);

    useEffect(() => {
        const fetchFollowedData = async () => {
            try {
                const artists = await followedArtistApi();
                setFollowedArtists(artists || []);

                const albums = await followedAlbumApi();
                setFollowedAlbums(albums || []);
            } catch (error) {
                console.error('Failed to fetch followed data:', error);
                setFollowedArtists([]);
                setFollowedAlbums([]);
            }
        };

        fetchFollowedData();
    }, []);

    return useMemo(() => {
        if (!Array.isArray(reduxData) || reduxData.length === 0) {
            return [];
        }

        if (followedArtists === null) {
            return [];
        }
        const options = [];

        reduxData.forEach(({ type, id }) => {
            switch (type) {
                case 'playlist':
                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconPlusCircle height={16} />
                                    Add To Playlist
                                </div>
                                <IconTriangle height={16} />
                            </div>
                        ),
                        action: null,
                        isPlaylistAction: true,
                    });
                    break;

                case 'artist':
                    const isFollowed = followedArtists.some((artist) => artist.id === id);

                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isFollowed ? (
                                        <>
                                            <IconClose height={16} />
                                            Unfollow Artist
                                        </>
                                    ) : (
                                        <>
                                            <IconFollow height={16} />
                                            Follow Artist
                                        </>
                                    )}
                                </div>
                            </div>
                        ),
                        action: async () => {
                            for (const item of reduxLibrarySong) {
                                if (item.type === 'artist') {
                                    try {
                                        const isArtistFollowed = followedArtists.some((artist) => artist.id === item.id);
                                        const res = isArtistFollowed ? await unfollow(item.id, 'ARTIST') : await follow(item.id, 'ARTIST');

                                        dispatch(setReduxRefresh());
                                        onNotification(res);

                                        const updatedFollowed = await followedArtistApi();
                                        setFollowedArtists(updatedFollowed || []);
                                    } catch (e) {
                                        onNotification('Vui lòng đăng nhập để follow/unfollow nghệ sĩ');
                                    }
                                }
                            }
                        },
                        isPlaylistAction: false,
                    });

                    break;

                case 'album':
                    const isAlbumFollowed = followedAlbums?.some((album) => album.id === id);

                    options.push({
                        label: (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {isAlbumFollowed ? (
                                        <>
                                            <IconClose height={16} />
                                            UnFollow Album
                                        </>
                                    ) : (
                                        <>
                                            <IconPlusCircle height={16} />
                                            Follow Album
                                        </>
                                    )}
                                </div>
                            </div>
                        ),
                        action: async () => {
                            for (const item of reduxLibrarySong) {
                                if (item.type === 'album') {
                                    try {
                                        const isItemFollowed = followedAlbums?.some((album) => album.id === item.id);
                                        const res = isItemFollowed ? await unfollow(item.id, 'ALBUM') : await follow(item.id, 'ALBUM');

                                        dispatch(setReduxRefresh());
                                        onNotification(res);

                                        const updatedFollowedAlbums = await followedAlbumApi();
                                        setFollowedAlbums(updatedFollowedAlbums || []);
                                    } catch (e) {
                                        onNotification('Vui lòng đăng nhập để follow/unfollow album');
                                    }
                                }
                            }
                        },
                        isPlaylistAction: false,
                    });
                    break;

                default:
                    break;
            }
        });

        return options;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reduxData, reduxLibrarySong, followedArtists]);
};

export default useMenuOptions;
