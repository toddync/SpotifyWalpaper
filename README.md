# SpotifyWalpaper
 a simple node.js code that syncs your walpaper with the album image of the currently playing music on your spotify

 you need to have `feh` and `imagemagick` installed on your maachine to work, and optionally you can use `pywal` and `pywalfox` to also sync your terminal color scheme and your firefox color scheme with the wallpaper colors.

  to start you first need to register an spotify app, grab the client id and the client secret and them proceed to get your first refresh token trough the documentation, then you just put everything in the `_.env` file, rename it to `.env`, and run `node .`