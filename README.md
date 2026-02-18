# CyberShield Modern

A modern **Security Operations Center (SOC)** dashboard built with Angular for real-time threat visibility, incident tracking, and analyst workflows.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Platform](https://img.shields.io/badge/platform-Angular-red.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Live Demo

- **Dashboard:** [https://raphasha27.github.io/cybershield-modern/](https://raphasha27.github.io/cybershield-modern/)

![Main Dashboard](screenshots/github_dashboard.png)

## Features

- **CyberSentinel AI Assistant** for quick threat-analysis support.
- **Real-time Threat Monitoring** with dynamic threat level updates.
- **Live Security Logs** with severity-based styling.
- **Incident Kanban Board** (Detected → Investigating → Containing → Resolved).
- **Threat Intelligence View** with actionable SOC context.
- **Responsive Glassmorphism UI** designed for dark SOC environments.

## Tech Stack

- **Framework:** Angular
- **State:** Angular Signals
- **Charts:** Chart.js
- **Styling:** CSS3 + CSS Variables
- **Fonts:** Inter, JetBrains Mono

## Getting Started

### Prerequisites

- Node.js **18+**
- npm **9+**
- Angular CLI

```bash
npm install -g @angular/cli
```

### Installation

```bash
git clone https://github.com/Raphasha27/cybershield-modern.git
cd cybershield-modern
npm install
```

### Run Locally

```bash
npm start
```

App runs at: [http://localhost:4200](http://localhost:4200)

## Project Structure

```text
cybershield-modern/
├── public/
├── screenshots/
├── src/
├── angular.json
├── package.json
└── README.md
```

## Simulation Engine

The app includes a built-in `SecurityService` simulation for:

- fluctuating threat levels,
- continuous log streaming,
- chart updates during navigation.

## Screenshots

### AI Assistant
![AI Assistant](screenshots/github_ai_chat.png)

### Incident Response
![Incidents](screenshots/github_incidents.png)

### Threat Intelligence
![Threat Intelligence](screenshots/threats.png)

## License

This project is licensed under the [MIT License](LICENSE).

---

Built for the cybersecurity community by [Raphasha27](https://github.com/Raphasha27).
