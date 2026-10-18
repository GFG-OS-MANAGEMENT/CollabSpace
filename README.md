# CollabSpace

CollabSpace is an open-source platform intended to help college students find teammates for academic, personal, and hackathon projects. Students will be able to share project ideas, describe the skills and roles they need, discover projects, and request to join teams.

## Goals and planned features

- Share project ideas and descriptions.
- List the skills and roles needed for a project.
- Discover projects that match students' interests or skills.
- Request to join a project team.
- Support collaboration on academic, personal, and hackathon projects.

## Tech stack

| Technology | Purpose |
| --- | --- |
| [React](https://react.dev/) | Builds the user interface from reusable components. |
| JavaScript | Application logic for the frontend and backend. |
| [Vite](https://vite.dev/) | Development server and build tooling for the React frontend. |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling and responsive layouts. |
| [Node.js](https://nodejs.org/) | Runs JavaScript on the server. |
| [Express](https://expressjs.com/) | Defines backend API routes and middleware. |
| [PostgreSQL](https://www.postgresql.org/) | Relational database for application data. |
| [Prisma ORM](https://www.prisma.io/) | Database schema, migrations, and database queries from JavaScript. |

## Planned architecture

The frontend and backend will be maintained separately:

```text
collabspace/
├── frontend/                 # React + Vite frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
├── backend/                 # Node.js + Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── app.js
│   └── server.js
├── prisma/                 # Prisma schema and migrations (if kept at repository root)
├── .env.example
├── .gitignore
└── README.md
```

This is a proposed structure. Update it to match the actual repository as the scaffold develops.

## Getting started

The exact commands may change as the scaffold is implemented. First, make sure Node.js and npm are installed, and that PostgreSQL is available locally or through a database provider.

1. Clone the repository:

   ```bash
   git clone https://github.com/GFG-OS-MANAGEMENT/CollabSpace
   cd CollabSpace
   ```

2. Install dependencies in the directories that contain a `package.json`:

   ```bash
   cd frontend
   npm install
   ```

   In a second terminal, install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables using `.env.example` as a reference, if provided. Create local environment files as instructed by the project configuration. Never commit secrets or real credentials.

4. Configure the PostgreSQL connection and Prisma setup once the database schema and scripts are present. Use the commands documented in the relevant `package.json` and Prisma configuration; do not assume migration or seed scripts exist until they have been added.

5. Start the frontend and backend using the development scripts defined in their respective `package.json` files.

> If the scaffold does not yet contain these directories, scripts, or configuration files, those setup steps are not ready yet. Check the repository files and follow any updated instructions before running commands.

## Environment variables

Use `.env.example` as the source of truth when it is available. Expected configuration may include a PostgreSQL connection string and the frontend's API base URL, but the exact variable names must match the implementation. Do not place credentials in source code or commit `.env` files.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Check the existing repository and discuss substantial changes before starting work.

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

A license has not yet been specified. Until a license is added to the repository, do not assume that the project is licensed under MIT or another open-source license.


