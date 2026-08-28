const statElements = {
  repositories: document.querySelector('[data-stat="repositories"]'),
  stars: document.querySelector('[data-stat="stars"]'),
  forks: document.querySelector('[data-stat="forks"]'),
  projects: document.querySelector('[data-stat="projects"]')
};

async function loadStats() {
  const response = await fetch('/api/github/stats');
  if (!response.ok) throw new Error('stats');

  const stats = await response.json();
  Object.entries(statElements).forEach(([name, element]) => {
    if (element) element.textContent = stats[name];
  });
}

async function loadRepositories() {
  const list = document.querySelector('[data-repository-list]');
  if (!list) return;

  const response = await fetch('/api/github/repositories');
  if (!response.ok) throw new Error('repositories');

  const repositories = await response.json();
  list.innerHTML = repositories.length ? repositories.map((repository) => `
    <article class="repository-card">
      <h2>${escapeHtml(repository.name)}</h2>
      <p>${escapeHtml(repository.description || 'Sem descrição disponível.')}</p>
      <span>${escapeHtml(repository.language || 'Código')}</span>
      <a href="${repository.html_url}" target="_blank" rel="noreferrer">Ver no GitHub</a>
    </article>
  `).join('') : '<p>Nenhum repositório encontrado.</p>';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

Promise.all([loadStats(), loadRepositories()]).catch(() => {
  document.querySelectorAll('[data-api-error]').forEach((element) => {
    element.textContent = 'Não foi possível carregar os dados do GitHub agora.';
  });
});