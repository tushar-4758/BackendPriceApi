const express = require("express");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Redirect to Angel One login
app.get("/login", (req, res) => {
    const redirectUrl = `https://smartapi.angelbroking.com/publisher-login?api_key=${process.env.API_KEY}&redirect_uri=${process.env.REDIRECT_URL}`;
    res.redirect(redirectUrl);
});

// Callback URL where Angel One will redirect with code
app.get("/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.send("Code not found in query!");

    try {
        const response = await axios.post("https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByCode", {
            code: code,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URL
        });

        const tokenData = response.data;
        fs.writeFileSync("tokenStore.json", JSON.stringify(tokenData, null, 2));
        res.send("✅ Token fetched and saved successfully.");
    } catch (err) {
        console.error(err.response?.data || err.message);
        res.send("❌ Error fetching token.");
    }
});
app.get('/', (req, res) => {
  res.send('API is running!bro');
});


// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
