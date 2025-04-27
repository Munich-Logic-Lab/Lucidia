import requests
import json

# Server URL
url = "http://localhost:5000/generate-image"

# Test prompt for both image generation and Gradio 3D model
prompt = """
Create a photorealistic image of an enchanting forest clearing with ancient oak trees
and tall pines. The scene should have dappled sunlight filtering through the canopy,
creating golden rays that illuminate a small stream running through the center of the
clearing. Include a carpet of vibrant green moss and ferns covering the forest floor,
colorful wildflowers, a few large moss-covered rocks, and some fallen logs. The time
is late afternoon with a warm golden light giving the entire scene a magical quality.
"""

# Prepare the request
payload = {
    "prompt": prompt
}

# Send the request
print("Sending request to generate image and 3D model...")
response = requests.post(url, json=payload)

# Print the response
print(f"Status code: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

if response.status_code == 200:
    print("Image and 3D model generation successful!")
    print(f"Image saved at: {response.json().get('image_path')}")
    print(f"PLY model saved at: {response.json().get('ply_path')}")
    print(f"Metadata saved at: {response.json().get('metadata_path')}")
elif response.status_code == 207:
    print("Image generation successful, but 3D model generation failed.")
    print(f"Image saved at: {response.json().get('image_path')}")
    print(f"Error: {response.json().get('error')}")
    print(f"Metadata saved at: {response.json().get('metadata_path')}")
else:
    print("Request failed.")