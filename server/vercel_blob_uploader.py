#!/usr/bin/env python
"""
A client for uploading files to Vercel Blob Storage using the Vercel Blob CDN.

This approach uses direct upload to the public CDN endpoint. This works for
public stores where the store ID is used as authentication.
"""
import os
import sys
import json
import time
import mimetypes
import requests
import base64
import hashlib
from urllib.parse import quote

def upload_to_vercel_blob(file_path, blob_url, store_id):
    """
    Upload a file to Vercel Blob Storage using direct upload to the public CDN.
    
    Args:
        file_path (str): Path to the file to upload
        blob_url (str): Base URL for the Vercel Blob CDN
        store_id (str): Store ID for the Vercel Blob storage
        
    Returns:
        dict: Response with URL and other metadata
    """
    # Make sure the blob_url doesn't have a trailing slash
    blob_url = blob_url.rstrip('/')
    
    # Determine content type
    content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
    
    # Generate a unique identifier for the file based on content and timestamp
    timestamp = int(time.time())
    filename = os.path.basename(file_path)
    
    # Create a unique path with timestamp to avoid conflicts
    file_hash = hashlib.md5(f"{filename}-{timestamp}".encode()).hexdigest()[:8]
    unique_path = f"{timestamp}-{file_hash}-{filename}"
    
    # URL-encode the unique path
    encoded_path = quote(unique_path)
    
    # Construct the URL
    upload_url = f"{blob_url}/{encoded_path}"
    
    # Read the file
    with open(file_path, 'rb') as f:
        file_content = f.read()
    
    # Upload headers
    headers = {
        'Content-Type': content_type,
        'x-vercel-blob-store-id': store_id
    }
    
    print(f"Uploading {file_path} ({len(file_content)} bytes) to {upload_url}")
    print(f"Headers: {headers}")
    
    # Make the PUT request
    response = requests.put(
        upload_url,
        data=file_content,
        headers=headers,
        timeout=60
    )
    
    print(f"Response status: {response.status_code}")
    print(f"Response headers: {dict(response.headers)}")
    
    # Check if the upload was successful
    if response.status_code in (200, 201):
        print("Upload successful!")
        return {
            'url': upload_url,
            'pathname': unique_path,
            'contentType': content_type,
            'size': len(file_content)
        }
    else:
        # Try to parse error message
        try:
            error_json = response.json()
            error_message = error_json.get('error', {}).get('message', response.text)
        except:
            error_message = response.text
            
        raise Exception(f"Upload failed ({response.status_code}): {error_message}")

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <filepath>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
    
    blob_url = "https://vo7lsadihjfbcuiv.public.blob.vercel-storage.com"
    store_id = "store_vO7lSadIHJFbCUIv"
    
    try:
        result = upload_to_vercel_blob(file_path, blob_url, store_id)
        print("\nUpload result:")
        print(f"URL: {result['url']}")
        print(f"Pathname: {result['pathname']}")
        print(f"Size: {result['size']} bytes")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()