# Dashboard Deverson

Portfólio pessoal com dados públicos do GitHub consumidos por um backend Node.js/Express.

## Configuração

1. Instale o Node.js 18 ou superior.
2. Instale as dependências:

```bash
npm install
```

3. Copie `.env.example` para `.env` e preencha:

```env
GITHUB_USERNAME=seu_usuario_github
GITHUB_TOKEN=seu_token_aqui
PORT=3000
```

O token é usado apenas pelo servidor e não é enviado ao navegador. Para os endpoints públicos do GitHub, ele pode ser omitido, embora o token ajude a evitar limites de requisição.

## Executar

```bash
npm start
```

Abra `http://localhost:3000`. Não abra os arquivos HTML diretamente, pois os dados são carregados pelos endpoints do backend.

## Endpoints

- `GET /api/health`
- `GET /api/github/profile`
- `GET /api/github/repositories`
- `GET /api/github/stats`