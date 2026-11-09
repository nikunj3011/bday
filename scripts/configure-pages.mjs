import { pathToFileURL } from 'node:url';

export async function ensureWorkflowPages({ repository, token, adminToken, request = fetch }) {
  if (!repository || !token) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required.');
  const endpoint = `https://api.github.com/repos/${repository}/pages`;
  const settings = `https://github.com/${repository}/settings/pages`;
  const help = `Open ${settings} and set Build and deployment > Source to GitHub Actions, then rerun this workflow. Alternatively, add PAGES_ADMIN_TOKEN with Pages: write and Administration: write permissions to let this workflow change the setting.`;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${adminToken || token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
  const response = await request(endpoint, { headers });
  if (!response.ok && response.status !== 404) throw new Error(`Cannot read Pages settings (HTTP ${response.status}). ${help}`);
  const site = response.ok ? await response.json() : null;
  if (site?.build_type === 'workflow') return 'already-configured';
  if (!adminToken) throw new Error(`Pages is ${site ? 'still publishing a branch, which serves the unbuilt /src/main.tsx entry' : 'not enabled'}. The regular GITHUB_TOKEN cannot change this repository setting. ${help}`);
  const update = await request(endpoint, {
    method: site ? 'PUT' : 'POST', headers, body: JSON.stringify({ build_type: 'workflow' }),
  });
  if (!update.ok) throw new Error(`Cannot switch Pages to GitHub Actions (HTTP ${update.status}). ${help}`);
  const verify = await request(endpoint, { headers });
  if (!verify.ok || (await verify.json()).build_type !== 'workflow') throw new Error(`The Pages source change could not be confirmed. ${help}`);
  return 'switched-to-workflow';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await ensureWorkflowPages({
      repository: process.env.GITHUB_REPOSITORY,
      token: process.env.GITHUB_TOKEN,
      adminToken: process.env.PAGES_ADMIN_TOKEN,
    });
    console.log(`Pages source check: ${result}`);
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  }
}
