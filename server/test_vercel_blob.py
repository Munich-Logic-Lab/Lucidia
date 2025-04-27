#!/usr/bin/env python
"""
Test script for uploading files to Vercel Blob Storage using the v2 API.
"""
import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def upload_to_vercel_blob(file_path):
    """
    Upload a file to Vercel Blob Storage using the v2 API.
    
    Args:
        file_path (str): Path to the file to upload
    """
    # Get token from environment
    token = os.environ.get('BLOB_READ_WRITE_TOKEN')
    if not token:
        print("Error: BLOB_READ_WRITE_TOKEN environment variable not set.")
        print("Please set it with your Vercel API token that has Blob access.")
        sys.exit(1)
    
    # Define the store ID
    store_id = 'store_vO7lSadIHJFbCUIv'
    
    # Get file name
    file_name = os.path.basename(file_path)
    
    print(f"Uploading file: {file_path}")
    
    # Step 1: Generate a signed upload URL
    print("Getting signed upload URL...")
    url = f'https://api.vercel.com/v2/blob/upload-url?storeId={store_id}'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers)
    
    if response.status_code != 200:
        print(f"Error getting upload URL: {response.status_code}")
        print(response.text)
        sys.exit(1)
        
    # Extract the upload URL from the response
    upload_url = response.json()['url']
    print(f"Upload URL: {upload_url}")
    
    # Step 2: Upload the file
    print(f"Uploading file contents...")
    with open(file_path, 'rb') as file:
        upload_response = requests.put(upload_url, data=file)
        
        if upload_response.status_code not in (200, 201):
            print(f"Error uploading file: {upload_response.status_code}")
            print(upload_response.text)
            sys.exit(1)
    
    print("Upload successful!")
    
    # Print response details
    print("\nResponse Headers:")
    for key, value in upload_response.headers.items():
        print(f"{key}: {value}")
    
    # Try to get the URL from the response
    blob_url = upload_response.headers.get('x-vercel-blob-url')
    if blob_url:
        print(f"\nBlob URL: {blob_url}")
    else:
        # If not in headers, construct a likely URL
        blob_url = f"https://{store_id}.public.blob.vercel-storage.com/{file_name}"
        print(f"\nConstructed Blob URL: {blob_url}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <file_path>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
        
    upload_to_vercel_blob(file_path)