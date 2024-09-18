const { execSync} = require('node:child_process');
const { default: axios } = require('axios');
const dotenv = require('dotenv');
const prompt = require("prompt-sync")();
const { id, secret } = dotenv.config().parsed;

(async () => {
    let scope = "user-read-currently-playing", red = "http://localhost:8080/"

    console.log(`go to this link:\n https://accounts.spotify.com/authorize?response_type=code&client_id=${id}&scope=${scope}&redirect_uri=${red} \n`)

    let code = prompt("the code: ")
    execSync("clear")

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('redirect_uri', red);
    params.append('grant_type', 'authorization_code');

    let e = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(id + ':' + secret).toString("base64"))
        }
    });

    console.log("\n\nyour token: ", e.data.refresh_token);
})()
