import { useMemo } from 'react';

import { follow } from '~/apis/songApi';
import { IconFollow, IconPlusCircle, IconTriangle } from '~/assets/image/icons';
import { useSelector } from 'react-redux';

export const useMenuOptions = (reduxData, onNotification) => {
    const reduxLibrarySong = useSelector((state) => state.songNotWhite.reduxLibrarySong);
    return useMemo(() => {
        if (!Array.isArray(reduxData) || reduxData.length === 0) {
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
                                    <IconFollow height={16} />
                                    Follow Artist
                                </div>
                            </div>
                        ),
                        action: async () => {
                            for (const item of reduxLibrarySong) {
                                if (item.type === 'artist') {
                                    const res = await follow(item.id, 'ARTIST');
                                    onNotification(res);
                                }
                            }
                        },
                        isPlaylistAction: false,
                    });

                    break;

                case 'album':
                    options.push({
                        label: 'Add to Library',
                        action: () => console.log('Add album to library:', id),
                        isPlaylistAction: false,
                    });
                    options.push({
                        label: 'Add to Playlist',
                        action: null,
                        isPlaylistAction: true,
                    });
                    break;

                default:
                    break;
            }
        });

        return options;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reduxData, reduxLibrarySong]);
};

export default useMenuOptions;
