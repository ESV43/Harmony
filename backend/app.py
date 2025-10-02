import requests
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from ytmusicapi import YTMusic
from urllib.parse import quote
import yt_dlp

# --- Initialization ---
app = Flask(__name__)
CORS(app) 
ytmusic = YTMusic()
stream_cache = {}

# --- Helper Functions ---

def find_on_saavn(song_title, artist_name):
    """
    Searches JioSaavn and returns a dictionary with stream details if found.
    """
    try:
        cleaned_title = re.sub(r'\(.*?\)|\[.*?\]', '', song_title).strip()
        primary_artist = artist_name.split(',')[0].strip()
        print(f"--- Saavn Search: Cleaned Title='{cleaned_title}', Artist='{primary_artist}' ---")
        search_query = quote(f"{cleaned_title} {primary_artist}")
        search_url = f"https://saavn.dev/api/search/songs?query={search_query}&limit=1"
        response = requests.get(search_url, timeout=7)
        response.raise_for_status()
        results = response.json().get('data', {}).get('results', [])
        if not results: return None

        download_urls = results[0].get('downloadUrl', [])
        for url_info in download_urls:
            if url_info.get('quality') == '320kbps':
                return {
                    "url": url_info.get('url').replace('http://', 'https://'),
                    "sourceInfo": "JioSaavn @ 320kbps"
                }
        return None # Return None if 320kbps is not explicitly found
    except Exception as e:
        print(f"--- Saavn Error: {e} ---"); return None

def get_yt_stream_details(video_id, quality='best'):
    """
    Uses yt-dlp to get stream details for a given quality.
    """
    try:
        ydl_opts = {'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            audio_formats = [f for f in info.get('formats', []) if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
            if not audio_formats:
                audio_formats = [f for f in info.get('formats', []) if f.get('acodec') != 'none']
            if not audio_formats: return None

            if quality == 'best':
                selected_format = max(audio_formats, key=lambda x: x.get('abr', 0) or x.get('bitrate', 0))
            elif quality == 'datasaver':
                selected_format = min(audio_formats, key=lambda x: x.get('abr', 0) or x.get('bitrate', 0))
            else:
                return None

            bitrate = selected_format.get('abr') or selected_format.get('bitrate', 0)
            return {
                "url": selected_format['url'],
                "sourceInfo": f"YouTube (yt-dlp) @ ~{int(bitrate)}kbps"
            }
    except Exception as e:
        print(f"--- yt-dlp Error: {e} ---"); return None

# --- API Routes ---

@app.route('/api/search', methods=['GET'])
def search_music():
    query = request.args.get('q')
    if not query: return jsonify({"error": "Query parameter 'q' is required"}), 400
    try:
        search_results = ytmusic.search(query, filter='songs', limit=20)
        formatted_results = []
        for song in search_results:
            formatted_results.append({
                'videoId': song.get('videoId'), 'title': song.get('title'),
                'artists': [a['name'] for a in song.get('artists', []) if 'name' in a],
                'album': song.get('album', {}).get('name') if song.get('album') else "Unknown Album",
                'duration': song.get('duration'), 'duration_seconds': song.get('duration_seconds'),
                'thumbnailUrl': song.get('thumbnails', [{}])[-1].get('url') if song.get('thumbnails') else None
            })
        return jsonify(formatted_results)
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route('/api/stream', methods=['GET'])
def get_stream():
    video_id = request.args.get('videoId'); quality = request.args.get('quality', 'best'); title = request.args.get('title'); artist = request.args.get('artist')
    if not all([video_id, title, artist]): return jsonify({"error": "All song metadata is required"}), 400

    cache_key = f"{video_id}-{quality}"
    if cache_key in stream_cache: return jsonify(stream_cache[cache_key])

    stream_details = None

    if quality == 'high':
        print(f"--- User requested HIGH. Trying JioSaavn ONLY for '{title}' ---")
        stream_details = find_on_saavn(title, artist)
    elif quality in ['best', 'datasaver']:
        print(f"--- User requested '{quality}' quality. Trying YouTube with yt-dlp... ---")
        stream_details = get_yt_stream_details(video_id, quality)
            
    if stream_details and 'url' in stream_details:
        response_data = {
            "streamUrl": stream_details['url'],
            "sourceInfo": stream_details['sourceInfo']
        }
        stream_cache[cache_key] = response_data
        print(f"--- Success: Found stream. Source: {stream_details['sourceInfo']} ---")
        return jsonify(response_data)
    else:
        print(f"--- FAILURE: Could not find stream for '{title}' with quality '{quality}'. ---")
        return jsonify({"error": "Stream not found."}), 404

# ... (Lyrics endpoint remains the same) ...
@app.route('/api/lyrics', methods=['GET'])
def get_lyrics():
    title = request.args.get('title'); artist = request.args.get('artist'); album = request.args.get('album'); duration = request.args.get('duration_seconds')
    if not all([title, artist, album, duration]): return jsonify({"error": "Missing required parameters"}), 400
    try:
        params = { 'track_name': title, 'artist_name': artist, 'album_name': album, 'duration': int(duration) }; response = requests.get("https://lrclib.net/api/search", params=params, timeout=5); response.raise_for_status(); results = response.json()
        if results and 'syncedLyrics' in results[0] and results[0]['syncedLyrics']: return jsonify({"lyrics": results[0]['syncedLyrics']})
        else: return jsonify({"error": "Synced lyrics not found."}), 404
    except Exception as e: print(f"Error fetching lyrics: {e}"); return jsonify({"error": "Failed to fetch lyrics."}), 500

# --- Main Execution ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)
