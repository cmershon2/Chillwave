# Flixify

Flixify is an open-source video sharing platform created for content creators to upload their videos and engage with users through interactive features.

## Technologies Used

- **Nest JS**: Backend framework for building scalable and maintainable APIs.
    - Env Config with Validation  
    - Prisma
- **Next JS**: Frontend framework for server-rendered React applications, offering a fast and immersive user experience.
    - Tailwind 
    - Redux Toolkit Query 
- **Jest**: Testing framework for unit and integration testing, ensuring robust code coverage and reliability.
- **Turborepo**: Monorepo tool for managing multiple projects and dependencies.
- **GitHub Actions**: CI/CD workflow automation for continuous integration and deployment.
- **Reverse Proxy using Nginx**: Efficiently routes requests from clients to backend services.
- **Docker Integration**: Containerization for easy deployment and scalability.
- **Postgres Database**: Reliable and scalable database for storing application data.
- **Package scripts using NPS**: Simplifies running common tasks and commands with npm.

### Utilities

- [Node Package Scripts](https://github.com/sezna/nps#readme) for automation scripts
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Setup
Flixify uses turborepo and yarn workspaces for monorepo workflow.

### Prerequisites 
- Install nps by running 
```
npm i -g nps
```
- Make sure docker and docker-compose are
 installed. Refer to docs for your operating system.

### Configure Environment
- Frontend 
    - `cd apps/web && cp .env.example .env`
- Backend 
    - `cd apps/api && cp .env.example .env`

### Install Dependencies
Make sure you are at root of the project and just run 

```
nps prepare
```
### Build

To build all apps and packages, run the following command at the root of project:

```
nps build
```

### Develop

To develop all apps and packages, run the following command at the root of project:

```
nps dev
```
The app should be running at `http://localhost` with reverse proxy configured.


