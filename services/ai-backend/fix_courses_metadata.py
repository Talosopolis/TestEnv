
import json
import os

DB_PATH = "courses.json"

def cleanup_courses():
    if not os.path.exists(DB_PATH):
        print("courses.json not found")
        return

    with open(DB_PATH, 'r') as f:
        data = json.load(f)

    updated_count = 0
    for course_id, course in data.items():
        # Tag legacy seed courses
        if "ownerId" not in course:
            course["ownerId"] = "system"
            course["isPublic"] = True
            updated_count += 1
            print(f"Updated {course.get('title', course_id)}: set owner='system', public=True")
        
        # Ensure newer courses have defaults if missing (though backend handles this, good for DB hygiene)
        if "isPublic" not in course:
            # If it has an owner but no public flag, assume private? 
            # Actually backend assumes False. Let's make it explicit False if owner != system?
            if course.get("ownerId") != "system":
                 course["isPublic"] = False
                 # modified logic: explicitly setting it helps debug
        
    with open(DB_PATH, 'w') as f:
        json.dump(data, f, indent=4)
        
    print(f"Total courses updated: {updated_count}")

if __name__ == "__main__":
    cleanup_courses()
