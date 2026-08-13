export default function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CALLBACK_URL = 'https://c00lkiddpostshaxxs.vercel.app/api/callback';
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&scope=repo`;
  
  res.redirect(authUrl);
}
