const { execSync } = require('node:child_process');
const { default: axios } = require('axios');
const dotenv = require('dotenv');
const prompt = require("prompt-sync")();

const { id, secret } = dotenv.config().parsed;

(async () => {
    let scope = "user-read-currently-playing"; // Request permission to read the currently playing song
    let red = "http://localhost:8080/"; // Redirect URI, this needs to be registered in the Spotify developer dashboard

    // Display a message to the user to open the authorization URL in their browser
    console.log(`go to this link:\n https://accounts.spotify.com/authorize?response_type=code&client_id=${id}&scope=${scope}&redirect_uri=${red} \n`);

    // Prompt the user to input the authorization code they received after visiting the URL
    let code = prompt("the code: ");

    // Create the parameters for the POST request to exchange the authorization code for a token
    const params = new URLSearchParams();
    params.append('code', code); // The authorization code received from the user
    params.append('redirect_uri', red); // The same redirect URI used in the authorization request
    params.append('grant_type', 'authorization_code'); // Specify the grant type as authorization code

    // Make a POST request to Spotify's token endpoint to exchange the authorization code for an access token
    let e = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (Buffer.from(id + ':' + secret).toString("base64")) // Base64-encoded client ID and secret for authentication
        }
    });

    // Display the refresh token returned from Spotify to the user
    console.log("\n\nyour token: ", e.data.refresh_token);
})();
