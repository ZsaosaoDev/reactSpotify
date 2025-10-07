import { useMemo } from 'react';
import { IconPlusCircle, IconTriangle } from '~/assets/image/icons';

export const useMenuOptions = (reduxData) => {
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
                                    Add to Playlist
                                </div>
                                <IconTriangle height={16} />
                            </div>
                        ),
                        action: null,
                        isPlaylistAction: true,
                    });
                    options.push({
                        label: 'Follow Artist',
                        action: () => console.log('Follow artist action for ID:', id),
                        isPlaylistAction: false,
                    });
                    break;

                case 'artist':
                    options.push({
                        label: 'Follow Artist',
                        action: () => console.log('Follow artist action for ID:', id),
                        isPlaylistAction: false,
                    });
                    options.push({
                        label: 'View Artist Profile',
                        action: () => console.log('View artist profile action for ID:', id),
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
    }, [reduxData]);
};

export default useMenuOptions;
