import requests
import os
import json
import time

class VercelBlobStorage:
    """
    Client for interacting with Vercel Blob Storage.
    """
    def __init__(self, blob_url, store_id):
        """
        Initialize the Vercel Blob Storage client.
        
        Args:
            blob_url (str): Base URL for the Vercel Blob storage
            store_id (str): Store ID for the Vercel Blob storage
        """
        self.blob_url = blob_url.rstrip('/')
        self.store_id = store_id
        
    def upload_file(self, file_path, content_type="application/octet-stream"):
        """
        Upload a file to Vercel Blob Storage.
        
        Args:
            file_path (str): Path to the file to upload
            content_type (str, optional): Content type of the file
            
        Returns:
            dict: Response with URL and other metadata
        """
        filename = os.path.basename(file_path)
        timestamp = int(time.time())
        
        # Generate a unique pathname to avoid conflicts
        pathname = f"{timestamp}_{filename}"
        
        # Prepare the request URL - use the direct URL pattern
        upload_url = f"{self.blob_url}/{pathname}"
        
        # Read the file
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # Make the PUT request to upload the file
        headers = {
            'Content-Type': content_type,
            'x-vercel-blob-store-id': self.store_id
        }
        
        # Debug info
        print(f"Uploading to: {upload_url}")
        print(f"Headers: {headers}")
        
        response = requests.put(
            upload_url,
            data=file_content,
            headers=headers
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {response.headers}")
        
        try:
            # Try to parse response as JSON
            result = response.json()
        except json.JSONDecodeError:
            # If not JSON, just create a simple response
            if response.status_code >= 200 and response.status_code < 300:
                result = {
                    "url": upload_url,
                    "pathname": pathname
                }
            else:
                raise Exception(f"Error uploading file: HTTP {response.status_code}, {response.text}")
                
        return result