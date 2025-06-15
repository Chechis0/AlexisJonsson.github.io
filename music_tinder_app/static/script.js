document.addEventListener('DOMContentLoaded', () => {
    console.log('Music Tinder script loaded!');

    // Global state for recommendations
    let currentRecommendations = [];
    let recommendationIndex = 0;

    // DOM Elements
    const likeButton = document.getElementById('like-btn');
    const dislikeButton = document.getElementById('dislike-btn');
    const cardContainer = document.getElementById('card-container');
    const loadingRecommendationsMessage = document.getElementById('loading-recommendations');

    const authSection = document.getElementById('auth-section');
    const profileDetailsContainer = document.getElementById('profile-details');
    const loadingProfileMessage = document.getElementById('loading-profile');

    // --- Helper for displaying errors ---
    function displayError(containerElement, message, loadingElement = null) {
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        if (containerElement) {
            containerElement.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    function clearContainer(containerElement, loadingElement = null){
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        if (containerElement) {
            containerElement.innerHTML = '';
        }
    }

    // --- Profile Section (Top Items) ---
    async function fetchTopItems() {
        if (!profileDetailsContainer) return false;
        if (loadingProfileMessage) loadingProfileMessage.style.display = 'block';

        try {
            const response = await fetch('/top_items');
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching top items:', errorData.error);
                displayError(profileDetailsContainer, `Could not load profile: ${errorData.error}`, loadingProfileMessage);
                if (errorData.login_required) window.location.href = '/login';
                return false;
            }
            const data = await response.json();
            clearContainer(profileDetailsContainer, loadingProfileMessage);

            if (data.artists && data.artists.length > 0) {
                const ul = document.createElement('ul');
                ul.className = 'artist-list';
                data.artists.forEach(artist => {
                    const li = document.createElement('li');
                    li.className = 'artist-item';
                    let imgHtml = '<div class="artist-image-placeholder">No Image</div>';
                    if (artist.images && artist.images.length > 0) {
                        const image = artist.images[artist.images.length - 1];
                        imgHtml = `<img src="${image.url}" alt="${artist.name}" width="50" height="50">`;
                    }
                    li.innerHTML = `
                        ${imgHtml}
                        <div class="artist-info">
                            <a href="${artist.external_urls}" target="_blank">${artist.name}</a>
                            <p class="genres">${artist.genres.slice(0, 3).join(', ')}</p>
                        </div>`;
                    ul.appendChild(li);
                });
                profileDetailsContainer.appendChild(ul);
                return true;
            } else {
                profileDetailsContainer.innerHTML = '<p>No top artists found. Listen to more music!</p>';
                return true; // Success, but no data
            }
        } catch (error) {
            console.error('Failed to fetch or parse top items:', error);
            displayError(profileDetailsContainer, 'An unexpected error occurred while loading your profile.', loadingProfileMessage);
            return false;
        }
    }

    // --- Recommendations Section ---
    function displayCurrentRecommendation() {
        if (!cardContainer) return;
        clearContainer(cardContainer, loadingRecommendationsMessage); // Clear previous card or loading message

        if (recommendationIndex >= currentRecommendations.length) {
            cardContainer.innerHTML = '<p>No more recommendations. Try logging out and back in, or listen to more music to refine suggestions!</p>';
            if(likeButton) likeButton.style.display = 'none';
            if(dislikeButton) dislikeButton.style.display = 'none';
            return;
        }

        if(likeButton) likeButton.style.display = 'inline-block';
        if(dislikeButton) dislikeButton.style.display = 'inline-block';

        const track = currentRecommendations[recommendationIndex];
        const card = document.createElement('div');
        card.className = 'card';

        let albumArtHtml = '<div class="album-art-placeholder">No Album Art</div>';
        if (track.album_art_url) {
            albumArtHtml = `<img src="${track.album_art_url}" alt="Album art for ${track.name}" class="album-art">`;
        }

        card.innerHTML = `
            ${albumArtHtml}
            <h3>${track.name}</h3>
            <p class="artist-name">${track.artists}</p>
            <audio controls src="${track.preview_url}" class="track-preview">
                Your browser does not support the audio element.
            </audio>
            <p><a href="${track.spotify_url}" target="_blank" class="spotify-link">Listen on Spotify</a></p>
        `;
        cardContainer.appendChild(card);
    }

    async function fetchRecommendations() {
        if (!cardContainer) return;
        if (loadingRecommendationsMessage) loadingRecommendationsMessage.style.display = 'block';
        if(likeButton) likeButton.style.display = 'none';
        if(dislikeButton) dislikeButton.style.display = 'none';

        try {
            const response = await fetch('/recommendations');
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching recommendations:', errorData.error);
                displayError(cardContainer, `Could not load recommendations: ${errorData.error}`, loadingRecommendationsMessage);
                if (errorData.login_required) window.location.href = '/login';
                return;
            }
            const data = await response.json();
            clearContainer(cardContainer, loadingRecommendationsMessage);

            if (data.tracks && data.tracks.length > 0) {
                currentRecommendations = data.tracks;
                recommendationIndex = 0;
                displayCurrentRecommendation();
            } else {
                cardContainer.innerHTML = '<p>No recommendations available at the moment. Try listening to more music!</p>';
                if(likeButton) likeButton.style.display = 'none';
                if(dislikeButton) dislikeButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to fetch or parse recommendations:', error);
            displayError(cardContainer, 'An unexpected error occurred while fetching recommendations.', loadingRecommendationsMessage);
            if(likeButton) likeButton.style.display = 'none';
            if(dislikeButton) dislikeButton.style.display = 'none';
        }
        // 'finally' block removed as clearContainer/displayError handles loading message hiding
    }

    async function handleLike() {
        if (recommendationIndex >= currentRecommendations.length) return;
        const track = currentRecommendations[recommendationIndex];
        const trackId = track.id;
        console.log('Liked:', track.name, 'ID:', trackId);

        try {
            const response = await fetch('/like_track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ track_id: trackId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error sending like:', errorData.error);
                // Minor feedback: console.error is sufficient for now as per requirements.
            } else {
                const result = await response.json();
                console.log('Like API response:', result.message);
            }
        } catch (error) {
            console.error('Network error sending like:', error);
        }
        recommendationIndex++;
        displayCurrentRecommendation();
    }

    function handleDislike() {
        if (recommendationIndex >= currentRecommendations.length) return;
        console.log('Disliked:', currentRecommendations[recommendationIndex]?.name);
        recommendationIndex++;
        displayCurrentRecommendation();
    }

    if (likeButton) likeButton.addEventListener('click', handleLike);
    if (dislikeButton) dislikeButton.addEventListener('click', handleDislike);

    // --- Initialization ---
    async function initializeApp() {
        const loginLink = authSection ? authSection.querySelector('a[href="/login"]') : null;

        if (!loginLink) { // Assume logged in
            const profileLoadedSuccessfully = await fetchTopItems();
            if (profileLoadedSuccessfully) {
                fetchRecommendations();
            } else {
                // Profile loading failed (not due to login_required, as that redirects)
                // or had no data. Still, we might not want to proceed to recs or show an error for recs yet.
                // For now, if profile has an error message, recs will just not load.
                // If profile just had "no data", recs will try to load.
                // Consider if specific error for recs area is needed if profile fails.
                // For now, if profile fails, the error remains in the profile section.
                // We should hide the rec loading message if profile failed and we won't fetch recs.
                if (loadingRecommendationsMessage) loadingRecommendationsMessage.style.display = 'none';
                 if (cardContainer && !profileLoadedSuccessfully) { // If profile had a critical error
                    cardContainer.innerHTML = '<p>Profile data could not be loaded, recommendations unavailable.</p>';
                    if(likeButton) likeButton.style.display = 'none';
                    if(dislikeButton) dislikeButton.style.display = 'none';
                 } else { // Profile loaded (maybe with "no data" message) but no critical error
                    fetchRecommendations();
                 }

            }
        } else { // Not logged in
            clearContainer(profileDetailsContainer, loadingProfileMessage);
            profileDetailsContainer.innerHTML = '<p>Login to see your top artists.</p>';

            clearContainer(cardContainer, loadingRecommendationsMessage);
            cardContainer.innerHTML = '<p>Login to get song recommendations.</p>';
            if(likeButton) likeButton.style.display = 'none';
            if(dislikeButton) dislikeButton.style.display = 'none';
        }
    }

    initializeApp();
});

// --- Dynamic CSS (can be moved to style.css) ---
// Removed from here as it's now assumed to be in style.css
// Ensure your style.css has the necessary rules for .artist-list, .card elements, etc.
// For example:
/*
.artist-list { list-style-type: none; padding: 0; }
.artist-item { display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 4px; }
.artist-item img { border-radius: 50%; margin-right: 15px; }
.artist-info a { font-weight: bold; color: #1DB954; text-decoration: none; }
.artist-info a:hover { text-decoration: underline; }
.artist-info .genres { font-size: 0.9em; color: #666; margin-top: 4px; }
.artist-image-placeholder { width: 50px; height: 50px; background-color: #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7em; color: white; margin-right: 15px; }

.card .album-art { width: 100%; max-width: 250px; height: auto; border-radius: 8px; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;}
.album-art-placeholder { width: 200px; height: 200px; background-color: #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px auto; color: #777; font-size: 0.9em; }
.card .artist-name { font-size: 1em; color: #555; margin-bottom: 10px; }
.card .track-preview { width: 100%; max-width: 280px; margin-top:10px; margin-bottom: 15px; }
.card .spotify-link { color: #1DB954; text-decoration: none; font-weight: bold; }
.card .spotify-link:hover { text-decoration: underline; }
*/
