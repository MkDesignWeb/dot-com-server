API Node/Express com autenticação JWT e bcrypt

Instalação

```bash
npm install
```

Variáveis de ambiente (crie `.env` a partir de `.env.example`)

- `PORT` (opcional)
- `JWT_SECRET` (obrigatório em produção)

Executar

```bash
npm install
npm run dev
```

Endpoints principais

- `POST /users` — cria usuário. Body: `{ "name": string, "companny": number, "password": string }`
- `POST /auth/login` — login. Body: `{ "name": string, "password": string }` → retorna `{ token }`
- `GET /users` — lista de usuários (protegido, Header `Authorization: Bearer <token>`)

Observações

- Esta API usa armazenamento em memória (array). Para produção, conecte um banco de dados.
