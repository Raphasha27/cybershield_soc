# CyberShield Modern - Security Operations Center (SOC) Platform

🛡️ **State-of-the-Art Cybersecurity Dashboard**

## 🛡️ Overview
**CyberShield Modern** is a state-of-the-art, high-performance Security Operations Center (SOC) dashboard built with **Angular**. It provides security analysts with a real-time, unified view of their organization's security posture, combining dynamic visualizations, live log streaming, and incident management in a premium, responsive interface.

This project is a modernized migration from a static platform, leveraging **Angular Signals** for reactive state management and **Chart.js** for interactive data representation.

## ✨ Key Features
-   **Real-time Threat Monitoring**: A live "Threat Level" gauge that fluctuates based on incoming heuristic data.
    -   **Interactive Dashboard**: View critical metrics, attack sources, and incident timelines at a glance.
    -   **Live Log Stream**: An integrated terminal simulating real-time system logs with color-coded severity.
    -   **Incident Kanban**: Manage security incidents through their lifecycle (Detected → Investigating → Containing → Resolved).
    -   **Vulnerability Assessment**: High-visibility CVE tracking and system impact scoring.
    -   **Compliance Tracking**: Automated scoring against frameworks like ISO 27001, NIST, and GDPR.
    -   **Glassmorphism Design**: A premium, futuristic dark-mode UI optimized for SOC environments.

## 🚀 Technology Stack
-   **Framework**: [Angular](https://angular.io/) (Latest Version)
-   **State Management**: [Angular Signals](https://angular.io/guide/signals)
-   **Data Visualization**: [Chart.js](https://www.chartjs.org/)
-   **Typography**: Inter & JetBrains Mono
-   **Styling**: Pure CSS3 with CSS Variables for theme management

## 🛠️ Installation & Setup

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18.x or higher)
-   [npm](https://www.npmjs.com/) (v9.x or higher)
-   [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Steps to Run
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Raphasha27/cybershield-modern.git
    cd cybershield-modern
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    ```bash
    npm start
    ```

4.  **Access the Application**:
    Open your browser and navigate to `http://localhost:4200`

## 📊 Live Simulation
The application includes a built-in simulation engine (`SecurityService`) that generates:
-   Fluctuating threat levels based on random heuristic patterns.
-   A continuous stream of security logs in the integrated terminal.
-   Interactive Chart.js updates upon view switching.

## 📝 Modernization Details
This version represents a significant architectural upgrade from the original vanilla JS implementation:
-   **Encapsulation**: Logical components are managed via standalone Angular components.
-   **Reactivity**: Signals ensure the UI stays in perfect sync with the security data without expensive change detection cycles.
-   **Service-Oriented**: All data logic is centralized in a singleton service, allowing for easy integration with real-world APIs in the future.

---

**Developed with ❤️ for the Cybersecurity Community.**
[Visit Raphasha27 Profile](https://github.com/Raphasha27)
