# Image and 3D Model Generation Server

A Flask server that generates images using OpenAI's GPT-Image-1 model and creates 3D models from those images using the Invisible Stitch Gradio app.

## Setup

1. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

2. Set the required environment variables:
   ```
   export OPENAI_API_KEY=your_openai_api_key
   export HF_TOKEN=your_huggingface_token
   ```

   Get your Hugging Face token from: https://huggingface.co/settings/tokens

## Usage

1. Start the server:
   ```
   python server.py
   ```

2. Send a POST request to the `/generate-image` endpoint with a prompt:
   ```
   curl -X POST http://localhost:5000/generate-image \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Your detailed scene description here"}'
   ```

   Or use the included test script:
   ```
   python test_image_generation.py
   ```

## File Structure

- `server.py`: The main Flask server
- `get_ply.py`: Utility for generating 3D models from images
- `test_image_generation.py`: Test script to verify functionality

## Output

The server creates three types of files:
- Generated images in the `images/` directory
- 3D models (.ply files) in the `plys/` directory
- Metadata JSON files in the `metadata/` directory

All files use the same timestamp-based naming convention to easily associate them.

## Notes

- The 3D model generation requires a Hugging Face token due to access restrictions
- If the HF_TOKEN is not set, the server will still generate and save images but will skip 3D model creation
- All error information is saved in the metadata JSON files for debugging