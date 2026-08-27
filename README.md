<div align="center">

# SeeQL

### Interactive SQL Learning & Visualization Platform

**Master SQL by seeing your data.**

Execute SQL queries directly in your browser and understand them through **real-time relational visualizations** powered by **WebAssembly**.

🎓 Developed as my **Bachelor's Thesis** at the **Universitat Politècnica de València (UPV)**

⭐ **Final Grade: 10/10 · Honors Recommendation**

<br>

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![WebAssembly](https://img.shields.io/badge/WebAssembly-654FF0?style=flat-square&logo=webassembly&logoColor=white)
![SQL.js](https://img.shields.io/badge/SQL.js-003B57?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

<br><br>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-2563EB?style=for-the-badge)](https://see-ql.vercel.app)
[![Video Demo](https://img.shields.io/badge/🎥_Video_Demo-FF0000?style=for-the-badge)](https://youtu.be/lvYT9PO54WY)
[![Technical Report](https://img.shields.io/badge/📄_Technical_Report-4B5563?style=for-the-badge)](./docs/thesis.pdf)

<br><br>

<p align="center">
  <img src="./docs/demo.gif" alt="SeeQL Demo" width="900">
</p>

</div>

---

# ✨ Features

- ⚡ Execute SQL queries entirely in the browser using **WebAssembly**
- 📊 Visualize relational transformations in real time
- 🎓 Learn SQL through guided interactive lessons
- 🧪 Experiment freely in a SQL sandbox
- 🔒 Safe client-side execution with no SQL server required
- ☁️ Authentication and progress persistence with Supabase
- 🚀 Instant query execution with zero network latency

---

# 📸 Screenshots

## Dashboard

Start your learning journey through guided lessons or experiment freely in the SQL sandbox.

<p align="center">
<img src="./docs/images/dashboard.png" width="100%">
</p>

## Guided Lessons

Follow structured lessons with explanations, hints and real-time visual feedback.

<p align="center">
<img src="./docs/images/lesson-mode.png" width="100%">
</p>

## SQL Sandbox

Write SQL freely and instantly visualize how your queries transform relational data.

<p align="center">
<img src="./docs/images/sandbox.png" width="100%">
</p>

## Welcome Screen

Simple authentication with progress persistence across sessions.

<p align="center">
<img src="./docs/images/landing.png" width="100%">
</p>

---

# 🏗 Architecture

SeeQL follows a **client-side architecture** where SQL parsing, execution and visualization happen entirely inside the browser.

React is responsible for the user interface, while **SQL.js** running through **WebAssembly** executes queries locally. **Supabase** is only responsible for authentication and user progress persistence.

<p align="center">
<img src="./docs/architecture.png" width="900">
</p>

### Why this architecture?

- ⚡ Instant SQL execution
- 🔒 Safe experimentation
- 🌐 Minimal backend infrastructure
- 📉 Low latency
- 🧠 Immediate visual feedback for learning

---

# 🛠 Tech Stack

| Category | Technologies |
|-----------|--------------|
| **Frontend** | React · TypeScript · Vite |
| **SQL Engine** | SQL.js · WebAssembly |
| **SQL Parser** | node-sql-parser |
| **Editor** | Monaco Editor |
| **Backend Services** | Supabase |
| **Deployment** | Vercel |

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
