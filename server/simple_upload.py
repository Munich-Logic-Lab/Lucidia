#!/usr/bin/env python
"""
A simplified version of the Vercel Blob uploader to debug the issue.
"""
import os
import sys
import time
import requests

def main():
    if len(sys.argv) < 2:
        print("Usage: python simple_upload.py <filepath>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
    
    # Vercel Blob storage details
    # Try with and without trailing slash
    blob_url = "https://vo7lsadihjfbcuiv.public.blob.vercel-storage.com"
    store_id = "store_vO7lSadIHJFbCUIv"
    
    # Generate a unique filename with timestamp
    filename = os.path.basename(file_path)
    timestamp = int(time.time())
    unique_filename = f"{timestamp}_{filename}"
    
    # Full URL for the upload
    upload_url = f"{blob_url}/{unique_filename}"
    
    # Read the file
    print(f"Reading file: {file_path}")
    with open(file_path, 'rb') as f:
        file_content = f.read()
    
    # Set headers
    headers = {
        'Content-Type': 'application/octet-stream',
        'x-vercel-blob-store-id': store_id
    }
    
    # Additional info for debugging
    print(f"File size: {len(file_content)} bytes")
    print(f"Upload URL: {upload_url}")
    print(f"Headers: {headers}")
    
    # Make the request
    print("Making PUT request...")
    response = requests.put(
        upload_url,
        data=file_content,
        headers=headers
    )
    
    # Print response details
    print(f"Response status: {response.status_code}")
    print(f"Response headers: {response.headers}")
    print(f"Response content: {response.text[:500]}")  # Show first 500 chars of response
    
    # Print URL if successful
    if response.status_code >= 200 and response.status_code < 300:
        print("\nSUCCESS!")
        print(f"File should be available at: {upload_url}")
    else:
        print("\nFAILED!")

if __name__ == "__main__":
    main()