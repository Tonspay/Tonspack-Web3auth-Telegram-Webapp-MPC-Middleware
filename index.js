const jwt = require("jsonwebtoken");
const fs = require("fs");
const express = require("express");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");

dotenv.config();

const { TELEGRAM_BOT_NAME, TELEGRAM_BOT_TOKEN, SERVER_URL, CLIENT_URL, JWT_KEY_ID ,APP_URL,BASE_URL } = process.env;

const router= {
  wallet : BASE_URL+"wallet",
  action : BASE_URL+"action"
}
const app = express();

const privateKey = fs.readFileSync(path.resolve(__dirname, "privateKey.pem"), "utf8");

const generateJwtToken = (userData) => {

  console.log("🔥 generateJwtToken",userData)

  const payload = {
    telegram_id: userData.id,
    username: userData.username,
    sub: userData.id.toString(),
    name: userData.first_name,
    iss: "tonspack",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiration
  };

  return jwt.sign(payload, privateKey, { algorithm: "RS256", keyid: JWT_KEY_ID });
};

app.get("/", (req, res) => res.redirect(APP_URL));

app.get("/.well-known/jwks.json", (req, res) => {
  const jwks = fs.readFileSync(path.resolve(__dirname, "jwks.json"), "utf8");
  res.send(JSON.parse(jwks));
});

app.get("/jwt/:path", (req, res) => {
  let htmlContent = `
  <!DOCTYPE HTML>
  <html lang="en">
  
  <head>
  
      <title>Tonspack Webapp Auth</title>
  
      <meta id="theme-check" name="theme-color" content="#FFFFFF">
  
      <body onload="init()">
  
          <div id='content'>
  
          </div>
          <!-- Telegram -->
          <script src="https://bundle.run/buffer@6.0.3"></script>
          <script type="text/javascript">
            window.Buffer = window.Buffer ?? buffer.Buffer;
          </script>
          <script src="https://telegram.org/js/telegram-web-app.js"></script>
          <script src="https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js"></script>
          <script>
              
              async function miniapp_init() {
                  await Telegram.WebApp.ready();
                  if (window.Telegram.WebApp.initData) {
                      return window.Telegram.WebApp.initData
                  }
                  return false
              }
  


              async function init()
              {
                  const data = await miniapp_init()
                  console.log(
                      data
                  )
                  const bs64 = Buffer.from(data).toString("base64")
                  const redirect =  location.origin + '/atuh/${req.query.path}?auth='+bs64+"&tgWebAppStartParam="+window.Telegram.WebApp.initDataUnsafe.start_param
                  // console.log("🔥",redirect)
                  location.href = redirect
  
              }

          </script>
      </body>
  </head>
  
  </html>
  `;

  res.send(htmlContent);
});
// Endpoint to handle the Telegram callback
app.get("/auth/:path", async (req, res) => {

  const rawData = Buffer.from(req.query.auth,"base64").toString("utf-8")
  const path = req.query.path
  console.log(rawData,req.query)

  const data = Object.fromEntries(new URLSearchParams( rawData ));

  const udata = JSON.parse(data.user)

  data['user']=udata

  console.log(data)
  verify = tgVerfiy(TELEGRAM_BOT_TOKEN,rawData)

  console.log(verify,TELEGRAM_BOT_TOKEN)
  if(verify)
  {
    console.log(udata)

    const JWTtoken = generateJwtToken(udata);
    console.log(
      "🔥 JWTtoken",JWTtoken
    )


    if(router[path])
    {
      const redirectUrl = `${router[path]}?token=${JWTtoken}&tgWebAppStartParam=${req.query.tgWebAppStartParam}`; // Redirect back to frontend with token
      console.log(
        "🔥 redirectUrl",redirectUrl
      )
      res.redirect(redirectUrl);
    }

  }else{
    res.status(200).send({
      "code": 200,
      "data": "lol"
  })
  }
})
function tgVerfiy(apiToken, telegramInitData) {

  console.log("🐞 tgVerfiy : apiToken,telegramInitData",apiToken,telegramInitData)

  const initData = new URLSearchParams(telegramInitData);
  
  initData.sort();

  const hash = initData.get("hash");
  initData.delete("hash");

  const dataToCheck = [...initData.entries()].map(([key, value]) => key + "=" + value).join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(apiToken).digest();

  const _hash = crypto.createHmac("sha256", secretKey).update(dataToCheck).digest("hex");

  return hash === _hash;
}


app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;