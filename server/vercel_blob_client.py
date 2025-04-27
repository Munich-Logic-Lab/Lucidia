#!/usr/bin/env python
"""
A client for Vercel Blob Storage that follows the Vercel Blob API documentation.
"""
import requests
import os
import json
import time
import sys

class VercelBlobClient:
    def __init__(self, store_id):
        """
        Initialize the Vercel Blob client.
        
        Args:
            store_id (str): The Vercel Blob store ID
        """
        self.store_id = store_id
        
    def upload_file(self, file_path, content_type="application/octet-stream"):
        """
        Upload a file to Vercel Blob Storage.
        
        Args:
            file_path (str): Path to the file to upload
            content_type (str): Content type of the file
            
        Returns:
            dict: Details about the uploaded file including URL
        """
        # Base URL for the Vercel Blob Storage
        base_url = "https://blob.vercel-storage.com"
        
        # Generate a unique filename with timestamp
        filename = os.path.basename(file_path)
        timestamp = int(time.time())
        unique_name = f"{timestamp}_{filename}"
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # 1. Request a presigned URL for upload
        print("Requesting presigned URL...")
        presigned_req = requests.post(
            f"{base_url}/upload/presigned",
            headers={
                "Content-Type": "application/json",
                "x-api-version": "5",
                "x-store-id": self.store_id
            },
            json={
                "size": file_size,
                "contentType": content_type,
                "pathname": unique_name
            }
        )
        
        if presigned_req.status_code != 200:
            print(f"Error getting presigned URL: {presigned_req.status_code}")
            print(presigned_req.text)
            raise Exception(f"Error getting presigned URL: {presigned_req.text}")
            
        presigned_data = presigned_req.json()
        print(f"Presigned URL response: {json.dumps(presigned_data, indent=2)}")
        
        # If the response doesn't contain uploadUrl, something went wrong
        if "uploadUrl" not in presigned_data:
            raise Exception(f"No uploadUrl in presigned response: {presigned_data}")
            
        upload_url = presigned_data["uploadUrl"]
        
        # 2. Upload the file to the presigned URL
        print(f"Uploading file ({file_size} bytes) to presigned URL...")
        with open(file_path, "rb") as f:
            file_content = f.read()
            
        upload_response = requests.put(
            upload_url,
            data=file_content,
            headers={
                "Content-Type": content_type
            }
        )
        
        if upload_response.status_code not in [200, 201]:
            print(f"Upload error: {upload_response.status_code}")
            print(upload_response.text)
            raise Exception(f"Error uploading file: {upload_response.text}")
            
        print("Upload successful!")
        
        # 3. Construct the public URL
        # Per Vercel docs: "https://<store-id>.public.blob.vercel-storage.com/<pathname>"
        public_url = f"https://{self.store_id.lower()}.public.blob.vercel-storage.com/{unique_name}"
        
        return {
            "url": public_url,
            "pathname": unique_name,
            "size": file_size,
            "contentType": content_type
        }

def main():
    """Simple command-line interface for testing the client."""
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <file_path>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
        
    # The store ID for Vercel Blob Storage
    store_id = "store_vO7lSadIHJFbCUIv"
    
    # Create client and upload file
    client = VercelBlobClient(store_id)
    
    try:
        result = client.upload_file(file_path)
        print("\nUpload result:")
        print(f"Public URL: {result['url']}")
        print(f"Path: {result['pathname']}")
        print(f"Size: {result['size']} bytes")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()