<div align="center">
  <h1>🚀 HackSussex</h1>
  <p>A hackathon project to classify hate speech using AI, featuring a dashboard website, backend server, and user authentication.</p>

  <div>
    <img src="https://img.shields.io/badge/-TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow" />
    <img src="https://img.shields.io/badge/-Hugging_Face-FED74A?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face" />
    <img src="https://img.shields.io/badge/-Deno-000000?style=for-the-badge&logo=deno&logoColor=white" alt="Deno" />
    <img src="https://img.shields.io/badge/-Oak-009688?style=for-the-badge&logo=oak&logoColor=white" alt="Oak" />
    <img src="https://img.shields.io/badge/-Clerk-3B82F6?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
    <img src="https://img.shields.io/badge/-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
    <img src="https://img.shields.io/badge/-Podman-892CA0?style=for-the-badge&logo=podman&logoColor=white" alt="Podman" />
  </div>
</div>

## 📚 About

HackSussex is a hackathon project aimed at detecting and classifying hate speech using AI. The project consists of:

- **A TensorFlow-based AI model** trained to classify hate speech, served via Hugging Face.
- **A dashboard website (built with Vite and React)** that shows top 10 trending hashtags on Bluesky filled with misinformation.
- **A backend server (using Deno and Oak)** for authentication, user management, and AI inference.
- **User authentication** powered by Clerk.
- **API documentation** following OpenAPI 3.0 standards.

## 🌟 Features

- 🎯 AI-powered hate speech classification using TensorFlow & Hugging Face
- 🔥 Real-time dashboard to view and filter harmful content
- 🌍 Server backend with Deno & Oak for authentication and AI inference
- 🔒 Secure user authentication with Clerk
- 🌚 Fully documented API with Swagger (OpenAPI 3.0)
- 🐻 Containerized deployment with Podman

## 🛠️ Technologies

- **AI Model**: TensorFlow, Hugging Face
- **Dashboard**: Vite, React
- **Backend**: Deno, Oak
- **Authentication**: Clerk
- **API Documentation**: Swagger, OpenAPI 3.0
- **Containerization**: Podman

## 🚀 Getting Started

### Clone the Repository

```
git clone https://github.com/ss2d22/hacksussex.git
cd hacksussex
```
### Python Server Setup
1. Navigate to the bluesky_livedata directory:
```
cd bludsky_livedata
```
2. Initialize conda environment:
```
conda env create -f bluesky.yml
```
3. Set environment variable:
```
export GEMINI_API_KEY="<your gemini api key>"
```
4. Run the server:
```
python sandbox.py
```

### Deno Server Setup

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
