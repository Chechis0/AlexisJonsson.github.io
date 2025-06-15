import pytest
import json
import time
from unittest.mock import MagicMock, patch

# Import the app instance from your application
# Ensure your app.py can be imported like this.
# You might need to adjust imports within your app.py if it's not structured as a package.
from music_tinder_app import app as flask_app_instance

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    # Configure the app for testing
    flask_app_instance.config.update({
        "TESTING": True,
        "SPOTIPY_CLIENT_ID": "test_client_id",
        "SPOTIPY_CLIENT_SECRET": "test_client_secret",
        "SPOTIPY_REDIRECT_URI": "http://localhost:5000/callback",
        "SECRET_KEY": "test_secret_key" # Important for session management
    })
    # Other setup can go here

    yield flask_app_instance

    # Clean up / reset resources if necessary
    # For this app, session clearing might be handled by client context or specific tests

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()

# --- Mock Data ---
def mock_token_data():
    return {
        'access_token': 'mock_access_token',
        'refresh_token': 'mock_refresh_token',
        'expires_in': 3600,
        'expires_at': int(time.time()) + 3600,
        'scope': 'user-top-read playlist-modify-public user-library-read'
    }

mock_artist_item = {
    'name': 'Test Artist',
    'images': [{'url': 'http://example.com/image.jpg'}],
    'genres': ['test-genre'],
    'external_urls': {'spotify': 'http://example.com/artist'}
}

mock_track_item = {
    'id': 'test_track_123',
    'name': 'Test Track',
    'artists': [{'name': 'Test Artist'}],
    'album': {'images': [{'url': 'http://example.com/album.jpg'}]},
    'preview_url': 'http://example.com/preview.mp3',
    'external_urls': {'spotify': 'http://example.com/track'}
}

# --- Test Cases ---

def test_login_route(client):
    """Test the /login route redirects to Spotify authorization."""
    response = client.get('/login')
    assert response.status_code == 302
    assert 'accounts.spotify.com/authorize' in response.location

def test_callback_route_success(client, mocker):
    """Test /callback with a successful code exchange."""
    # Patch the get_access_token method of SpotifyOAuth
    mocker.patch('spotipy.oauth2.SpotifyOAuth.get_access_token', return_value=mock_token_data())

    response = client.get('/callback?code=mock_code')

    assert response.status_code == 302
    assert response.location == '/' # Should redirect to index/home
    with client.session_transaction() as sess:
        assert 'token_info' in sess
        assert sess['token_info']['access_token'] == 'mock_access_token'

def test_callback_route_error(client):
    """Test /callback with an error parameter from Spotify."""
    response = client.get('/callback?error=access_denied')
    assert response.status_code == 302
    assert '/?error=access_denied' in response.location # Redirects to index with error

def test_top_items_unauthenticated(client):
    """Test /top_items when user is not authenticated."""
    response = client.get('/top_items')
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['error'] == 'Not authenticated or token refresh failed'
    assert data.get('login_required') is True

def test_top_items_authenticated(client, mocker):
    """Test /top_items when user is authenticated."""
    mocker.patch('music_tinder_app.app.get_token', return_value=mock_token_data())
    mock_sp_top_artists = mocker.patch('spotipy.Spotify.current_user_top_artists',
                                       return_value={'items': [mock_artist_item]})

    response = client.get('/top_items')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'artists' in data
    assert len(data['artists']) == 1
    assert data['artists'][0]['name'] == 'Test Artist'
    mock_sp_top_artists.assert_called_once()

def test_recommendations_unauthenticated(client):
    """Test /recommendations when user is not authenticated."""
    response = client.get('/recommendations')
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data.get('login_required') is True

