import os
import shutil

source_dir = "dataset/katakana"
destination_parent_dir = "dataset/kanaValidationSeparated"


if not os.path.exists(destination_parent_dir):
    os.makedirs(destination_parent_dir)

# Iterate through files in the source directory
for index, filename in enumerate(sorted(os.listdir(source_dir))):
    if index % 7 == 0:
        source_file = os.path.join(source_dir, filename)
        
        if os.path.isfile(source_file):
            romanji = filename.split("_")[0]
            
            # Create directory for the romanji if it doesn't exist
            destination_dir = os.path.join(destination_parent_dir, romanji)
            if not os.path.exists(destination_dir):
                os.makedirs(destination_dir)
            
            # Move the image to the corresponding directory
            destination_file = os.path.join(destination_dir, filename)
            shutil.move(source_file, destination_file)
            print(f"Moved file: {filename} to {destination_dir}")

print("Done moving files.")