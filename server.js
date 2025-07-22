const express = require("express");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Redirect to Angel One login
app.get("/login", (req, res) => {
  const redirectUrl = `https://smartapi.angelbroking.com/publisher-login?api_key=${process.env.API_KEY}&redirect_uri=${process.env.REDIRECT_URL}`;
  res.redirect(redirectUrl);
});

// 2. Callback URL to fetch token
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Code not found in query!");

  try {
    const response = await axios.post(
      "https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByCode",
      {
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URL
      }
    );

    const tokenData = response.data;
    fs.writeFileSync("tokenStore.json", JSON.stringify(tokenData, null, 2));
    res.send("✅ Token fetched and saved successfully.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("❌ Error fetching token.");
  }
});

// 3. Default root route
app.get('/', (req, res) => {
  res.send('API is running!');
});

// 4. Price route
app.get('/price', (req, res) => {
  const symbol = req.query.symbol || 'RELIANCE';
  res.json({
    symbol,
    livePrice: 3025.45,
    high: 3050.00,
    low: 2990.50
  });
});

// 5. Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
