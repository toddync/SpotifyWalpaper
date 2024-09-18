const { exec } = require('node:child_process');
const CANVAS = require("@napi-rs/canvas");
const dotenv = require('dotenv');
const axios = require("axios");
const sharp = require('sharp');
const fs = require("node:fs");

const { id, secret, refresh_token } = dotenv.config().parsed;
const screen = {
    width: 1024,
    height: 728
};
var token, lastSong;

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function start() {
    await refreshToken();
    setInterval(refreshToken, (35 * 60) * 1000);
    keep();
}

async function get_img_link() {
    let e = ''
    try {
        e = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {}

    if (e != '' && e.status == 200) {
        try {
            show(e.data.item.album.images[1]);
        } catch (error) {}
    }
}

async function show(img) {
    if (img.url == lastSong) return;

    lastSong = img.url;
    let now = Date.now();
    let canvas = CANVAS.createCanvas(screen.width, screen.height);
    let ctx = canvas.getContext('2d');
    let image = await CANVAS.loadImage(img.url);
    ctx.drawImage(image, 0, 0, screen.width, screen.height);
    let blurredImage = await CANVAS.loadImage(await sharp(await canvas.encode("png")).blur(10).toBuffer());

    ctx.drawImage(blurredImage, 0, 0, screen.width, screen.height);
    ctx.drawImage(image, screen.width / 2 - img.width / 2, screen.height / 2 - img.height / 2, img.width, img.height);
    fs.writeFileSync(`images/background${now}.png`, await canvas.encode("png"));

    try{exec(`wal -i images/background${now}.png`)} catch(e){};

    exec(`gsettings set org.gnome.desktop.background picture-uri file:${__dirname + `/images/background${now}.png`}`);
    exec(`gsettings set org.gnome.desktop.background picture-uri-dark file:${__dirname + `/images/background${now}.png`}`);

    fs.readdirSync("images/").forEach(f => {
        if(f != `background${now}.png`) exec(`rm images/${f}`);
    })
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

    if (e.status == 200) token = e.data.access_token;
    else refresh_token();
}

async function keep() {
    while (true) {
        await sleep(1000);
        get_img_link();
    }
}

start();