def test_recommendations_authenticated_success(client, mocker):
    """Test /recommendations successful path."""
    mocker.patch('music_tinder_app.app.get_token', return_value=mock_token_data())
    mocker.patch('spotipy.Spotify.current_user_top_artists',
                 return_value={'items': [{'id': 'seed_artist_id', **mock_artist_item}]})
    mock_sp_recommendations = mocker.patch('spotipy.Spotify.recommendations',
                                          return_value={'tracks': [mock_track_item]})

    response = client.get('/recommendations')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'tracks' in data
    assert len(data['tracks']) == 1
    assert data['tracks'][0]['name'] == 'Test Track'
    assert data['tracks'][0]['preview_url'] is not None
    mock_sp_recommendations.assert_called_once()

def test_recommendations_authenticated_no_preview_urls(client, mocker):
    """Test /recommendations when returned tracks have no preview_url."""
    mocker.patch('music_tinder_app.app.get_token', return_value=mock_token_data())
    mocker.patch('spotipy.Spotify.current_user_top_artists',
                 return_value={'items': [{'id': 'seed_artist_id', **mock_artist_item}]})

    # Mock track without preview_url
    track_no_preview = {**mock_track_item, 'preview_url': None}
    mocker.patch('spotipy.Spotify.recommendations', return_value={'tracks': [track_no_preview]})

    response = client.get('/recommendations')
    assert response.status_code == 404 # As per current app logic
    data = json.loads(response.data)
    assert 'No recommendations with playable previews found' in data['error']

def test_like_track_unauthenticated(client):
    """Test /like_track when user is not authenticated."""
    response = client.post('/like_track', json={'track_id': 'test_track_123'})
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data.get('login_required') is True

def test_like_track_authenticated_valid(client, mocker):
    """Test /like_track with valid authenticated request."""
    mocker.patch('music_tinder_app.app.get_token', return_value=mock_token_data())
    mock_sp_me = mocker.patch('spotipy.Spotify.me', return_value={'id': 'test_user'})

    response = client.post('/like_track', json={'track_id': 'test_track_123'})

    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'success'
    assert 'Track test_track_123 preference noted' in data['message']
    mock_sp_me.assert_called_once() # Ensure we tried to get user info for logging

def test_like_track_authenticated_missing_track_id(client, mocker):
    """Test /like_track with authenticated user but missing track_id in payload."""
    mocker.patch('music_tinder_app.app.get_token', return_value=mock_token_data())

    response = client.post('/like_track', json={}) # Empty JSON payload

    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Missing track_id in request' in data['error']

def test_logout_route(client):
    """Test the /logout route."""
    # First, simulate a login to set something in the session
    with client.session_transaction() as sess:
        sess['token_info'] = mock_token_data()
        sess['some_other_key'] = 'test_value'

    # Ensure session has data before logout
    with client.session_transaction() as sess:
        assert 'token_info' in sess
        assert 'some_other_key' in sess

    response = client.get('/logout')
    assert response.status_code == 302
    assert response.location == '/' # Redirects to index

    # Ensure session is cleared after logout
    with client.session_transaction() as sess:
        assert 'token_info' not in sess
        assert 'some_other_key' not in sess # Check if session.clear() worked broadly

def test_index_route_logged_out(client):
    """Test the index route when logged out."""
    response = client.get('/')
    assert response.status_code == 200
    assert b"You are not logged in. Please login to continue." in response.data
    assert b"Login with Spotify" in response.data # Check for login link

def test_index_route_logged_in(client, mocker):
    """Test the index route when logged in."""
    # Mock get_token to simulate a logged-in state
    mocker.patch('music_tinder_app.app.get_token', return_value=mock_token_data())

    response = client.get('/')
    assert response.status_code == 200
    assert b"You are logged in." in response.data
    assert b"Logout" in response.data # Check for logout link
    # Check that the status message doesn't show an error by default
    assert b"error" not in response.data.lower()

def test_index_route_with_error_message(client):
    """Test the index route when an error message is passed via query param."""
    response = client.get('/?error=OopsSomethingWentWrong')
    assert response.status_code == 200
    assert b"OopsSomethingWentWrong" in response.data
    # Should still show "not logged in" if no token
    assert b"You are not logged in. Please login to continue." in response.data
