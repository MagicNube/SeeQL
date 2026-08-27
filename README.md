# SeeQL

Interactive web platform for learning SQL through real-time visualizations.

Built as my **Bachelor's Thesis**, SeeQL combines a client-side SQL execution engine with an educational interface that helps students understand how SQL queries transform relational data.

**Final Grade:** 10/10  
**Honors Recommendation (Matrícula de Honor proposed)**

---

## ✨ Features

- 🧠 Learn SQL through interactive lessons
- ⚡ Execute SQL entirely in the browser using WebAssembly
- 📊 Visualize relational transformations in real time
- 🧪 Sandbox mode for free experimentation
- 🔐 User authentication and progress persistence
- 📚 Progressive learning path
- 💡 Immediate visual feedback
- 🚀 Zero-latency query execution

---

## 🏗 Architecture

SeeQL follows a client-side architecture where query execution happens entirely inside the browser.

```
                React UI
                    │
                    ▼
          SQL Editor & Visualizer
                    │
                    ▼
        SQL.js (WebAssembly Engine)
                    │
                    ▼
          AST Processing & Analysis
                    │
                    ▼
        Interactive Visualization

────────────── Cloud ──────────────

      Authentication (Supabase)
      Progress persistence
```

This approach provides:

- Instant query execution
- No backend required for SQL processing
- Safe experimentation
- Low latency
- Offline execution of SQL queries

---

## 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Flow

### SQL Engine

- SQL.js
- WebAssembly

### Backend Services

- Supabase
- PostgreSQL

### Tooling

- GitHub Actions
- Vercel

---

## 📸 Screenshots

*(Add screenshots here)*

### Landing Page

![Landing](docs/images/landing.png)

### Lesson Mode

![Lessons](docs/images/lessons.png)

### Sandbox

![Sandbox](docs/images/sandbox.png)

---

## 🚀 Running locally

```bash
git clone https://github.com/MagicNube/SeeQL.git

cd SeeQL

npm install

npm run dev
```

---

## 📖 Documentation

The repository contains the complete Bachelor's Thesis describing:

- Requirements analysis
- Software architecture
- Technology choices
- SQL execution engine
- User evaluation
- Testing
- Educational design

---

## 🎓 Academic Context

SeeQL was developed as my Bachelor's Thesis in Computer Engineering at the **Universitat Politècnica de València (UPV)**.

The project explores how interactive visualization and client-side execution can improve SQL learning by reducing the cognitive gap between syntax and relational transformations.

---

## 📄 License

MIT
