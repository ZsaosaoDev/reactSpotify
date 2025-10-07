import { IconSearch, IconList, IconClose } from '~/assets/image/icons';
import './LeftHomePage.sass';
import { useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
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

    const handleFilterClick = (type) => {
        setFilter((prev) => (prev === type ? 'all' : type));
    };

    const fetchFollowed = useCallback(async () => {
        try {
            const res = await followed();
            setFollowedData(res);
        } catch (error) {
            console.error('Error fetching followed:', error);
        }
    }, []);

    useEffect(() => {
        fetchFollowed();
    }, [reduxRefresh, fetchFollowed]);

    // ✅ Search filtering
    const filterBySearch = (items, type) => {
        if (!searchQuery) return items;
        return items.filter((item) => {
            const searchText = type === 'artist' ? (item.userName || 'Unknown Artist').toLowerCase() : (item.name || '').toLowerCase();
            return searchText.includes(searchQuery.toLowerCase());
        });
    };

    const filteredPlaylists = (filter === 'all' || filter === 'playlists') && filterBySearch(followedData.playlistFollowed, 'playlist');

    const filteredArtists = (filter === 'all' || filter === 'artists') && filterBySearch(followedData.artistFollowed, 'artist');

    const filteredAlbums = (filter === 'all' || filter === 'albums') && filterBySearch(followedData.albumFollowed, 'album');

    const hasResults = (filteredPlaylists?.length || 0) + (filteredArtists?.length || 0) + (filteredAlbums?.length || 0) > 0;

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

            {/* FILTER BUTTONS */}
            <div className="filters">
                {['playlists', 'artists', 'albums'].map((type) => (
                    <div key={type} className={`filterItem ${filter === type ? 'active' : ''}`} onClick={() => handleFilterClick(type)}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                ))}
            </div>

            {/* SEARCH BAR */}
            <div className="searchList">
                <div className={`searchBox ${searchQuery ? 'hasText' : ''}`}>
                    <div className="searchIcon">
                        <IconSearch height={16} />
                    </div>
                    <input className="searchInput" type="text" placeholder="Search in Your Library" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    {searchQuery && (
                        <div className="clearSearchBtn" onClick={() => setSearchQuery('')}>
                            <IconClose height={16} />
                        </div>
                    )}
                </div>
                <div className="recentList">
                    <div className="recentTitle">Recent</div>
                    <IconList height={16} />
                </div>
            </div>

            {/* CONTENT */}
            <div className="followedContent">
                {!hasResults ? (
                    <div className="emptyState">{searchQuery ? `No results found for "${searchQuery}"` : 'No items found'}</div>
                ) : (
                    <>
                        {/* Playlists */}
                        {filteredPlaylists?.length > 0 && (
                            <div className="followedSection">
                                <div className="sectionTitle">Playlists</div>
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

                        {/* Artists */}
                        {filteredArtists?.length > 0 && (
                            <div className="followedSection">
                                <div className="sectionTitle">Artists</div>
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

                        {/* Albums */}
                        {filteredAlbums?.length > 0 && (
                            <div className="followedSection">
                                <div className="sectionTitle">Albums</div>
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
