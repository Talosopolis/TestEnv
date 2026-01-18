import os
import json
from google.cloud import storage

BUCKET_NAME = "talos-dev-480518-talos-data"
VECTOR_FILE = "vector_store.json"

def repair_bucket():
    try:
        client = storage.Client()
        bucket = client.bucket(BUCKET_NAME)
        
        # Check if bucket exists
        if not bucket.exists():
            print(f"Bucket {BUCKET_NAME} missing! Creating...")
            bucket.create(location="us-central1")
        else:
            print(f"Bucket {BUCKET_NAME} found.")

        # Check vector store
        blob = bucket.blob(VECTOR_FILE)
        if not blob.exists():
            print(f"Missing {VECTOR_FILE}. Initializing empty store...")
            blob.upload_from_string(json.dumps({}), content_type="application/json")
            print("Repaired: Created empty vector_store.json")
        else:
            print(f"Found {VECTOR_FILE}. verifying content...")
            try:
                content = blob.download_as_text()
                data = json.loads(content)
                print(f"Vendor store valid. Items: {len(data)}")
            except json.JSONDecodeError:
                print("Corrupt JSON! Overwriting with empty store...")
                blob.upload_from_string(json.dumps({}), content_type="application/json")
                print("Repaired: Reset corrupt vector_store.json")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    repair_bucket()
