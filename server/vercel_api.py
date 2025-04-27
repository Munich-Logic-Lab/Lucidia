#!/usr/bin/env python
"""
A client for Vercel Blob Storage using the Vercel API.
This approach uses the official Vercel API to upload files to Blob Storage.
"""
import os
import sys
import json
import requests
from urllib.parse import urlparse
import mimetypes

def upload_to_vercel_blob(file_path, store_id, token=None):
    """
    Upload a file to Vercel Blob Storage using the Vercel API.
    
    Args:
        file_path (str): Path to the file to upload
        store_id (str): Store ID for the Vercel Blob storage
        token (str, optional): Vercel API token with Blob access
            If not provided, tries to get it from BLOB_READ_WRITE_TOKEN env var
            
    Returns:
        dict: Response with URL and other metadata
    """
    # Get token from environment if not provided
    token = token or os.environ.get('BLOB_READ_WRITE_TOKEN')
    if not token:
        raise ValueError("Vercel API token is required. Provide it as a parameter or set BLOB_READ_WRITE_TOKEN env var.")
    
    # Get file name and content type
    file_name = os.path.basename(file_path)
    content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
    
    print(f"Uploading {file_path} to Vercel Blob Storage...")
    
    # Step 1: Generate a signed upload URL using the v2 API endpoint
    print("Generating signed upload URL...")
    url = f'https://api.vercel.com/v2/blob/upload-url?storeId={store_id}'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Make the request to get the upload URL
    response = requests.post(url, headers=headers)
    if response.status_code != 200:
        print(f"Error response: {response.text}")
        raise Exception(f"Failed to get upload URL: {response.status_code} - {response.text}")
    
    # Get the upload URL from the response
    upload_url = response.json()['url']
    print(f"Got upload URL: {upload_url}")
    
    # Step 2: Upload the file to the signed URL
    print("Uploading file to signed URL...")
    with open(file_path, 'rb') as file:
        upload_response = requests.put(
            upload_url, 
            data=file,
            headers={
                'Content-Type': content_type
            }
        )
        if upload_response.status_code not in (200, 201):
            raise Exception(f"Failed to upload file: {upload_response.status_code} - {upload_response.text}")
    
    print("File uploaded successfully!")
    
    # The URL of the uploaded file is in the response headers
    blob_url = upload_response.headers.get('x-vercel-blob-url')
    if not blob_url:
        # If the URL isn't in the headers, construct it
        blob_url = f"https://{store_id}.public.blob.vercel-storage.com/{file_name}"
        print(f"Warning: Could not find blob URL in response headers, using constructed URL: {blob_url}")
    
    print(f"File available at: {blob_url}")
    
    return {
        'url': blob_url,
        'filepath': file_name,
        'contentType': content_type,
        'size': os.path.getsize(file_path),
        'provider': 'vercel-blob-api'
    }

def main():
    """Command-line interface for testing Vercel Blob Storage."""
    if len(sys.argv) < 3:
        print(f"Usage: {sys.argv[0]} <store_id> <file_path> [token]")
        print("  If token is not provided, it will be read from BLOB_READ_WRITE_TOKEN env var")
        sys.exit(1)
    
    store_id = sys.argv[1]
    file_path = sys.argv[2]
    token = sys.argv[3] if len(sys.argv) > 3 else None
    
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
    
    try:
        result = upload_to_vercel_blob(file_path, store_id, token)
        print("\nUpload result:")
        print(f"URL: {result['url']}")
        print(f"File path: {result['filepath']}")
        print(f"Content type: {result['contentType']}")
        print(f"Size: {result['size']} bytes")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()