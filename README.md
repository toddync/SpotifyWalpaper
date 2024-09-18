# SpotifyWallpaper

**SpotifyWallpaper** is a simple Node.js tool that synchronizes your desktop wallpaper with the album art of the currently playing track on Spotify.

### Work in Progress (WIP)

Currently, **SpotifyWallpaper** works only on Linux, and not all distributions are supported out of the box. This is due to the lack of a universal CLI tool for setting wallpapers across all desktop environments (DEs). The current implementation is tailored for **GNOME**, but you can easily adapt it for your DE by modifying lines 55 and 56 of `index.js` to use the appropriate wallpaper command for your system.

You can also tweak the blur effect applied to the wallpaper by adjusting the value on line 47 (`blur(10)`). Lower values will reduce the blur. the values should range from `0.3` to `1000`

### Prerequisites (Optional)

- **pywal**: Syncs your terminal and VSCode (if you have the Wal Theme extension) color scheme with the wallpaper.

### Setup

1. **Register a Spotify App**:
   [Register a new application on Spotify's developer portal](https://developer.spotify.com/dashboard/applications) to obtain your **Client ID** and **Client Secret**.
   Add `http://localhost:8080/` as one of the redirect URIs for your app in the Spotify dashboard, and include the credentials in your `_.env` file.
2. **Get the Refresh Token**:
   To retrieve your refresh token:

   - Run the `getToken.js` file.
   - Open the URL that appears in your terminal.
   - After being redirected, copy the code from the URL (the part after `code=`) and paste it back into the terminal. You'll then receive the refresh token to add to your `_.env` file.

   ```bash
   node getToken.js
   ```
3. **Complete Environment Variables Configuration**:
   Rename the `_.env` file to `.env`.
4. **Run the Application**:
   After setting everything up, run the following command to start the synchronization:

   ```bash
   node .
   ```

Your wallpaper will now automatically update with the album art of the song you're currently listening to on Spotify!
