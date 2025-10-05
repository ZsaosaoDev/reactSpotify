import { useState, useEffect } from "react";
import { uploadSong, getAllSongGenres } from "~/apis/songApi";
import Navigation from "~/components/navs/Navigation";
import "./UploadSongPage.sass";

const UploadSongPage = () => {
    const [fileMedia, setFileMedia] = useState(null);
    const [fileImage, setFileImage] = useState(null);

    const [mediaPreview, setMediaPreview] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isVideo, setIsVideo] = useState(false);

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [singer, setSinger] = useState("");
    const [albumId, setAlbumId] = useState("");
    const [genreIds, setGenreIds] = useState([]);
    const [genres, setGenres] = useState([]);


    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");


    const handleSong = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileMedia(file);

        const url = URL.createObjectURL(file);
        setMediaPreview(url);

        if (file.type.startsWith("video/")) setIsVideo(true);
        else if (file.type.startsWith("audio/")) setIsVideo(false);

        e.target.value = null;
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        setFileImage(file || null);
        setImagePreview(file ? URL.createObjectURL(file) : null);
        e.target.value = null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fileMedia) {
            setErrorMessage("Song file is required");
            setSuccessMessage("")
            return;
        }

        try {
            const formData = new FormData();
            formData.append("fileMedia", fileMedia);
            if (fileImage) formData.append("fileImage", fileImage);
            formData.append("title", title);
            formData.append("author", author);
            formData.append("singer", singer);
            formData.append("albumId", albumId);
            genreIds.forEach((id) => formData.append("genreIds", id));

            await uploadSong(formData);

            setSuccessMessage("Upload successful!");
            setErrorMessage("");

            // reset form
            setFileMedia(null);
            setFileImage(null);
            setMediaPreview(null);
            setImagePreview(null);
            setTitle("");
            setAuthor("");
            setSinger("");
            setAlbumId("");
            setGenreIds([]);
        } catch (err) {
            console.error(err);
            setErrorMessage(err?.response?.data?.message || "Upload failed");
            setSuccessMessage("");
        }
    };

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const data = await getAllSongGenres();
                setGenres(data || []);
            } catch (err) {
                console.error("Failed to load genres", err);
                setGenres([]);
            }
        };
        fetchGenres();
    }, []);


    const toggleSelect = (id) => {
        if (genreIds.includes(id)) {
            setGenreIds(genreIds.filter((x) => x !== id));
        } else {
            setGenreIds([...genreIds, id]);
        }
    };

    useEffect(() => {
        return () => {
            if (mediaPreview) URL.revokeObjectURL(mediaPreview);
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [mediaPreview, imagePreview]);

    return (
        <div className="upload-song-page">
            <Navigation />
            <h1 className="title">Upload Song</h1>
            <div className="page-center">
                <div className="card">
                    <form onSubmit={handleSubmit} className="upload-song-form">
                        <div className="form-content">
                            <div className="left">
                                <div className="media-box">
                                    {mediaPreview ? (
                                        isVideo ? (
                                            <video src={mediaPreview} controls />
                                        ) : (
                                            <audio controls>
                                                <source src={mediaPreview} type={fileMedia?.type} />
                                            </audio>
                                        )
                                    ) : (
                                        <div className="placeholder">Chưa chọn file audio/video</div>
                                    )}
                                </div>

                                <label htmlFor="media-input" className="btn pick-btn">
                                    {mediaPreview ? "Chọn lại file" : "Chọn audio/video"}
                                </label>
                                <input
                                    id="media-input"
                                    type="file"
                                    accept="audio/*,video/*"
                                    onChange={handleSong}
                                    hidden
                                />

                                <div className="image-box">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Cover preview" />
                                    ) : (
                                        <div className="placeholder">Chưa chọn ảnh bìa</div>
                                    )}
                                </div>

                                <label htmlFor="image-input" className="btn pick-btn">
                                    {imagePreview ? "Chọn lại ảnh" : "Chọn ảnh bìa"}
                                </label>
                                <input
                                    id="image-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImage}
                                    hidden
                                />
                            </div>

                            <div className="right">
                                <div className="field">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="field">
                                    <label>Author</label>
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                    />
                                </div>

                                <div className="field">
                                    <label>Singer</label>
                                    <input
                                        type="text"
                                        value={singer}
                                        onChange={(e) => setSinger(e.target.value)}
                                    />
                                </div>

                                <label>Gerne</label>
                                <div className="multi-select">
                                    <div className="options">
                                        {genres.map((g) => (
                                            <div
                                                key={g.id}
                                                className={`option ${genreIds.includes(g.id) ? "active" : ""}`}
                                                onClick={() => toggleSelect(g.id)}
                                            >
                                                {g.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" className="btn submit-btn">
                                    Upload Song
                                </button>
                                <div className="alert">
                                    {errorMessage && (
                                        <div className="error">{errorMessage}</div>
                                    )}
                                    {successMessage && (
                                        <div className="success">{successMessage}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadSongPage;
