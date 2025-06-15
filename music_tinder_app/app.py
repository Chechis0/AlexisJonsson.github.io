import os
from flask import Flask, redirect, request, session, url_for, render_template
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import time

# Load configuration
try:
    import config
    SPOTIPY_CLIENT_ID = config.SPOTIPY_CLIENT_ID
    SPOTIPY_CLIENT_SECRET = config.SPOTIPY_CLIENT_SECRET
    SPOTIPY_REDIRECT_URI = config.SPOTIPY_REDIRECT_URI
except ImportError:
    # Fallback to environment variables if config.py is not found or contains no values
    SPOTIPY_CLIENT_ID = os.environ.get('SPOTIPY_CLIENT_ID')
    SPOTIPY_CLIENT_SECRET = os.environ.get('SPOTIPY_CLIENT_SECRET')
    SPOTIPY_REDIRECT_URI = os.environ.get('SPOTIPY_REDIRECT_URI')

    if not all([SPOTIPY_CLIENT_ID, SPOTIPY_CLIENT_SECRET, SPOTIPY_REDIRECT_URI]):
        print("CRITICAL: Spotify API credentials are not configured. Please set them in config.py or environment variables.")
        # You might want to exit or raise an exception here depending on desired behavior
        # For now, it will likely fail when trying to use SpotifyOAuth

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(64) # For session management

# Spotify OAuth scope
SCOPE = 'user-top-read playlist-modify-public user-library-read'

# Helper to get SpotifyOAuth object
def get_spotify_oauth():
    # Note: In a production app, you might want to cache this object
    # or ensure SPOTIPY_CLIENT_ID etc. are valid before creating it.
    return SpotifyOAuth(
        client_id=SPOTIPY_CLIENT_ID,
        client_secret=SPOTIPY_CLIENT_SECRET,
        redirect_uri=SPOTIPY_REDIRECT_URI,
        scope=SCOPE,
        # cache_path=".spotifycache" # Optional: for caching tokens locally
    )

# Helper function to check and refresh token
def get_token():
    token_info = session.get('token_info', None)
    if not token_info:
        return None

    now = int(time.time())
    is_expired = token_info.get('expires_at', 0) - now < 60  # Check if expired or expires in next 60s

    if is_expired:
        sp_oauth = get_spotify_oauth()
        try:
            new_token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            session['token_info'] = new_token_info
            app.logger.info("Token refreshed successfully.")
            return new_token_info
        except Exception as e:
            app.logger.error(f"Error refreshing token: {e}")
            # Potentially clear session or redirect to login if refresh fails
            session.clear()
            return None
    return token_info

@app.route('/login')
def login():
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/callback')
def callback():
    sp_oauth = get_spotify_oauth()
    # session.clear() # Generally, don't clear the whole session here.
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        app.logger.error(f"Error from Spotify auth: {error}")
        return redirect(url_for('index', error=error))

    if code:
        try:
            # Request token
            token_info = sp_oauth.get_access_token(code, check_cache=False)
            session['token_info'] = token_info
            app.logger.info("Token obtained successfully.")
            return redirect(url_for('index'))
        except Exception as e:
            app.logger.error(f"Error getting token: {e}")
            return redirect(url_for('index', error="Error obtaining token"))

    return redirect(url_for('index', error="Unknown error during callback"))

@app.route('/')
def index():
    token_info = get_token() # Use get_token to ensure it's valid or refreshed
    status_message = request.args.get('error') # Get error from query params
    if not status_message:
        status_message = "You are logged in." if token_info else "You are not logged in. Please login to continue."

    # Pass the error to the template if it exists
    return render_template('index.html', token_info=token_info, status=status_message)


@app.route('/top_items')
def top_items():
    token_info = get_token()
    if not token_info:
        return {'error': 'Not authenticated or token refresh failed'}, 401

    try:
        sp = spotipy.Spotify(auth=token_info['access_token'])
        top_artists = sp.current_user_top_artists(limit=10, time_range='medium_term')

        artists_data = []
        for artist in top_artists.get('items', []):
            artists_data.append({
                'name': artist['name'],
                'images': artist['images'],
                'genres': artist['genres'],
                'external_urls': artist['external_urls']['spotify']
            })
        return {'artists': artists_data}
    except spotipy.SpotifyException as e:
        app.logger.error(f"Spotify API error: {e}")
        # Check for specific error codes, e.g., if token is invalid despite refresh
        if e.http_status == 401:
             session.clear() # Clear session if token is definitively invalid
             return {'error': 'Spotify authentication error. Please login again.', 'login_required': True}, 401
        return {'error': f'Error fetching data from Spotify: {str(e)}'}, 500
    except Exception as e:
        app.logger.error(f"An unexpected error occurred in /top_items: {e}")
        return {'error': 'An unexpected error occurred.'}, 500

