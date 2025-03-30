import csv
import argparse
from pathlib import Path
from collections import defaultdict

IGNORE_KEYS = [
    "RestartNeededEN", "RestartNeededCN", "RestartNeededKR", "RestartNeededJP", "RestartNeededES", "RestartNeededFR", "RestartNeededRU",
    "KDVersionStr"
]

default_translation_files = [f'Screens/MiniGame/KinkyDungeon/{file}' for file in  [
    'Text_KinkyDungeon_CN.txt',
    'Text_KinkyDungeon_DE.txt',
    'Text_KinkyDungeon_KR.txt',
    'Text_KinkyDungeon_RU.txt',
    'Text_KinkyDungeon_JP.txt',
    'Text_KinkyDungeon_ES.txt',
]]
default_origin_csv_path = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv'
default_output_dir = 'Screens/MiniGame/KinkyDungeon/'

errors_csv_rowcount = []
text_keys = defaultdict(list)

# Read the CSV file
def parse_csv_lines(file_path) -> list:
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        lines = []
        for row in reader:
            # Retain empty lines
            if not row:
                lines.append(None)
                continue
                
            if len(row) != 2:
                errors_csv_rowcount.append(row)
                continue
            
            if row[0] in IGNORE_KEYS:
                continue
        
            text_keys[row[1]].append(row[0])
            lines.append((row[0], row[1]))
        return lines

def parse_translation_file(translation_path):
    """Parse the translation file and return two mapping dictionaries: one based on keys and one based on original text."""
    key_based = {}
    text_based = {}
    
    with open(translation_path, 'r', encoding='utf-8') as f:
        lines = [line.lstrip().rstrip("\n") for line in f.readlines()]
    
    i = 0
    while i < len(lines) - 1:
        if lines[i].startswith('::'):
            # Match based on keys
            key = lines[i][2:].strip()
            translation = lines[i+1]
            key_based[key] = translation
            i += 2
        elif lines[i].startswith('-'):
            # Match based on original text
            original_text = lines[i][1:].strip()
            translation = lines[i+1]
            text_based[original_text] = translation
            i += 2
        else:
            # Skip lines that do not match the format
            i += 1
    
    return key_based, text_based

def reorder_translations(source_csv, translation_files, output_dir):
    """Reorder translation files based on the order of the original CSV."""
    
    processed_texts = set()
    
    # Read the original CSV file
    source_data = parse_csv_lines(source_csv)
    
    # Process each translation file
    for trans_file in translation_files:
        trans_path = Path(trans_file)
        key_based, text_based = parse_translation_file(trans_path)
        
        # Build new translation content
        new_content = []
        for sd in source_data:
            if sd is None:
                new_content.append("")
                continue
            key, original_text = sd
            
            # Skip if the text has already been processed
            if original_text in processed_texts:
                continue
            
            # Match based on keys or text
            # If the key is not unique or explicitly specified, all keys (or placeholder keys) will be displayed
            # Using strip to ensure translations are not lost due to whitespace changes
            # This may cause two texts like "text" and "text " to use the same translation, but such cases are considered unreasonable
            text_translation = text_based.get(original_text.strip(), None)
            
            # Text-based matching
            if text_translation:
                new_content.append(f"- {original_text}")
                new_content.append(text_translation)
            else:
                new_content.append(f"# - {original_text}")
                
            # Key-based matching
            keys = text_keys.get(original_text, [])
            keys_len = len(keys)
            for key in keys:
                key_translation = key_based.get(key, None)
                if key_translation:
                    new_content.append(f":: {key}")
                    new_content.append(key_translation)
                # If there is only one key, no need to display a placeholder for the key
                elif keys_len > 1:
                    new_content.append(f"# :: {key}")
            
            processed_texts.add(original_text)
        
        # Write to the output file
        output_path = Path(output_dir) / trans_path.name
        with open(output_path, 'w', encoding='utf-8') as f:
            for line in new_content:
                f.write(line + '\n')
        
        print(f"Processed and saved: {output_path}")

def main():
    parser = argparse.ArgumentParser(description='Reorder translation files to match the order of the original CSV.')
    parser.add_argument('--source_csv', help='Path to the original CSV file', default=default_origin_csv_path)
    parser.add_argument('--translation_files', nargs='+', help='One or more translation file paths', default=default_translation_files)
    parser.add_argument('--output-dir', help='Output directory', default=default_output_dir)
    
    args = parser.parse_args()
    
    # Create the output directory
    Path(args.output_dir).mkdir(exist_ok=True)
    
    # Check if files exist
    hasErrors = False
    if not Path(args.source_csv).exists():
        print(f"❌Error: Original CSV file {args.source_csv} does not exist.")
        hasErrors = True
    for file in args.translation_files:
        if not Path(file).exists():
            print(f"❌Error: Translation file {file} does not exist.")
            hasErrors = True
            continue
    if hasErrors:
        return
    
    reorder_translations(args.source_csv, args.translation_files, args.output_dir)

if __name__ == '__main__':
    main()
