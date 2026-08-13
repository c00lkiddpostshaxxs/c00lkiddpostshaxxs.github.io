export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://c00lkiddpostshaxxs.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { encryptedData } = req.body;
  const { session } = req.query;
  const REPO = 'c00lkiddpostshaxxs/c00lkiddpostshaxxs.github.io';
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!session) {
    return res.status(401).json({ error: 'No session ID' });
  }

  try {
    // Check if session exists in Supabase
    const getUrl = SUPABASE_URL + '/rest/v1/sessions?id=eq.' + session;
    const getResponse = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });

    const sessions = await getResponse.json();

    if (!sessions || sessions.length === 0) {
      return res.status(401).json({ error: 'Session not found or expired' });
    }

    const token = sessions[0].token;

    // Get GitHub file info
    const [owner, repo] = REPO.split('/');
    const filePath = 'buttons.json';
    const content = JSON.stringify({ encrypted: true, data: encryptedData });

    let sha = null;
    try {
      const fileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        { headers: { Authorization: `token ${token}` } }
      );
      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File doesn't exist
    }

    const payload = {
      message: 'Update clipboard buttons - ' + new Date().toLocaleString(),
      content: Buffer.from(content).toString('base64')
    };

    if (sha) payload.sha = sha;

    // Commit to GitHub
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (response.ok) {
      // Delete session after successful commit
      try {
        await fetch(SUPABASE_URL + '/rest/v1/sessions?id=eq.' + session, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY
          }
        });
      } catch (e) {
        // Session delete failed but commit succeeded, so still return success
      }

      return res.json({ success: true, message: 'Committed!' });
    } else {
      const err = await response.json();
      return res.status(response.status).json({ error: err.message || 'GitHub error' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
