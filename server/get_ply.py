#!/usr/bin/env python
from gradio_client import Client, handle_file
import os
import shutil

def generate_ply(image_path, prompt, output_filename=None):
    """
    Generate a .ply file from an image using the Invisible Stitch Gradio app.
    
    Args:
        image_path (str): Path to the input image
        prompt (str): Prompt for expanding the scene
        output_filename (str, optional): Base filename to use for the output .ply file
                                         If None, will use the base name of the input image
    
    Returns:
        str: Path to the generated .ply file
    """
    try:
        # Get token from environment if available
        hf_token = os.environ.get("HF_TOKEN")

        if not hf_token:
            print("Warning: HF_TOKEN not found in environment variables. Proceeding without token.")
        
        # Initialize client with token if available
        client = Client(
            "paulengstler/invisible-stitch",
            hf_token=hf_token
        )
        
        # Make prediction
        result = client.predict(
            handle_file(image_path),
            prompt,
            api_name="/predict"
        )
        
        # If output_filename is provided, copy the result to the target location
        if output_filename:
            # If output_filename doesn't have .ply extension, add it
            if not output_filename.endswith('.ply'):
                output_filename += '.ply'
            
            # Create target directory if it doesn't exist
            output_dir = os.path.dirname(output_filename)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)
                
            # Copy the file from the result location to the target location
            shutil.copy(result, output_filename)
            return output_filename
        
        return result
    except Exception as e:
        # Raise the original exception
        raise e

if __name__ == "__main__":
    # Example usage when script is run directly
    # Example of file URL usage
    hf_token = os.environ.get("HF_TOKEN")
    client = Client(
        "paulengstler/invisible-stitch", 
        hf_token=hf_token
    )
    result = client.predict(
        handle_file('https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png'),
        "Expand this scene with a beautiful mountain landscape",
        api_name="/predict"
    )
    print(f"Generated 3D model saved at: {result}")
    
    # Example of local file usage
    image_path = os.path.join(os.path.dirname(__file__), "examples/photo-1469559845082-95b66baaf023.jpeg")
    if os.path.exists(image_path):
        result = generate_ply(
            image_path,
            "Expand this scene with a beautiful mountain landscape"
        )
        print(f"Generated 3D model saved at: {result}")
