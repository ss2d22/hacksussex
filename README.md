<div align="center">
  <h1>🚀 HackSussex</h1>
  <p>A hackathon project to classify hate speech using AI, featuring a browser extension, backend server, and user authentication.</p>

  <div>
    <img src="https://img.shields.io/badge/-TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow" />
    <img src="https://img.shields.io/badge/-Hugging_Face-FED74A?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face" />
    <img src="https://img.shields.io/badge/-Deno-000000?style=for-the-badge&logo=deno&logoColor=white" alt="Deno" />
    <img src="https://img.shields.io/badge/-Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/-Clerk-3B82F6?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
    <img src="https://img.shields.io/badge/-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
    <img src="https://img.shields.io/badge/-Plasma-7B61FF?style=for-the-badge&logo=plasma&logoColor=white" alt="Plasma" />
    <img src="https://img.shields.io/badge/-Podman-892CA0?style=for-the-badge&logo=podman&logoColor=white" alt="Podman" />
  </div>
</div>

## 📖 About

HackSussex is a hackathon project aimed at detecting and classifying hate speech using AI. The project consists of:
- **A TensorFlow-based AI model** trained to classify hate speech, served through the backend.
- **A browser extension (built with Plasma)** that flags harmful content in real time.
- **A backend server (using Deno 2.0 and Express)** for authentication, user management, and serving the AI model using Hugging Face inference.
- **User authentication** powered by Clerk.
- **API documentation** following OpenAPI 3.0 standards.

## 🌟 Features

- 🎯 AI-powered hate speech classification using TensorFlow & Hugging Face
- 🔥 Real-time browser extension to detect and flag harmful content
- 🌍 Server backend with Deno 2.0 & Express for authentication and AI inference
- 🔐 Secure user authentication with Clerk
- 📜 Fully documented API with Swagger (OpenAPI 3.0)
- 🛠️ Containerized deployment with Podman

## 🛠️ Technologies

- **AI Model**: TensorFlow, Hugging Face
- **Browser Extension**: Plasma
- **Backend**: Deno 2.0, Express
- **Authentication**: Clerk
- **API Documentation**: Swagger, OpenAPI 3.0
- **Containerization**: Podman

## 🚀 Getting Started

### Clone the Repository

```
git clone https://github.com/ss2d22/hacksussex.git
cd hacksussex
```

### Backend Setup

server tbd

1. Navigate to the backend directory:

```
cd server
```

2. Create a `.env` file with the following variables:

```
PORT=your_port
MONGODB_URI=your_mongodb_uri
HUGGINGFACE_API_KEY=your_huggingface_key
CLERK_API_KEY=your_clerk_api_key
```

3. Run the backend server:

```
deno run --allow-net --allow-read --allow-env index.ts
```

### Browser Extension Setup

1. Navigate to the extension directory:

```
cd browser-extension
```

2. Install dependencies:

```
pnpm install
```

3. Build and load the extension:

```
pnpm build
```

Then load the extension manually in your browser's developer mode.

### Running with Podman

For convenience, you can run everything using Podman:

```
podman-compose up --build
```

## 📚 API Documentation

The API is fully documented and compliant with OpenAPI 3.0 standards. You can view the documentation at:

[View API documentation here]()

## 👥 Contact

For any queries or suggestions, please open an issue in this repository or reach out to me on Discord.

---

<div align="center">
Made with ❤️ at HackSussex
</div>

