import { useMemo } from 'react';
import { IconPlusCircle, IconTriangle } from '~/assets/image/icons';

export const useMenuOptions = (reduxData) => {
    return useMemo(() => {
        const { type, id } = reduxData || {};
        const options = [];

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
                    action: null, // Will be set by ContextMenu component
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
                    action: null, // Will be set by ContextMenu component
                    isPlaylistAction: true,
                });
                break;

            default:
                // Don't show menu for invalid types
                break;
        }

        return options;
    }, [reduxData]);
};

export default useMenuOptions;
