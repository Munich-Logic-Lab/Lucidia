import os
import base64
import json
from openai import OpenAI
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv
from get_ply import generate_ply
from cloud_storage import get_storage_provider
from vercel_api import upload_to_vercel_blob

# Load environment variables from .env file if present
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# Get Vercel Blob token from environment
VERCEL_BLOB_TOKEN = os.environ.get('BLOB_READ_WRITE_TOKEN')
if VERCEL_BLOB_TOKEN:
    print("Vercel Blob API token found in environment.")
else:
    print("No Vercel Blob API token found. Set BLOB_READ_WRITE_TOKEN environment variable for Vercel Blob API access.")

# Initialize storage providers - try Vercel Blob first, fallback to local
storage_providers = [
    # Vercel Blob Storage provider
    get_storage_provider(
        provider_type='vercel-blob',
        blob_url='https://vo7lsadihjfbcuiv.public.blob.vercel-storage.com',
        store_id='store_vO7lSadIHJFbCUIv'
    ),
    # Local storage provider as fallback
    get_storage_provider(
        provider_type='local',
        storage_dir='storage'
    )
]

# Create output directories if they don't exist
images_dir = "images"
plys_dir = "plys"
metadata_dir = "metadata"
os.makedirs(images_dir, exist_ok=True)
os.makedirs(plys_dir, exist_ok=True)
os.makedirs(metadata_dir, exist_ok=True)

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    # Generate timestamp for unique filenames
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_filename = f"generated_{timestamp}"
    image_filename = f"{base_filename}.png"
    image_path = os.path.join(images_dir, image_filename)
    ply_path = os.path.join(plys_dir, base_filename)  # No extension, will be added by generate_ply
    metadata_path = os.path.join(metadata_dir, f"metadata_{timestamp}.json")
    
    # Create server URLs for monitoring
    server_url = request.url_root.rstrip('/')
    expected_image_url = f"{server_url}/files/{image_filename}"
    expected_ply_url = f"{server_url}/files/{base_filename}.ply"  # Assuming .ply extension
    metadata_url = f"{server_url}/metadata/{os.path.basename(metadata_path)}"
    
    # Create initial metadata - will be updated as processing continues
    initial_metadata = {
        "id": timestamp,
        "timestamp": timestamp,
        "prompt": prompt,
        "status": "processing",
        "expected_image_path": image_path,
        "expected_image_url": expected_image_url,
        "expected_ply_path": f"{ply_path}.ply",
        "expected_ply_url": expected_ply_url,
        "metadata_path": metadata_path,
        "metadata_url": metadata_url
    }
    
    # Save the initial metadata
    with open(metadata_path, 'w') as f:
        json.dump(initial_metadata, f, indent=4)
    
    # Return the initial metadata to the client immediately so they can monitor progress
    initial_response = {
        "success": True,
        "message": "Generation started. You can monitor progress using the metadata.",
        "id": timestamp,
        "metadata_path": metadata_path,
        "metadata_url": metadata_url,
        "expected_image_url": expected_image_url,
        "expected_ply_url": expected_ply_url,
        "status": "processing"
    }
    
    # Start the processing in a background thread
    import threading
    thread = threading.Thread(target=process_generation, args=(prompt, timestamp, image_path, ply_path, metadata_path))
    thread.daemon = True
    thread.start()
    
    return jsonify(initial_response)

