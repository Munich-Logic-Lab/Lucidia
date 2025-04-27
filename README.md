# Lucidia

Lucidia is an expressive journaling and visualization platform that transforms voice-recorded dreams into immersive 3D scenes. Using advanced AI, it converts spoken dream narratives into both 2D images and interactive 3D visualizations, creating a bridge between imagination and visual experience.

## Key Features

- **Voice-to-Visualization Pipeline**: Records spoken dream descriptions and processes them into visual representations
- **Real-time Dream Processing**: Utilizes OpenAI's real-time API for natural conversation about dreams
- **AI-Powered Image Generation**: Creates artistic representations of dream scenes using DALL·E
- **3D Scene Rendering**: Transforms 2D images into interactive 3D models using Gaussian splatting
- **Intuitive User Interface**: Offers a streamlined experience for recording, reviewing, and exploring dreams
- **User Authentication**: Secure account management with email and social login options

## How It Works

1. **Dream Recording**: Users describe their dreams through voice or text
2. **AI-Guided Conversation**: The system asks followup questions to gather visual details
3. **Prompt Generation**: AI creates an optimized image prompt based on the dream description
4. **Image Creation**: The system generates a representative image from the prompt
5. **3D Model Generation**: The image is processed into a 3D point cloud (.ply file)
6. **Visualization**: Three.js renders an interactive 3D scene viewable in the browser

## Tech Stack

- **Frontend**: Next.js 15 with React 19, Tailwind CSS, shadcn/ui components
- **Backend**: Flask server for AI model orchestration and 3D processing
- **3D Rendering**: Three.js with Gaussian splatting for immersive visualizations
- **AI Integration**: OpenAI API for real-time conversation, image generation, and audio processing
- **Cloud Storage**: Vercel Blob Storage for securely storing generated assets
- **Authentication**: Custom auth system with social login options

## Repository Structure

```
Lucidia/
├── server/             # Flask backend for AI processing and 3D generation
├── web/                # Next.js frontend application
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- OpenAI API key
- Vercel Blob Storage tokens (optional, for production)

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Munich-Logic-Lab/Lucidia.git
   cd Lucidia
   ```

2. **Set Up Backend**:
   ```bash
   cd server
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `server/` directory with your API keys:

   ```
   OPENAI_API_KEY=your_openai_api_key
   HF_TOKEN=your_huggingface_token
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

   For the `web/` nextjs project look into the respective `.env.example` file.

4. **Run Backend Server**:

   ```bash
   flask run
   ```

5. **Set Up Frontend**:

   ```bash
   cd ../web
   pnpm install
   pnpm dev
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`.
