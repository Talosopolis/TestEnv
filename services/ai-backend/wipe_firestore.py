
import os
import firebase_admin
from firebase_admin import credentials, firestore

from dotenv import load_dotenv
load_dotenv()

project_id = "talos-dev-480518"
if not project_id:
    print("No GCP_PROJECT environment variable found. Cannot connect to Prod.")
    exit(1)

print(f"Connecting to Firestore Project: {project_id}...")

# Initialize without credentials (uses ADC from Cloud Run / Dev Environment)
if not firebase_admin._apps:
    app = firebase_admin.initialize_app(options={'projectId': project_id})

db = firestore.client()

def delete_collection(coll_ref, batch_size):
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0

    for doc in docs:
        print(f"Deleting doc {doc.id} => {doc.to_dict().get('title', 'No Title')}")
        doc.reference.delete()
        deleted += 1

    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)
    return deleted

print("Starting wipe of 'courses' collection...")
count = delete_collection(db.collection("courses"), 50)
print(f"Finished. Deleted {count} documents (approx) from 'courses'.")

print("Starting wipe of 'users' collection (Economy)...")
count_users = delete_collection(db.collection("users"), 50)
print(f"Finished. Deleted {count_users} documents (approx) from 'users'.")
