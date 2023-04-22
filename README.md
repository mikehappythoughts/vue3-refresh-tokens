# Vue 3 + TypeScript + Vite + vue test utils - In memory refresh token using axios interceptors

## Description

The in memory refresh token demonstrates one way to refresh your access token using Axios interceptors. This also includes unit test using Vue test utils.

## Tech Stack

Vue 3 composition api, Formkit, Typescript, Tailwind, Express for the backend, Vue test utils for unit tests

## Documentation

For detailed explanation on the tech stack check below:
- Vue 3, check out the [documentation](https://vuejs.org/).
- Vite, check out the [documentation](https://vitejs.dev/).
- Formkit, check out the [documentation](https://formkit.com/).
- Tailwind, check out the [documentation](https://tailwindcss.com/).
- Typescript, check out the [documentation](https://www.typescriptlang.org/).
- Vue test utils, check out the [documentation](https://test-utils.vuejs.org/).
- Express, check out the [documentation](https://expressjs.com/).

## Getting Started

Please note rename the .env.example to .env
Inside the .env file you will see this **VITE_API_URL =''** enter the server url in between the single quotes this will allow the app to work with the server. To build this app I used an express server by Dave Gray see all his great work here: https://github.com/gitdagray. And to use the same server I used by Dave Gray you can find it here: https://github.com/gitdagray/express_jwt. But you can adapt it to use any backend you want.

```bash
# install dependencies
$ npm install

# serve your server mine was at localhost:3500 do this before starting the app or it will not work. Yours may be different
$ npm run start

# serve with hot reload at localhost:5173
$ npm run dev

# build for production and launch server
$ npm run build
```
