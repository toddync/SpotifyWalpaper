const { exec } = require('node:child_process');
const CANVAS = require("@napi-rs/canvas");
const dotenv = require('dotenv');
const axios = require("axios");
const sharp = require('sharp');
const fs = require("node:fs");
const { id, secret, refresh_token } = dotenv.config().parsed;

const screen = { width: 1024, height: 728 }; // Define the screen resolution for the canvas
var token, lastSong; // Variables to store the current token and the last song's image URL

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function start() {
    await refreshToken(); // Get an initial access token
    setInterval(refreshToken, (35 * 60) * 1000); // Refresh token every 35 minutes (Spotify tokens expire after 1 hour)
    keep(); // Continuously fetch the current song and update the wallpaper
}

// Function to get the currently playing song's album art
async function get_img_link() {
    let e = '';
    try {
        // Make a request to Spotify API to get the currently playing track
        e = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {} // Ignore errors if the request fails

    if (e != '' && e.status == 200) {
        try {
            show(e.data.item.album.images[1]);
        } catch (error) {} // Ignore errors if something goes wrong with image processing
    }
}

// Function to update the desktop wallpaper with the album art
async function show(img) {
    // If the current song is the same as the last song, do nothing
    if (img.url == lastSong) return;
    lastSong = img.url;
    let now = Date.now(); // Get the current timestamp to use in the image file name

    // Create a new canvas to draw on
    let canvas = CANVAS.createCanvas(screen.width, screen.height);
    let ctx = canvas.getContext('2d'); // Get the 2D drawing context

    // Load the album art image
    let image = await CANVAS.loadImage(img.url);

    // Draw the album art on the canvas, stretched to fit the screen
    ctx.drawImage(image, 0, 0, screen.width, screen.height);

    // Create a blurred version of the album art using Sharp
    let blurredImage = await CANVAS.loadImage(await sharp(await canvas.encode("png")).blur(10).toBuffer());

    // Draw the blurred image on the canvas as a background
    ctx.drawImage(blurredImage, 0, 0, screen.width, screen.height);

    // Draw the original album art in the center of the screen
    ctx.drawImage(image, screen.width / 2 - img.width / 2, screen.height / 2 - img.height / 2, img.width, img.height);

    // Save the canvas as a PNG file in the 'images' folder
    fs.writeFileSync(`images/background${now}.png`, await canvas.encode("png"));

    // Try to change the terminal color scheme using `wal` (Linux theme manager)
    try { exec(`wal -i images/background${now}.png`); } catch (e) {}

    // Use `gsettings` to set the desktop wallpaper (works on GNOME desktops)
    exec(`gsettings set org.gnome.desktop.background picture-uri file:${__dirname + `/images/background${now}.png`}`);
    exec(`gsettings set org.gnome.desktop.background picture-uri-dark file:${__dirname + `/images/background${now}.png`}`);

    // Clean up old images in the 'images' folder, leaving only the current background
    fs.readdirSync("images/").forEach(f => (f != `background${now}.png`) && exec(`rm images/${f}`) );
}

// Function to refresh the Spotify access token using the refresh token
async function refreshToken() {
    let e = await axios.post("https://accounts.spotify.com/api/token", {
        grant_type: "refresh_token",
        refresh_token: refresh_token
    }, {
        headers: {
            Authorization: 'Basic ' + btoa(`${id}:${secret}`), // Base64-encode the client ID and secret
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    if (e.status == 200) token = e.data.access_token;
    else refresh_token(); // Retry token refresh if it fails
}

async function keep() {
    while (true) {
        await sleep(500);
        get_img_link();
    }
}

start();
