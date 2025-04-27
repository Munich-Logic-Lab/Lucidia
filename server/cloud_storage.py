#!/usr/bin/env python
"""
A more general cloud storage solution using boto3 for AWS S3,
which is what Vercel Blob uses under the hood.

This approach provides a fallback when direct Vercel Blob upload is not available.
"""
import os
import sys
import json
import uuid
import time
import mimetypes
from datetime import datetime
from urllib.parse import urlparse

class CloudStorage:
    """Base class for cloud storage providers."""
    
    def upload_file(self, file_path, content_type=None):
        """Upload a file to cloud storage."""
        raise NotImplementedError("Subclasses must implement upload_file")

class LocalFileStorage(CloudStorage):
    """Local file storage that just copies files to a designated directory."""
    
    def __init__(self, storage_dir="storage"):
        """
        Initialize local file storage.
        
        Args:
            storage_dir (str): Directory where files will be stored
        """
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
    
    def upload_file(self, file_path, content_type=None):
        """
        'Upload' a file by copying it to the storage directory.
        
        Args:
            file_path (str): Path to the file to upload
            content_type (str, optional): Content type of the file
            
        Returns:
            dict: Response with URL and other metadata
        """
        import shutil
        
        # Generate a unique filename
        filename = os.path.basename(file_path)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        target_filename = f"{timestamp}_{unique_id}_{filename}"
        target_path = os.path.join(self.storage_dir, target_filename)
        
        # Copy the file
        shutil.copy2(file_path, target_path)
        
        # Determine content type if not provided
        if content_type is None:
            content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
        
        # Return metadata
        return {
            'url': f"file://{os.path.abspath(target_path)}",
            'path': target_path,
            'filename': target_filename,
            'contentType': content_type,
            'size': os.path.getsize(target_path),
            'provider': 'local'
        }

