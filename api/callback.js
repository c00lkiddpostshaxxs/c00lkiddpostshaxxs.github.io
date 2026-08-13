export default async function handler(req, res) {
  const { code } = req.query;
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

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
      return res.status(400).send('OAuth error: ' + tokenData.error);
    }

    const token = tokenData.access_token;
    const sessionId = Math.random().toString(36).substring(7);
    
    // Store session in Supabase
    const insertResponse = await fetch(SUPABASE_URL + '/rest/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      },
      body: JSON.stringify({ id: sessionId, token: token })
    });

    if (!insertResponse.ok) {
      return res.status(500).send('Failed to store session');
    }

    res.redirect('https://c00lkiddpostshaxxs.github.io/win/?session=' + sessionId);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
}