def process_generation(prompt, timestamp, image_path, ply_path, metadata_path):
    """
    Function to handle the image and PLY generation in a background thread.
    """
    try:
        # Get server URL for file URLs
        server_url = "http://localhost:5000"  # Default fallback
        
        # Update metadata to indicate image generation started
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            metadata["image_status"] = "generating"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
        except Exception as e:
            print(f"Error updating metadata: {str(e)}")
        
        # Step 1: Generate image with GPT-Image-1
        print(f"Generating image for prompt: {prompt[:50]}...")
        result = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            n=1,
            size="1024x1024"
        )
        
        # Save the image
        if hasattr(result.data[0], 'url') and result.data[0].url:
            # Download from URL if available
            image_url = result.data[0].url
            image_response = requests.get(image_url)
            image = Image.open(BytesIO(image_response.content))
            image.save(image_path)
        elif hasattr(result.data[0], 'b64_json') and result.data[0].b64_json:
            # Extract base64 encoded image
            image_base64 = result.data[0].b64_json
            image_bytes = base64.b64decode(image_base64)
            
            # Save the image to a file
            with open(image_path, "wb") as f:
                f.write(image_bytes)
        else:
            print("No image data found in the response")
            # Update metadata to indicate image generation failed
            try:
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                metadata["image_status"] = "failed"
                metadata["status"] = "failed"
                metadata["error"] = "No image data found in the response"
                with open(metadata_path, 'w') as f:
                    json.dump(metadata, f, indent=4)
            except Exception as e:
                print(f"Error updating metadata: {str(e)}")
            return
        
        # Update metadata to indicate image generation complete
        image_filename = os.path.basename(image_path)
        server_image_url = f"{server_url}/files/{image_filename}"
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            metadata["image_status"] = "completed"
            metadata["image_path"] = image_path
            metadata["image_url"] = server_image_url
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
        except Exception as e:
            print(f"Error updating metadata: {str(e)}")
        
        # Step 2: Generate PLY using the get_ply function
        ply_error = None
        final_ply_path = None
        
        # Update metadata to indicate PLY generation started
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            metadata["ply_status"] = "generating"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
        except Exception as e:
            print(f"Error updating metadata: {str(e)}")
        
        print(f"Generating 3D model from image: {image_path}...")
        try:
            final_ply_path = generate_ply(
                image_path,
                prompt,
                ply_path
            )
            print(f"PLY generation successful: {final_ply_path}")
        except Exception as e:
            ply_error = str(e)
            print(f"Error generating PLY: {ply_error}")
            
            # Update metadata to indicate PLY generation failed
            try:
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                metadata["ply_status"] = "failed"
                metadata["ply_error"] = ply_error
                with open(metadata_path, 'w') as f:
                    json.dump(metadata, f, indent=4)
            except Exception as e:
                print(f"Error updating metadata: {str(e)}")
        
        # Step 3: Upload PLY to cloud storage (if available)
        storage_result = None
        if final_ply_path and os.path.exists(final_ply_path):
            # Update metadata to indicate PLY upload started
            try:
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                metadata["ply_upload_status"] = "uploading"
                with open(metadata_path, 'w') as f:
                    json.dump(metadata, f, indent=4)
            except Exception as e:
                print(f"Error updating metadata: {str(e)}")
                
            # If Vercel token is available, try using the Vercel API
            if VERCEL_BLOB_TOKEN:
                try:
                    print("Uploading PLY using Vercel API...")
                    storage_result = upload_to_vercel_blob(
                        file_path=final_ply_path,
                        store_id="store_vO7lSadIHJFbCUIv",
                        token=VERCEL_BLOB_TOKEN
                    )
                    print("Successfully uploaded PLY to Vercel Blob using API token")
                except Exception as e:
                    print(f"Error uploading to Vercel Blob API: {str(e)}")
                    # Fall back to alternative storage methods
            
            # If Vercel API upload failed or no token was available, try alternative methods
            if not storage_result:
                print("Trying alternative storage methods...")
                # Try each storage provider in order until one succeeds
                last_error = None
                for provider in storage_providers:
                    try:
                        storage_result = provider.upload_file(final_ply_path, content_type="application/octet-stream")
                        print(f"Successfully uploaded PLY to {storage_result.get('provider')} storage")
                        break
                    except Exception as e:
                        last_error = e
                        print(f"Error uploading PLY to {provider.__class__.__name__}: {str(e)}")
                        continue
                
                if not storage_result and last_error:
                    print(f"All storage providers failed. Last error: {str(last_error)}")
                    
                    # Update metadata to indicate upload failed
                    try:
                        with open(metadata_path, 'r') as f:
                            metadata = json.load(f)
                        metadata["ply_upload_status"] = "failed"
                        metadata["ply_upload_error"] = str(last_error)
                        with open(metadata_path, 'w') as f:
                            json.dump(metadata, f, indent=4)
                    except Exception as e:
                        print(f"Error updating metadata: {str(e)}")
        
        # Step 4: Final metadata update with complete results
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            # Update status to completed
            metadata["status"] = "completed"
            
            # If we have the PLY file, add its details
            if final_ply_path:
                ply_filename = os.path.basename(final_ply_path)
                server_ply_url = f"{server_url}/files/{ply_filename}"
                
                metadata["ply_path"] = final_ply_path
                metadata["ply_url"] = server_ply_url
                metadata["ply_status"] = "completed"
                
                # Add storage details if upload was successful
                if storage_result:
                    metadata["ply_upload_status"] = "completed"
                    metadata["storage"] = {
                        "provider": storage_result.get("provider"),
                        "url": storage_result.get("url")
                    }
                    
                    # Add provider-specific details
                    if storage_result.get("provider") == "s3":
                        metadata["storage"]["bucket"] = storage_result.get("bucket")
                        metadata["storage"]["key"] = storage_result.get("key")
                    elif storage_result.get("provider") == "vercel-blob":
                        metadata["storage"]["pathname"] = storage_result.get("pathname")
                    elif storage_result.get("provider") == "local":
                        storage_filename = os.path.basename(storage_result.get("path", ""))
                        metadata["storage"]["local_url"] = f"{server_url}/files/{storage_filename}"
            else:
                if not ply_error:
                    metadata["ply_status"] = "not_generated"
            
            # Save the final metadata
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
                
            print(f"Generation process completed for ID: {timestamp}")
            
        except Exception as e:
            print(f"Error updating final metadata: {str(e)}")
    
    except Exception as e:
        print(f"Error in background processing: {str(e)}")
        # Try to update metadata with error
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            metadata["status"] = "failed"
            metadata["error"] = str(e)
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=4)
        except:
            print("Could not update metadata with error")

