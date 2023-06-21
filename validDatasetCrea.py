import os
import shutil

source_dir = "dataset/katakana"
destination_dir = "dataset/katakanaValidation"

#if not os.path.exists(destination_dir):
#    os.makedirs(destination_dir)

# Iterate through files in the source directory
for index, filename in enumerate(sorted(os.listdir(source_dir))):
    # Move the file if the index modulo 10 is zero
    if index % 10 == 0:
        source_file = os.path.join(source_dir, filename)
        destination_file = os.path.join(destination_dir, filename)
        shutil.move(source_file, destination_file)
        print(f"Moved file: {filename}")

print("Done moving files.")
