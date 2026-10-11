# Deploy automático no Cloudflare Pages

O workflow `.github/workflows/deploy-cloudflare-pages.yml` publica o projeto `project/dist` no Cloudflare Pages sempre que houver push na branch `main`. Também pode ser executado manualmente pela aba **Actions** do GitHub.

## Configuração única no GitHub

No repositório `layonlivio/ELETRIC-IA`, abra **Settings → Secrets and variables → Actions** e crie estes secrets:

- `CLOUDFLARE_API_TOKEN`: token da API do Cloudflare com permissão de edição do Cloudflare Pages na conta correta.
- `CLOUDFLARE_ACCOUNT_ID`: ID da conta Cloudflare que contém o projeto Pages.

O token deve ser criado no Cloudflare em **My Profile → API Tokens**. Não coloque o token no código, em arquivos `.env` ou em commits.

## Projeto Pages

O workflow espera que exista um projeto Cloudflare Pages com o nome:

```text
eletric-ia
```

A publicação usa:

```text
project/dist
```

A configuração SPA está em `project/wrangler.jsonc`, permitindo que rotas do aplicativo retornem para `index.html`.

## Fluxo

1. Um push na `main` altera arquivos dentro de `project/`.
2. O GitHub instala as dependências com `npm ci`.
3. Executa o typecheck.
4. Executa o lint de forma informativa — os erros atuais não bloqueiam o deploy.
5. Gera o build com `npm run build`.
6. Publica o resultado no Cloudflare Pages usando Wrangler.

O deploy também pode ser iniciado manualmente em **Actions → Deploy ELETRIC-IA to Cloudflare Pages → Run workflow**.
