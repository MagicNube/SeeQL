<div align="center">

# SeeQL

### Interactive SQL Learning Platform

**Master SQL by seeing your data.**

Learn SQL through **real-time visualizations** powered by a **client-side WebAssembly engine**.

Developed as my Bachelor's Thesis at the **Universitat Politècnica de València (UPV)**.

**⭐ Final Grade: 10/10 · Honors Recommendation**

<br>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-2563EB?style=for-the-badge)](https://see-ql.vercel.app)
[![Video Demo](https://img.shields.io/badge/🎥_Video_Demo-FF0000?style=for-the-badge)](https://youtu.be/lvYT9PO54WY)
[![Technical Report](https://img.shields.io/badge/📄_Technical_Report-4B5563?style=for-the-badge)](./docs/thesis.pdf)

<br>

<img src="./docs/demo.gif" alt="SeeQL Demo">

</div>

---

## ✨ Features

- ⚡ Execute SQL queries entirely in the browser using **WebAssembly**
- 📊 Visualize relational transformations in real time
- 🎓 Learn SQL through guided interactive lessons
- 🧪 Experiment freely in a SQL sandbox
- 🔒 Secure client-side execution with no SQL backend
- ☁️ Authentication and progress persistence with Supabase
- 🚀 Instant query execution with zero network latency

---

# 📸 Screenshots

## Dashboard

Start your learning journey through guided lessons or experiment freely in the SQL sandbox.

<p align="center">
<img src="./docs/images/dashboard.png" width="100%">
</p>

---

## Guided Lessons

Progress through interactive lessons with explanations, hints and real-time validation.

<p align="center">
<img src="./docs/images/lesson.png" width="100%">
</p>

---

## SQL Sandbox

Write SQL freely and instantly visualize how your queries transform relational data.

<p align="center">
<img src="./docs/images/sandbox.png" width="100%">
</p>

---

## Landing Page

Modern authentication, progress tracking and quick access to learning modes.

<p align="center">
<img src="./docs/images/landing.png" width="100%">
</p>

---

# 🏗 Architecture

SeeQL follows a **client-side architecture** where SQL execution happens entirely inside the browser.

React is responsible for the user interface, while SQL.js running through WebAssembly executes SQL locally without requiring a backend server.

Supabase is only responsible for authentication and user progress persistence.

<p align="center">
<img src="./docs/architecture.png" width="900">
</p>

### Why this architecture?

- ⚡ Instant SQL execution
- 🔒 Safe experimentation
- 🌐 Works with minimal backend infrastructure
- 📉 Low latency
- 🧠 Better learning experience through immediate feedback

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React · TypeScript · Vite |
| SQL Engine | SQL.js · WebAssembly |
| Editor | Monaco Editor |
| SQL Parser | node-sql-parser |
| Backend Services | Supabase |
| Deployment | Vercel |

---

# 🚀 Running locally

```bash
git clone https://github.com/MagicNube/SeeQL.git

cd SeeQL

npm install

npm run dev
```

---

# 📖 Documentation

The repository includes the complete Bachelor's Thesis covering:

- Software architecture
- Requirements analysis
- Technology decisions
- SQL execution engine
- Interactive visualization
- Educational design
- User evaluation
- Testing methodology

📄 **Technical Report:** [`docs/thesis.pdf`](./docs/thesis.pdf)

---

# 📄 License

MIT