@app.route('/recommendations')
def recommendations():
    token_info = get_token()
    if not token_info:
        return {'error': 'Not authenticated or token refresh failed', 'login_required': True}, 401

    try:
        sp = spotipy.Spotify(auth=token_info['access_token'])

        # 1. Fetch top artists to use as seeds
        top_artists_response = sp.current_user_top_artists(limit=5, time_range='medium_term')

        if not top_artists_response or not top_artists_response.get('items'):
            return {'error': 'Could not fetch top artists to seed recommendations. Listen to more music!'}, 404 # Not found or no content

        seed_artist_ids = [artist['id'] for artist in top_artists_response['items']]

        if not seed_artist_ids:
             return {'error': 'No artist IDs found from your top artists.'}, 404

        # 2. Get recommendations based on these seed artists
        # You can also add seed_genres (e.g., from top artists' genres) or seed_tracks
        recommendations_response = sp.recommendations(seed_artists=seed_artist_ids, limit=20) # Get a few more to allow for filtering if needed

        if not recommendations_response or not recommendations_response.get('tracks'):
            return {'error': 'No recommendations found based on your top artists.'}, 404

        recommended_tracks = []
        for track in recommendations_response['tracks']:
            if not track: continue # Skip if a track object is None for some reason

            # Extract relevant information
            track_name = track.get('name')
            artists = ', '.join([artist['name'] for artist in track.get('artists', [])])
            album_images = track.get('album', {}).get('images', [])
            album_art_url = album_images[0]['url'] if album_images else None # Get the first image (usually largest)
            preview_url = track.get('preview_url')
            spotify_url = track.get('external_urls', {}).get('spotify')
            track_id = track.get('id')

            # We only want tracks with a preview URL for our app's purpose
            if preview_url:
                recommended_tracks.append({
                    'id': track_id,
                    'name': track_name,
                    'artists': artists,
                    'album_art_url': album_art_url,
                    'preview_url': preview_url,
                    'spotify_url': spotify_url
                })

        if not recommended_tracks:
            return {'error': 'No recommendations with playable previews found. Try again later or broaden your music taste!'}, 404

        return {'tracks': recommended_tracks}

    except spotipy.SpotifyException as e:
        app.logger.error(f"Spotify API error in /recommendations: {e}")
        if e.http_status == 401:
            session.clear()
            return {'error': 'Spotify authentication error. Please login again.', 'login_required': True}, 401
        return {'error': f'Error fetching recommendations from Spotify: {str(e)}'}, e.http_status or 500
    except Exception as e:
        app.logger.error(f"An unexpected error occurred in /recommendations: {e}")
        return {'error': 'An unexpected error occurred while fetching recommendations.'}, 500

@app.route('/like_track', methods=['POST'])
def like_track():
    token_info = get_token()
    if not token_info:
        return {'error': 'Not authenticated or token refresh failed', 'login_required': True}, 401

    try:
        data = request.get_json()
        if not data or 'track_id' not in data:
            return {'error': 'Missing track_id in request'}, 400

        track_id = data['track_id']

        # For now, we just log this.
        # In a real app, you'd get user ID (e.g., from sp.me() or a stored user ID)
        # and save this preference to a database.
        sp = spotipy.Spotify(auth=token_info['access_token'])
        try:
            user_profile = sp.me()
            user_id = user_profile['id'] if user_profile else 'unknown_user'
            app.logger.info(f"User '{user_id}' liked track: {track_id}")
        except spotipy.SpotifyException as se:
            app.logger.error(f"Could not fetch user profile while liking track: {se}")
            app.logger.info(f"Track liked (user unknown): {track_id}")


        # Future: Add to a user's "Liked Songs" playlist or save to database
        # Example: sp.current_user_saved_tracks_add(tracks=[track_id])
        # This requires 'user-library-modify' scope. Our current scope is:
        # SCOPE = 'user-top-read playlist-modify-public user-library-read'
        # So, if we wanted to add to library, we'd need to add 'user-library-modify'.
        # For creating/adding to a playlist, we'd need 'playlist-modify-public' or 'playlist-modify-private'.

        return {'status': 'success', 'message': f'Track {track_id} preference noted.'}, 200

    except Exception as e:
        app.logger.error(f"Error in /like_track: {e}")
        return {'error': 'An unexpected error occurred while processing like.'}, 500


@app.route('/logout')
def logout():
    session.pop('token_info', None)
    session.clear() # Clear the whole session
    app.logger.info("Session cleared, user logged out.") # Use app.logger for consistency
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True, port=5000)
