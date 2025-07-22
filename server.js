const tokenData = JSON.parse(fs.readFileSync("tokenStore.json", "utf8"));
const accessToken = tokenData.data?.jwtToken; // Adjust this if structure differs



app.get('/price', async (req, res) => {
  const symbol = req.query.symbol?.toUpperCase();
  if (!symbol) return res.status(400).json({ error: "Missing symbol parameter" });

  let tokenData;
  try {
    tokenData = JSON.parse(fs.readFileSync("tokenStore.json", "utf8"));
  } catch {
    return res.status(500).json({ error: "Missing or invalid tokenStore.json" });
  }

  const endpoint = "https://apiconnect.angelbroking.com/rest/secure/angelbroking/market/v1/quote/";
  const headers = {
    Authorization: `Bearer ${tokenData.access_token}`,
    "Content-Type": "application/json"
  };

  // You'll need to look up the NSE symbolToken for your symbol
  const symbolToken = "SOME_TOKEN"; // TODO: implement /instruments lookup

  const body = {
    mode: "LTP",
    exchangeTokens: { NSE: [ symbolToken ] }
  };

  try {
    const resp = await axios.post(endpoint, body, { headers });
    const fetched = resp.data.data.fetched[0];
    res.json({
      symbol,
      ltp: fetched.ltp,
      high: fetched.high,
      low: fetched.low
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
