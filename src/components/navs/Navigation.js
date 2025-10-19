import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';

import NoAvatar from '~/assets/image/noAvatar.png';
import {
    setReduxIsHomeActiveTrue,
    setReduxIsBrowseActiveTrue,
    setReduxIsNotificationActive,
} from '~/redux/reducer/uiSlice';
import { setReduxLogout } from '~/redux/reducer/authSlice';
import {
    LogoMain,
    IconHouseFull,
    IconHomeEmpty,
    IconSearch,
    IconBrowseFull,
    IconBrowseEmpty,
    IconClose,
    IconInstall,
    IconNotificationEmpty,
    IconNotificationFull,
    IconFriends,
} from '~/assets/image/icons';
import { logout } from '~/apis/authApi';
import './Navigation.sass';

const Navigation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isHomeActive = useSelector((state) => state.ui.reduxIsHomeActive);
    const isBrowseActive = useSelector((state) => state.ui.reduxIsBrowseActive);
    const isNotificationActive = useSelector((state) => state.ui.reduxIsNotificationActive);

    const reduxUser = useSelector((state) => state.auth.reduxUser);
    const isLogin = useSelector((state) => state.auth.reduxIsLogin);

    const [searchValue, setSearchValue] = useState('');
    const [displayIconClose, setDisplayIconClose] = useState(false);
    const [settings, setSetTings] = useState(false);

    // Xử lý thay đổi ô tìm kiếm
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        setDisplayIconClose(value.length > 0);
    };

    // Xóa nội dung ô tìm kiếm
    const handleClose = () => {
        setSearchValue('');
        setDisplayIconClose(false);
    };

    // Xử lý đăng xuất
    const hangdleLogout = () => {
        setSetTings(false);
        logout()
            .then(() => {
                dispatch(setReduxLogout());
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const [lastSearchParams, setLastSearchParams] = useState(null);
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchValue.trim() !== '') {
            const newSearchParams = encodeURIComponent(searchValue.trim());

            // Nếu search params giống search trước thì bỏ qua
            if (newSearchParams === lastSearchParams) {
                return;
            }

            // Nếu đã có search trước đó thì replace (search liên tiếp)
            const shouldReplace = lastSearchParams !== null;

            navigate(`/search/${newSearchParams}`, {
                replace: shouldReplace,
            });

            setLastSearchParams(newSearchParams);
        }
    };

    return (
        <div className="navigation">
            {isLogin ? (
                <>
                    <div className="navigation-left">
                        <Link to="/" className="logo">
                            <LogoMain height={32} />
                        </Link>
                    </div>
                    <div className="navigation-right">
                        <div className="isHomeActive" onClick={() => dispatch(setReduxIsHomeActiveTrue())}>
                            {isHomeActive ? <IconHouseFull /> : <IconHomeEmpty />}
                        </div>
                        <div className="search">
                            <div className="icon-search">
                                <IconSearch />
                            </div>
                            <div className="input-search">
                                <input
                                    type="text"
                                    placeholder="What do you want to play?"
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchSubmit}
                                />
                                <div
                                    className="closeIcon"
                                    style={{ opacity: displayIconClose ? 1 : 0 }}
                                    onClick={handleClose}>
                                    <IconClose />
                                </div>
                            </div>
                            <div className="browser" onClick={() => dispatch(setReduxIsBrowseActiveTrue())}>
                                {isBrowseActive ? <IconBrowseFull /> : <IconBrowseEmpty />}
                            </div>
                        </div>

                        <div className="explore-premium">
                            <span>Explore Premium</span>
                        </div>
                        <div className="install-app">
                            <div className="icon-install">
                                <IconInstall />
                            </div>
                            <div>
                                <span>Install App</span>
                            </div>
                        </div>
                        <div
                            className="icon-notification"
                            onClick={() => dispatch(setReduxIsNotificationActive(!isNotificationActive))}>
                            {isNotificationActive ? <IconNotificationFull /> : <IconNotificationEmpty />}
                        </div>
                        <div className="icon-friends">
                            <IconFriends />
                        </div>
                        <div className="profile" onClick={() => setSetTings((pre) => !pre)}>
                            {reduxUser?.urlAvatar ? (
                                <img src={reduxUser.urlAvatar} alt="Profile" />
                            ) : (
                                <img src={NoAvatar} alt="No Avatar" />
                            )}
                        </div>
                    </div>
                    {settings ? (
                        <div className="settings">
                            <div>Accout</div>
                            <div>Profile</div>
                            <div>Upgrade to Premium</div>
                            <div>Support</div>
                            <div>Download</div>
                            <div>Settings</div>
                            <div onClick={hangdleLogout}>Log out</div>
                        </div>
                    ) : (
                        ''
                    )}
                </>
            ) : (
                <>
                    <div className="navigation-left">
                        <Link to="/" className="logo">
                            <LogoMain height={32} />
                        </Link>
                        <div className="isHomeActive" onClick={() => dispatch(setReduxIsHomeActiveTrue())}>
                            {isHomeActive ? <IconHouseFull /> : <IconHomeEmpty />}
                        </div>
                        <div className="search">
                            <div className="icon-search">
                                <IconSearch />
                            </div>
                            <div className="input-search">
                                <input
                                    type="text"
                                    placeholder="What do you want to play?"
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchSubmit}
                                />
                                <div
                                    className="closeIcon"
                                    style={{ opacity: displayIconClose ? 1 : 0 }}
                                    onClick={handleClose}>
                                    <IconClose />
                                </div>
                            </div>
                            <div className="browser" onClick={() => dispatch(setReduxIsBrowseActiveTrue())}>
                                {isBrowseActive ? <IconBrowseFull /> : <IconBrowseEmpty />}
                            </div>
                        </div>
                    </div>
                    <div className="navigation-right">
                        <Link className="link" to="#">
                            <div className="premium">Premium</div>
                        </Link>
                        <Link className="link" to="#">
                            <div className="support">Support</div>
                        </Link>
                        <Link className="link" to="#">
                            <div className="download">Download</div>
                        </Link>

                        <div className="install-app">
                            <div className="icon-install">
                                <IconInstall />
                            </div>
                            <div>
                                <span>Install App</span>
                            </div>
                        </div>
                        <Link className="link" to="/signUpInitiatePage">
                            <div className="sign-up">Sign up</div>
                        </Link>
                        <Link className="link" to="/loginPage">
                            <div className="login">Log in</div>
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default Navigation;
