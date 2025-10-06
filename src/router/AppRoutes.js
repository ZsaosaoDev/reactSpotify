import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HomePage from "~/pages/HomePage";
import SignUpInitiatePage from "~/pages/authPage/SignUpInitiatePage";
import SignUpVerifyPage from "~/pages/authPage/SignUpVerifyPage";
import LoginPage from "~/pages/authPage/LoginPage";
import GoogleCallback from "~/pages/authPage/GoogleCallback";
import UploadSongPage from "~/pages/songPage/UploadSongPage";

const pages = {
    "/": HomePage,
    "/album/*": HomePage,
    "/artist/*": HomePage,
    "/playlist/*": HomePage,
    "/signUpInitiatePage": SignUpInitiatePage,
    "/signUpVerifyPage": SignUpVerifyPage,
    "/loginPage": LoginPage,
    "/auth/google-callback": GoogleCallback,
    "/song/upload": UploadSongPage,
};

// Hàm helper để lấy animation key
const getAnimationKey = (pathname) => {
    // Nếu pathname là "/" hoặc bắt đầu với "/album", trả về cùng 1 key
    if (pathname === "/" || pathname.startsWith("/album") || pathname.startsWith("/artist") || pathname.startsWith("/playlist")) {
        return "home";
    }
    // Còn lại trả về pathname để có animation riêng
    return pathname;
};

const AppRoutes = () => {
    const location = useLocation();
    const animationKey = getAnimationKey(location.pathname);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                backgroundColor: "#000",
            }}
        >
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={animationKey}
                    initial={{ x: "100%", opacity: 1 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{
                        x: "-100%",
                        opacity: 0,
                        transition: { duration: 0.3 },
                    }}
                    transition={{
                        type: "tween",
                        ease: [0.25, 0.1, 0.25, 1],
                        duration: 0.4,
                    }}
                    style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        backgroundColor: "#000",
                    }}
                >
                    <Routes location={location}>
                        {Object.entries(pages).map(([path, Component]) => (
                            <Route key={path} path={path} element={<Component />} />
                        ))}
                    </Routes>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AppRoutes;