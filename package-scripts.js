const path = require("path");

const apiPath = path.resolve(__dirname, "apps/api");
const webPath = path.resolve(__dirname, "apps/web");
const transcodingPath = path.resolve(__dirname, "apps/transcoding-processor");

const ciApiPath = path.resolve(__dirname, "out/apps/api");
const ciWebPath = path.resolve(__dirname, "out/apps/web");
const ciTranscodingPath = path.resolve(__dirname, "apps/transcoding-processor");

module.exports = {
  scripts: {
    prepare: {
      default: `nps prepare.web prepare.api prepare.transcoding`,
      web: `yarn`,
      api: `nps prepare.docker prisma.migrate.dev`,
      transcoding: `nps prepare.docker`,
      docker: "docker compose up -d",
      ci: {
        web: `npx turbo prune --scope=web && cd out && yarn install --frozen-lockfile`,
        api: `npx turbo prune --scope=api && cd out && yarn install --frozen-lockfile && nps prisma.generate`,
        transcoding: `npx turbo prune --scope=transcoding && cd out && yarn install --frozen-lockfile`
      },
    },
    test: {
      default: `nps test.web test.api test.transcoding`,
      web: `cd ${webPath} && yarn test`,
      api: `cd ${apiPath} && yarn test`,
      transcoding: `cd ${transcodingPath} && yarn test`,
      ci: {
        default: `nps test.ci.web test.ci.api test.ci.transcoding`,
        web: `cd ${ciWebPath} && yarn test:ci`,
        api: `cd ${ciApiPath} && yarn test:ci`,
        transcoding: `cd ${ciTranscodingPath} && yarn test:ci`,
      },
      watch: {
        default: `nps test.watch.web test.watch.api test.transcoding.api`,
        web: `cd ${webPath} && yarn test:watch`,
        api: `cd ${apiPath} && yarn test:watch`,
        transcoding: `cd ${transcodingPath} && yarn test:watch`
      },
    },
    prisma: {
      generate: `cd ${apiPath} && npx prisma generate`,
      studio: `cd ${apiPath} && npx prisma studio`,
      migrate: {
        dev: `cd ${apiPath} && npx prisma migrate dev`,
      },
    },
    build: {
      default: "npx turbo run build",
      ci: {
        web: "cd out && npm run build",
        api: "cd out && npm run build",
        transcoding: "cd out && npm run build",
      },
    },
    docker: {
      build: {
        default: "nps docker.build.web docker.build.api",
        web: `docker build -t web . -f ${webPath}/Dockerfile`,
        api: `docker build -t api . -f ${apiPath}/Dockerfile`,
        transcoding: `docker build -t transcoding . -f ${transcodingPath}/Dockerfile`
      },
    },
    dev: "npx turbo run dev",
  },
};
