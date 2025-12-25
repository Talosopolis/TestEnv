import json
import os
from typing import Dict, Any

DATA_FILE = "courses.json"
GCP_PROJECT = os.getenv("GCP_PROJECT")

class PersistenceService:
    def __init__(self, data_file: str = DATA_FILE):
        self.data_file = data_file
        self.use_firestore = bool(GCP_PROJECT)
        self.firestore_client = None
        self.collection = None
        
        if self.use_firestore:
            try:
                from google.cloud import firestore
                # Assumes google.auth.default() works (Cloud Run default identity)
                self.firestore_client = firestore.Client(project=GCP_PROJECT)
                self.collection = self.firestore_client.collection("courses")
                print(f"PersistenceService: Using Firestore (Project: {GCP_PROJECT})")
            except Exception as e:
                print(f"PersistenceService Error initializing Firestore: {e}. Falling back to local.")
                self.use_firestore = False
        
        if not self.use_firestore:
            self.ensure_file_exists()

    def ensure_file_exists(self):
        if not os.path.exists(self.data_file):
            with open(self.data_file, 'w') as f:
                json.dump({}, f)

    def load_courses(self) -> Dict[str, Any]:
        if self.use_firestore and self.collection:
            try:
                courses = {}
                # Stream all documents in 'courses' collection
                docs = self.collection.stream()
                for doc in docs:
                    courses[doc.id] = doc.to_dict()
                print(f"PersistenceService: Loaded {len(courses)} courses from Firestore.")
                return courses
            except Exception as e:
                print(f"PersistenceService: Error loading from Firestore: {e}")
                return {}
        else:
            try:
                with open(self.data_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                return {}

    def save_courses(self, courses_db: Dict[str, Any]):
        if self.use_firestore and self.firestore_client and self.collection:
            try:
                batch = self.firestore_client.batch()
                count = 0
                for course_id, data in courses_db.items():
                    doc_ref = self.collection.document(course_id)
                    batch.set(doc_ref, data)
                    count += 1
                    if count >= 400:
                        batch.commit()
                        batch = self.firestore_client.batch()
                        count = 0
                if count > 0:
                    batch.commit()
                # Note: This logic does NOT delete courses removed from memory. 
                # Assuming append-only/update logic for now.
            except Exception as e:
                print(f"PersistenceService: Error saving to Firestore: {e}")
        else:
            try:
                with open(self.data_file, 'w') as f:
                    json.dump(courses_db, f, indent=4)
            except Exception as e:
                print(f"Error saving courses: {e}")
