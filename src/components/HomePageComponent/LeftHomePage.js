import { IconShrink, IconWiden, IconSearch, IconList } from "~/assets/image/icons";
import "./LeftHomePage.sass"

const LeftHomePage = () => {
    return (
        <div className="leftHomePage">
            <div className="leftHeader">
                <div className="titleShrink">
                    <div className="shrinkBtn">
                        <IconShrink />
                    </div>
                    <div className="title">Your Library</div>
                </div>
                <div className="actions">
                    <div className="createBtn">+ Create</div>
                    <div className="widenBtn">
                        <IconWiden />
                    </div>
                </div>
            </div>

            <div className="filters">
                <div className="filterItem">Playlists</div>
                <div className="filterItem">Artists</div>
            </div>

            <div className="searchList">
                <div className="searchBox">
                    <div className="searchIcon">
                        <IconSearch height={16} />
                    </div>
                    <input className="searchInput" type="text" placeholder="Search in Your Library" />
                    <div className="searchOverlay"></div>
                </div>
                <div className="recentList">
                    <div className="recentTitle">Recent</div>
                    <IconList height={16} />
                </div>
            </div>
        </div>
    );
};

export default LeftHomePage;
