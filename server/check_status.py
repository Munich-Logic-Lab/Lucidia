#!/usr/bin/env python
"""
A simple utility to check the status of a generation process.
"""
import os
import sys
import json
import requests
import argparse
from datetime import datetime

def check_generation_status(generation_id=None, metadata_url=None):
    """
    Check the status of a generation process by ID or metadata URL.
    
    Args:
        generation_id (str): ID of the generation process
        metadata_url (str): URL to the metadata file
    
    Returns:
        dict: Status information
    """
    if not generation_id and not metadata_url:
        raise ValueError("Either generation_id or metadata_url must be provided")
    
    # If metadata_url is provided, use it directly
    if metadata_url:
        try:
            response = requests.get(metadata_url)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching metadata: {e}")
            return None
    
    # If generation_id is provided, construct the metadata path
    if generation_id:
        # Try to construct the metadata URL
        # First, check the local file
        metadata_path = os.path.join("metadata", f"metadata_{generation_id}.json")
        
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error reading metadata file: {e}")
                return None
        
        # If local file doesn't exist, try to construct a URL
        base_url = "http://localhost:5000"  # Default, change to your server URL if different
        metadata_url = f"{base_url}/metadata/metadata_{generation_id}.json"
        
        try:
            response = requests.get(metadata_url)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching metadata: {e}")
            return None
    
    return None

def display_status(status_data):
    """Display status information in a readable format."""
    if not status_data:
        print("No status information available.")
        return
    
    print("\n=== Generation Status ===")
    print(f"ID: {status_data.get('id')}")
    print(f"Timestamp: {status_data.get('timestamp')}")
    print(f"Overall Status: {status_data.get('status', 'unknown')}")
    
    # Image status
    image_status = status_data.get('image_status', 'unknown')
    print(f"\nImage Status: {image_status}")
    if image_status == 'completed':
        print(f"  Image URL: {status_data.get('image_url', 'N/A')}")
    elif image_status == 'failed':
        print(f"  Error: {status_data.get('error', 'unknown error')}")
    
    # PLY status
    ply_status = status_data.get('ply_status', 'unknown')
    print(f"\nPLY Model Status: {ply_status}")
    
    if ply_status == 'completed':
        print(f"  PLY URL: {status_data.get('ply_url', 'N/A')}")
        
        # Storage details
        if 'storage' in status_data:
            storage = status_data['storage']
            print(f"\nStorage:")
            print(f"  Provider: {storage.get('provider', 'N/A')}")
            print(f"  URL: {storage.get('url', 'N/A')}")
            
            # Provider-specific details
            if storage.get('provider') == 's3':
                print(f"  Bucket: {storage.get('bucket', 'N/A')}")
                print(f"  Key: {storage.get('key', 'N/A')}")
            elif storage.get('provider') == 'vercel-blob':
                print(f"  Pathname: {storage.get('pathname', 'N/A')}")
            elif storage.get('provider') == 'local':
                print(f"  Local URL: {storage.get('local_url', 'N/A')}")
    elif ply_status == 'failed':
        print(f"  Error: {status_data.get('ply_error', 'unknown error')}")
    
    print("\nMetadata path:", status_data.get('metadata_path', 'N/A'))
    print("Prompt:", status_data.get('prompt', 'N/A'))
    print()

def main():
    parser = argparse.ArgumentParser(description='Check the status of a generation process.')
    parser.add_argument('--id', help='ID of the generation process')
    parser.add_argument('--url', help='URL to the metadata file')
    
    args = parser.parse_args()
    
    if not args.id and not args.url:
        print("Error: Either --id or --url must be provided.")
        parser.print_help()
        sys.exit(1)
    
    status_data = check_generation_status(args.id, args.url)
    display_status(status_data)

if __name__ == "__main__":
    main()