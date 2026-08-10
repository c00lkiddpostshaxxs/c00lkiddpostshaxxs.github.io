export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const { sessionId, buttons } = req.body;
  const REPO = 'c00lkiddpostshaxxs/c00lkiddpostshaxxs.github.io';

  const cookies = req.headers.cookie || '';
  const sessionCookie = cookies.split('; ').find(c => c.startsWith('session='));
  
  if (!sessionCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = sessionCookie.split('=')[1].split(':')[1];

  try {
    const [owner, repo] = REPO.split('/');
    const filePath = 'buttons.json';
    const content = JSON.stringify(buttons, null, 2);

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
      content: Buffer.from(content).toString('base64'),
      branch: 'main'
    };

    if (sha) {
      payload.sha = sha;
    }

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
      return res.json({ success: true, message: 'Committed to GitHub!' });
    } else {
      const err = await response.json();
      return res.status(response.status).json({ error: err.message });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
