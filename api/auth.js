export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CALLBACK_URL = process.env.CALLBACK_URL || 'https://c00lkiddpostshaxxs.vercel.app/api/callback';
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&scope=repo`;
  
  res.redirect(authUrl);
}
