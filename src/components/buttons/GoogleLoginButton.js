import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setReduxLogin, setReduxUser } from '~/redux/reducer/authSlice';
import { profile } from '~/apis/authApi';
import { IconGoogle } from '~/assets/image/icons';
import Notification from '~/components/librarySong/Notification';
import './GoogleLoginButton.sass';

const GoogleLoginButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const loginGoogle = () => {
        const clientId = '705243783215-ei795tnvk2891u4pqvftiea6h80rjb1h.apps.googleusercontent.com';
        const redirectUri = 'http://localhost:3000/auth/google-callback';
        const scope = 'openid email profile';
        const responseType = 'code';

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;

        const popupWidth = 500;
        const popupHeight = 600;
        const left = window.screenX + (window.outerWidth - popupWidth) / 2;
        const top = window.screenY + (window.outerHeight - popupHeight) / 2;

        window.open(authUrl, '_blank', `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`);
    };

    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.origin !== window.location.origin) return;

            const { accessToken, error } = event.data;
            if (accessToken) {
                dispatch(setReduxLogin(accessToken));
                try {
                    const userProfile = await profile();
                    dispatch(setReduxUser(userProfile));

                    navigate('/');
                } catch (err) {
                    setErrorMessage('Failed to fetch user profile. Please try again.');
                }
            } else if (error) {
                setErrorMessage('Failed to fetch user profile. Please try again.');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch, navigate, setErrorMessage]);

    return (
        <div className="google-login" onClick={loginGoogle}>
            <div className="icon-google">
                <IconGoogle />
            </div>
            <div className="signUpGoogle">Sign in with Google</div>
            {errorMessage && <Notification message={errorMessage} onClose={() => setErrorMessage('')} />}
        </div>
    );
};

export default GoogleLoginButton;
