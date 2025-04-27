Here's a comprehensive technical README for your Lucidia project, incorporating all the components you mentioned:

---

# Lucidia

Lucidia is an expressive journaling and visualization platform that transforms voice-recorded dreams into immersive 3D scenes. Designed for children with communication challenges, adults exploring their subconscious, and researchers lacking labeled visual dream datasets, Lucidia bridges the gap between imagination and visualization.

---

## ✨ Features

- **Voice-to-Visualization Pipeline**: Utilizes OpenAI's Whisper for transcription and DALL·E for image generation based on dream narratives.
- **3D Scene Rendering**: Employs Three.js to render Gaussian splatting visualizations from generated `.ply` files.
- **Interactive Journaling**: Provides a user-friendly interface for recording, reviewing, and visualizing dreams.
- **Research Utility**: Offers a novel approach for collecting and analyzing dream data, beneficial for psychological and neuroscientific studies.

---

## 🧠 How It Works

1. **Dream Recording**: Users narrate their dreams through the platform.
2. **Transcription**: OpenAI's Whisper transcribes the audio into text.
3. **Image Generation**: The transcribed text serves as a prompt for OpenAI's DALL·E to generate a representative image.
4. **3D Model Creation**: The generated image, along with the original prompt (used as a hallucination prompt), is processed to create a `.ply` file representing a 3D point cloud.
5. **Visualization**: Three.js renders the `.ply` file using Gaussian splatting techniques, providing an immersive visual representation of the dream.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) for server-side rendering and React-based UI.
- **Backend**: [Flask](https://flask.palletsprojects.com/) for API endpoints and server logic.
- **3D Rendering**: [Three.js](https://threejs.org/) for rendering 3D visualizations.
- **AI Services**: [OpenAI Whisper](https://openai.com/research/whisper) for transcription and [OpenAI DALL·E](https://openai.com/dall-e) for image generation.

---

## 📦 Repository Structure

```

Lucidia/
├── server/             # Flask backend for handling API requests
├── web/                # Next.js frontend application
├── README.md           # Project documentation
└── requirements.txt    # Python dependencies
```


---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- OpenAI API key

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

   Create a `.env` file in the `server/` directory with your OpenAI API key:

   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```


4. **Run Backend Server**:

   ```bash
   flask run
   ```


5. **Set Up Frontend**:

   ```bash
   cd ../web
   npm install
   npm run dev
   ```


6. **Access the Application**:

   Open your browser and navigate to `http://localhost:3000`.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions from the community. If you're interested in contributing, please fork the repository and submit a pull request. For major changes, open an issue first to discuss what you'd like to change.

---

## 📫 Contact

For questions or collaborations, please reach out to the [Munich Logic Lab](https://github.com/Munich-Logic-Lab).

---

Feel free to integrate this README into your repository. Let me know if you need further assistance or modifications! 
