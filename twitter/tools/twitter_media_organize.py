import os
import shutil

# This script buckets files by their first 3 characters
# e.g. "GhZhNxa.jpg" moves to "GhZ/GhZhNxa.jpg"

source_dir = "." 

for filename in os.listdir(source_dir):
    # Only process files, ignore existing folders and the script itself
    if os.path.isfile(filename) and filename != "twitter_media_organize.py":
        prefix = filename[:3] # Create a folder name from first 3 chars
        
        if not os.path.exists(prefix):
            os.makedirs(prefix)
            
        shutil.move(filename, os.path.join(prefix, filename))
        print(f"Moved {filename} to {prefix}/")
		