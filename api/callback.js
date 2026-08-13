export default async function handler(req, res) {
  const { code } = req.query;
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!code) {
    return res.status(400).send('No code');
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
      return res.status(400).send('OAuth error');
    }

    const token = tokenData.access_token;
    const sessionId = Math.random().toString(36).substring(7);
    
    // Store in Supabase
    try {
      const insertUrl = SUPABASE_URL + '/rest/v1/sessions';
      const insertResponse = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        },
        body: JSON.stringify({ id: sessionId, token: token })
      });

      if (!insertResponse.ok) {
        const error = await insertResponse.text();
        console.error('Supabase error:', error);
        return res.status(500).send('DB error');
      }
    } catch (e) {
      console.error('Insert failed:', e.message);
      return res.status(500).send('Insert error: ' + e.message);
    }

    res.redirect('https://c00lkiddpostshaxxs.github.io/win/?session=' + sessionId);
  } catch (error) {
    return res.status(500).send('Error: ' + error.message);
  }
}
