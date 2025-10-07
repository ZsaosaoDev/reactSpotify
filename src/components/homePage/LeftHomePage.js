import { IconShrink, IconWiden, IconSearch, IconList, IconClose } from '~/assets/image/icons';
import './LeftHomePage.sass';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { followed } from '~/apis/songApi';

const LeftHomePage = () => {
    const reduxRefresh = useSelector((state) => state.songNotWhite.reduxRefresh);
    const [followedData, setFollowedData] = useState({
        artistFollowed: [],
        albumFollowed: [],
        playlistFollowed: [],
    });
    const [filter, setFilter] = useState('all'); // 'all', 'playlists', 'artists', 'albums'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchFollowed = async () => {
            try {
                const res = await followed();
                console.log(res);
                setFollowedData(res);
            } catch (error) {
                console.error('Error fetching followed:', error);
            }
        };

        fetchFollowed();
    }, [reduxRefresh]);

    // Filter items based on search query
    const filterBySearch = (items, type) => {
        if (!searchQuery) return items;

        return items.filter((item) => {
            const searchText = type === 'artist' ? (item.userName || 'Unknown Artist').toLowerCase() : item.name.toLowerCase();
            return searchText.includes(searchQuery.toLowerCase());
        });
    };

    // Get filtered playlists
    const getFilteredPlaylists = () => {
        if (filter !== 'all' && filter !== 'playlists') return [];
        return filterBySearch(followedData.playlistFollowed, 'playlist');
    };

    // Get filtered artists
    const getFilteredArtists = () => {
        if (filter !== 'all' && filter !== 'artists') return [];
        return filterBySearch(followedData.artistFollowed, 'artist');
    };

    // Get filtered albums
    const getFilteredAlbums = () => {
        if (filter !== 'all' && filter !== 'albums') return [];
        return filterBySearch(followedData.albumFollowed, 'album');
    };

    const filteredPlaylists = getFilteredPlaylists();
    const filteredArtists = getFilteredArtists();
    const filteredAlbums = getFilteredAlbums();

    const hasResults = filteredPlaylists.length > 0 || filteredArtists.length > 0 || filteredAlbums.length > 0;

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="leftHomePage">
            <div className="leftHeader">
                <div className="titleShrink">
                    <div className="title">Your Library</div>
                </div>
                <div className="actions">
                    <div className="createBtn">+ Create</div>
                </div>
            </div>

            <div className="filters">
                <div className={`filterItem ${filter === 'playlists' ? 'active' : ''}`} onClick={() => setFilter(filter === 'playlists' ? 'all' : 'playlists')}>
                    Playlists
                </div>
                <div className={`filterItem ${filter === 'artists' ? 'active' : ''}`} onClick={() => setFilter(filter === 'artists' ? 'all' : 'artists')}>
                    Artists
                </div>
                <div className={`filterItem ${filter === 'albums' ? 'active' : ''}`} onClick={() => setFilter(filter === 'albums' ? 'all' : 'albums')}>
                    Albums
                </div>
            </div>

            <div className="searchList">
                <div className={`searchBox ${searchQuery ? 'hasText' : ''}`}>
                    <div className="searchIcon">
                        <IconSearch height={16} />
                    </div>
                    <input className="searchInput" type="text" placeholder="Search in Your Library" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    {searchQuery && (
                        <div className="clearSearchBtn" onClick={handleClearSearch}>
                            <IconClose height={16} />
                        </div>
                    )}
                    <div className="searchOverlay"></div>
                </div>
                <div className="recentList">
                    <div className="recentTitle">Recent</div>
                    <IconList height={16} />
                </div>
            </div>

            <div className="followedContent">
                {!hasResults ? (
                    <div className="emptyState">{searchQuery ? `No results found for "${searchQuery}"` : 'No items found'}</div>
                ) : (
                    <>
                        {/* Render Playlists Section */}
                        {filteredPlaylists.length > 0 && (
                            <div className="followedSection">
                                {filter === 'all' && <div className="sectionTitle">Playlists</div>}
                                <div className="followedList">
                                    {filteredPlaylists.map((playlist) => (
                                        <div key={`playlist-${playlist.id}`} className="followedItem">
                                            <div className="itemImage">
                                                <img src={playlist.imageUrl} alt={playlist.name} />
                                            </div>
                                            <div className="itemInfo">
                                                <div className="itemName">{playlist.name}</div>
                                                <div className="itemDetails">
                                                    Playlist • {playlist.songCount} {playlist.songCount === 1 ? 'song' : 'songs'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Render Artists Section */}
                        {filteredArtists.length > 0 && (
                            <div className="followedSection">
                                {filter === 'all' && <div className="sectionTitle">Artists</div>}
                                <div className="followedList">
                                    {filteredArtists.map((artist) => (
                                        <div key={`artist-${artist.id}`} className="followedItem">
                                            <div className="itemImage artistImage">
                                                <img src={artist.urlAvatar} alt={artist.userName || 'Artist'} />
                                            </div>
                                            <div className="itemInfo">
                                                <div className="itemName">{artist.userName || 'Unknown Artist'}</div>
                                                <div className="itemDetails">Artist</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Render Albums Section */}
                        {filteredAlbums.length > 0 && (
                            <div className="followedSection">
                                {filter === 'all' && <div className="sectionTitle">Albums</div>}
                                <div className="followedList">
                                    {filteredAlbums.map((album) => (
                                        <div key={`album-${album.id}`} className="followedItem">
                                            <div className="itemImage">
                                                <img src={album.coverUrl} alt={album.name} />
                                            </div>
                                            <div className="itemInfo">
                                                <div className="itemName">{album.name}</div>
                                                <div className="itemDetails">
                                                    Album
                                                    {album.description && ` • ${album.description}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default LeftHomePage;
