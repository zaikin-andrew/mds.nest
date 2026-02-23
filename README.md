# MDS API

Backend API for the MDS audiobook platform, built with [NestJS](https://nestjs.com/), MongoDB, and SWC.

## Tech Stack

- **Runtime:** Node.js + NestJS 11
- **Language:** TypeScript (SWC compiler)
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** Firebase Auth, VK ID
- **Storage:** Yandex Object Storage (S3-compatible)
- **AI:** OpenAI (annotation generation)
- **Push:** Firebase Cloud Messaging, RuStore Push
- **Docs:** Swagger (`/api`)

## Modules

| Module | Description |
| --- | --- |
| Audiobooks | Catalog, listen events, weekly/monthly counts, AI search |
| Users | User profiles, subscriptions |
| Authors | Author management |
| Playlist | User playlists |
| History | Listening history |
| News | News feed |
| Selections | Weekly editorial selections |
| Search Params | Search parameter tracking |
| App Version | Mobile app version management |
| UTM | UTM tracking |

## Project Setup

```bash
npm install
```

### Environment

Configuration is loaded from `.env.{NODE_ENV}` (defaults to `.env.local`). Required variables:

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `local` / `dev` / `test` / `prod` |
| `SERVER_PORT` | HTTP port (default 3000) |
| `MONGO_URL` | MongoDB connection URI |
| `SERVICE_ACCOUNT_ACCESS_KEY_ID` | Yandex service account key ID |
| `SERVICE_ACCOUNT_ACCESS_KEY` | Yandex service account secret |
| `VK_CLIENT_ID` | VK app client ID |
| `BUCKET_NAME` | Yandex Object Storage bucket |
| `STORAGE_URL` | Yandex Object Storage base URL |
| `OPENAI_TOKEN` | OpenAI API key |
| `ADDISON_CREDENTIALS` | Admin credentials (`user:pass`) |
| `AZAIKIN_CREDENTIALS` | Admin credentials (`user:pass`) |
| `TG_SUPPORT_USER_ID` | Telegram support user ID |

Optional:

| Variable | Description |
| --- | --- |
| `RUSTORE_PUSH_SERVICE_URL` | RuStore push service URL |
| `RUSTORE_PUSH_SERVICE_PROJECT_ID` | RuStore project ID |
| `RUSTORE_PUSH_SERVICE_TOKEN` | RuStore push token |
| `AI_URL` | External AI service URL |

### Static Assets

Firebase service account key and VK public key must be placed at:

- `src/services/firebase/service-account/serviceAccountKey.json`
- `src/services/vk/vk_public_key.pem`

These are automatically copied to `dist/` during build (configured in `nest-cli.json`).

## Running

```bash
# development (watch mode)
npm run start:dev

# debug mode
npm run start:debug

# production
npm run build
npm run start:prod
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

## Linting & Formatting

```bash
npm run lint
npm run format
```
