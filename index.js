const {
    execSync
} = require('node:child_process');
const fs = require("node:fs");
const CANVAS = require("@napi-rs/canvas");
const axios = require("axios");
const dotenv = require('dotenv');

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const {
    id,
    secret,
    refresh_token
} = dotenv.config().parsed;
var token, lastSong;

const screen = {
    width: 1024,
    height: 728
};

async function start() {
    await refreshToken();
    setInterval(refreshToken, (35 * 60) * 1000);
    keep();
}

async function get_img_link() {
    let e = ''
    
    try {
        e = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {}

    if (e != '' && e.status == 200) {
        show(e.data.item.album.images[1]);
    }
}

async function show(img) {
    if (img.url == lastSong) return;

    lastSong = img.url;
    let now = Date.now();

    execSync("notify-send 'Changing wallpaper'");

    let canvas = CANVAS.createCanvas(screen.width, screen.height);
    let ctx = canvas.getContext('2d');

    let image = await CANVAS.loadImage(img.url);

    ctx.drawImage(image, 0, 0, screen.width, screen.height);
    fs.writeFileSync(`images/background_tmp${now}.png`, await canvas.encode("png"));

    execSync(`magick convert images/background_tmp${now}.png -blur 0x20 images/background_tmp2${now}.png`);

    let _image = await CANVAS.loadImage(`images/background_tmp2${now}.png`);
    ctx.drawImage(_image, 0, 0, screen.width, screen.height);

    ctx.drawImage(image, screen.width / 2 - img.width / 2, screen.height / 2 - img.height / 2, img.width, img.height);
    fs.writeFileSync(`images/background${now}.png`, await canvas.encode("png"));

    execSync(`feh  --bg-fill images/background${now}.png`);
    execSync(`wal -i images/background${now}.png`);
    execSync(`rm images/*${now}.png`);
    execSync('pywalfox update');
}

async function refreshToken() {
    let e = await axios.post("https://accounts.spotify.com/api/token", {
        grant_type: "refresh_token",
        refresh_token: refresh_token
    }, {
        headers: {
            Authorization: 'Basic ' + btoa(`${id}:${secret}`),
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    if (e.status == 200) {
        token = e.data.access_token;
    } else {
        refresh_token();
    }
}

async function keep() {
    while (true) {
        await sleep(1000);
        get_img_link();
    }
}

start();