class VercelPublicBlobStorage(CloudStorage):
    """
    Vercel Public Blob Storage client.
    
    This implementation attempts direct upload to the public CDN URL.
    It may not work in all cases due to Vercel's authentication requirements.
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
    
    def upload_file(self, file_path, content_type=None):
        """
        Upload a file to Vercel Blob Storage.
        
        Args:
            file_path (str): Path to the file to upload
            content_type (str, optional): Content type of the file
            
        Returns:
            dict: Response with URL and other metadata
        """
        import requests
        from urllib.parse import quote
        
        # Determine content type if not provided
        if content_type is None:
            content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
        
        # Generate a unique filename
        filename = os.path.basename(file_path)
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]
        unique_path = f"{timestamp}-{unique_id}-{filename}"
        
        # URL-encode the unique path
        encoded_path = quote(unique_path)
        
        # Construct the URL
        upload_url = f"{self.blob_url}/{encoded_path}"
        
        # Read the file
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # Upload headers
        headers = {
            'Content-Type': content_type,
            'x-vercel-blob-store-id': self.store_id
        }
        
        # Make the PUT request
        response = requests.put(
            upload_url,
            data=file_content,
            headers=headers,
            timeout=60
        )
        
        # Check if the upload was successful
        if response.status_code in (200, 201):
            return {
                'url': upload_url,
                'pathname': unique_path,
                'contentType': content_type,
                'size': len(file_content),
                'provider': 'vercel-blob'
            }
        else:
            # Try to parse error message
            try:
                error_json = response.json()
                error_message = error_json.get('error', {}).get('message', response.text)
            except:
                error_message = response.text
                
            raise Exception(f"Upload failed ({response.status_code}): {error_message}")

class S3Storage(CloudStorage):
    """
    AWS S3 storage client.
    
    Requires boto3 to be installed: pip install boto3
    Requires AWS credentials to be configured.
    """
    
    def __init__(self, bucket_name, region_name='us-east-1', prefix=''):
        """
        Initialize the S3 storage client.
        
        Args:
            bucket_name (str): Name of the S3 bucket
            region_name (str): AWS region name
            prefix (str): Prefix for object keys (like a folder)
        """
        self.bucket_name = bucket_name
        self.region_name = region_name
        self.prefix = prefix.rstrip('/') + '/' if prefix else ''
    
    def upload_file(self, file_path, content_type=None):
        """
        Upload a file to S3.
        
        Args:
            file_path (str): Path to the file to upload
            content_type (str, optional): Content type of the file
            
        Returns:
            dict: Response with URL and other metadata
        """
        try:
            import boto3
        except ImportError:
            raise ImportError("boto3 is required for S3Storage. Install it with: pip install boto3")
        
        # Determine content type if not provided
        if content_type is None:
            content_type = mimetypes.guess_type(file_path)[0] or 'application/octet-stream'
        
        # Generate a unique key
        filename = os.path.basename(file_path)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        object_key = f"{self.prefix}{timestamp}_{unique_id}_{filename}"
        
        # Create S3 client
        s3_client = boto3.client('s3', region_name=self.region_name)
        
        # Upload file
        s3_client.upload_file(
            file_path, 
            self.bucket_name, 
            object_key,
            ExtraArgs={'ContentType': content_type}
        )
        
        # Generate URL
        url = f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{object_key}"
        
        return {
            'url': url,
            'bucket': self.bucket_name,
            'key': object_key,
            'contentType': content_type,
            'size': os.path.getsize(file_path),
            'provider': 's3'
        }

def get_storage_provider(provider_type=None, **kwargs):
    """
    Factory function to create a storage provider instance.
    
    Args:
        provider_type (str): Type of storage provider
        **kwargs: Additional arguments for the storage provider
        
    Returns:
        CloudStorage: An instance of a storage provider
    """
    if provider_type == 's3':
        if 'bucket_name' not in kwargs:
            raise ValueError("bucket_name is required for S3Storage")
        return S3Storage(**kwargs)
        
    elif provider_type == 'vercel-blob':
        if 'blob_url' not in kwargs or 'store_id' not in kwargs:
            raise ValueError("blob_url and store_id are required for VercelPublicBlobStorage")
        return VercelPublicBlobStorage(**kwargs)
        
    else:  # Default to local storage
        return LocalFileStorage(**kwargs)

def main():
    """Command-line interface for testing cloud storage providers."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Upload a file to cloud storage')
    parser.add_argument('file_path', help='Path to file to upload')
    parser.add_argument('--provider', choices=['local', 'vercel-blob', 's3'], default='local',
                        help='Storage provider to use')
    parser.add_argument('--bucket', help='S3 bucket name (for s3 provider)')
    parser.add_argument('--region', default='us-east-1', help='AWS region (for s3 provider)')
    parser.add_argument('--prefix', help='Key prefix (for s3 provider)')
    parser.add_argument('--blob-url', help='Vercel Blob URL (for vercel-blob provider)')
    parser.add_argument('--store-id', help='Vercel Blob store ID (for vercel-blob provider)')
    parser.add_argument('--storage-dir', default='storage', help='Local storage directory (for local provider)')
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.file_path):
        print(f"Error: File not found: {args.file_path}")
        sys.exit(1)
    
    # Create storage provider based on arguments
    kwargs = {}
    
    if args.provider == 's3':
        if not args.bucket:
            print("Error: --bucket is required for s3 provider")
            sys.exit(1)
        kwargs = {
            'bucket_name': args.bucket,
            'region_name': args.region
        }
        if args.prefix:
            kwargs['prefix'] = args.prefix
    
    elif args.provider == 'vercel-blob':
        if not args.blob_url or not args.store_id:
            print("Error: --blob-url and --store-id are required for vercel-blob provider")
            sys.exit(1)
        kwargs = {
            'blob_url': args.blob_url,
            'store_id': args.store_id
        }
    
    elif args.provider == 'local':
        kwargs = {'storage_dir': args.storage_dir}
    
    try:
        # Get storage provider
        storage = get_storage_provider(args.provider, **kwargs)
        
        # Upload file
        print(f"Uploading {args.file_path} using {args.provider} provider...")
        result = storage.upload_file(args.file_path)
        
        # Print result
        print("Upload successful!")
        print(f"URL: {result['url']}")
        print(f"Provider: {result['provider']}")
        print(f"Size: {result['size']} bytes")
        print(f"Content Type: {result['contentType']}")
        
        # Print provider-specific details
        if args.provider == 's3':
            print(f"Bucket: {result['bucket']}")
            print(f"Key: {result['key']}")
        elif args.provider == 'local':
            print(f"Path: {result['path']}")
        elif args.provider == 'vercel-blob':
            print(f"Pathname: {result['pathname']}")
    
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()