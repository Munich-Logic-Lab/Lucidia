#!/usr/bin/env python
"""
Test script for uploading a PLY file to Vercel Blob Storage.
"""
import os
import sys
import argparse
from vercel_storage import VercelBlobStorage

def main():
    parser = argparse.ArgumentParser(description='Upload a PLY file to Vercel Blob Storage.')
    parser.add_argument('file_path', help='Path to the PLY file to upload')
    args = parser.parse_args()
    
    file_path = args.file_path
    
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
    
    # Initialize Vercel Blob Storage client
    vercel_blob = VercelBlobStorage(
        blob_url="https://vo7lsadihjfbcuiv.public.blob.vercel-storage.com/",
        store_id="store_vO7lSadIHJFbCUIv"
    )
    
    try:
        print(f"Uploading {file_path} to Vercel Blob Storage...")
        result = vercel_blob.upload_file(file_path, content_type="application/octet-stream")
        print(f"Upload successful!")
        print(f"Blob URL: {result.get('url')}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()