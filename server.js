require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const username = process.env.GITHUB_USERNAME;

app.use(express.static(__dirname));

function githubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function githubRequest(endpoint) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: githubHeaders()
  });

  if (!response.ok) {
    const error = new Error(`GitHub respondeu com ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function requireUsername(request, response, next) {
  if (!username) {
    return response.status(503).json({
      error: 'Configure GITHUB_USERNAME no arquivo .env.'
    });
  }

  next();
}

app.get('/api/health', (request, response) => {
  response.json({ ok: true });
});

app.get('/api/github/profile', requireUsername, async (request, response) => {
  try {
    response.json(await githubRequest(`/users/${encodeURIComponent(username)}`));
  } catch (error) {
    response.status(error.status || 502).json({ error: 'Não foi possível carregar o perfil do GitHub.' });
  }
});

app.get('/api/github/repositories', requireUsername, async (request, response) => {
  try {
    const repositories = await githubRequest(`/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`);
    response.json(repositories.map((repository) => ({
      name: repository.name,
      description: repository.description,
      html_url: repository.html_url,
      language: repository.language,
      stargazers_count: repository.stargazers_count,
      forks_count: repository.forks_count,
      updated_at: repository.updated_at,
      fork: repository.fork
    })));
  } catch (error) {
    response.status(error.status || 502).json({ error: 'Não foi possível carregar os repositórios.' });
  }
});

app.get('/api/github/stats', requireUsername, async (request, response) => {
  try {
    const repositories = await githubRequest(`/users/${encodeURIComponent(username)}/repos?per_page=100`);
    response.json({
      repositories: repositories.length,
      stars: repositories.reduce((total, repository) => total + repository.stargazers_count, 0),
      forks: repositories.reduce((total, repository) => total + repository.forks_count, 0),
      projects: repositories.filter((repository) => !repository.fork).length
    });
  } catch (error) {
    response.status(error.status || 502).json({ error: 'Não foi possível carregar as estatísticas.' });
  }
});

app.get('*', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Dashboard disponível em http://localhost:${port}`);
});