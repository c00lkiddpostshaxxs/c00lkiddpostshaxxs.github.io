export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { code } = req.query;
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  if (!code) {
    return res.status(400).send('No authorization code');
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).send(`OAuth error: ${tokenData.error}`);
    }

    const token = tokenData.access_token;
    const sessionId = Math.random().toString(36).substring(7);

    // Store token in a cookie (httpOnly for security)
    res.setHeader('Set-Cookie', `session=${sessionId}:${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Lax`);

    // Redirect back to admin panel
    res.redirect('https://c00lkiddpostshaxxs.github.io/win/?session=' + sessionId);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
}
