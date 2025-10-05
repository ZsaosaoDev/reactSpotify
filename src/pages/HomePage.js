import { useState } from 'react';
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { useNavigate } from "react-router-dom";

import Navigator from '~/components/navs/Navigation';
import LeftHomePage from '~/components/HomePageComponent/LeftHomePage';
import CenterHomePage from '~/components/HomePageComponent/CenterHomePage';
import RightHomePage from '~/components/HomePageComponent/RightHomePage';
import MusicPlayerBar from '~/components/HomePageComponent/MusicPlayerBar';

import "./HomePage.sass";

library.add(faPlay);

const HomePage = () => {

    const [isAlbum, setIsAlbum] = useState(false);
    const [hoverIndex, setHoverIndex] = useState(null);

    const navigate = useNavigate();



    return (
        <div className='homePage'>
            <Navigator />
            <div className="content">
                <LeftHomePage />
                <CenterHomePage />
                <RightHomePage />
            </div>

            <MusicPlayerBar />

        </div>
    );
};

export default HomePage;