# Add routes for serving files directly from the server
@app.route('/files/<path:filename>')
def serve_file(filename):
    """
    Serve files from various directories based on the file extension or path.
    This is a unified endpoint that will look for the file in all appropriate directories.
    """
    # First check if the file exists in plys directory
    if os.path.exists(os.path.join(plys_dir, filename)):
        return send_from_directory(plys_dir, filename)
    
    # Then check if it exists in images directory
    elif os.path.exists(os.path.join(images_dir, filename)):
        return send_from_directory(images_dir, filename)
    
    # Finally check if it exists in storage directory
    elif os.path.exists(os.path.join('storage', filename)):
        return send_from_directory('storage', filename)
    
    # If the file doesn't exist in any of these directories, return 404
    else:
        return jsonify({"error": f"File not found: {filename}"}), 404

@app.route('/metadata/<path:filename>')
def serve_metadata(filename):
    """Serve a metadata file from the metadata directory."""
    if os.path.exists(os.path.join(metadata_dir, filename)):
        return send_from_directory(metadata_dir, filename)
    else:
        return jsonify({"error": f"Metadata file not found: {filename}"}), 404

# Also keep specific endpoints for backward compatibility
@app.route('/plys/<path:filename>')
def serve_ply(filename):
    """Serve a PLY file from the plys directory."""
    return send_from_directory(plys_dir, filename)

@app.route('/images/<path:filename>')
def serve_image(filename):
    """Serve an image file from the images directory."""
    return send_from_directory(images_dir, filename)

@app.route('/storage/<path:filename>')
def serve_storage(filename):
    """Serve a file from the storage directory (local fallback storage)."""
    return send_from_directory('storage', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
