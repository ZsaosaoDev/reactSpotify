import { useEffect } from "react";
import { loginWithGoogle } from "~/apis/authApi";


const GoogleCallback = () => {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
            loginWithGoogle(code)
                .then((res) => {
                    if (window.opener) {
                        window.opener.postMessage(
                            { accessToken: res.accessToken },
                            window.location.origin
                        );
                        window.close();
                    }
                })
                .catch((err) => {
                    console.error(err);
                    if (window.opener) window.close();
                });
        }
    }, []);

    return <div>Đang xác thực Google...</div>;
};

export default GoogleCallback;