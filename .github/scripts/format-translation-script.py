# This script is used to reorder and deduplicate the translation files according to the order of the source text files. Doing so has the following effects:
# - For merging PRs in the future, the translation content supports insertion at any position, and the script will automatically reorder and retain the first non-repeated translation content.(You can rest assured to cover the content)
# - If the source text in the source file is modified in the future, the script will not retain the old translation content in the translation file, reducing the generation of obsolete translation content.
# - Use `### Original` instead of untranslated original text lines to facilitate translators to find and compare untranslated content, and translators do not need to open the source file for copying, improving work efficiency.
# - Retain the empty lines and order of the original file, so that the translation work can be browsed according to the classification of the original file.
# - Remove duplicate content in the translation file to avoid repeated translation.
#
# Git-Action automation configuration:
# This script has been configured in Git-Action. When the translation file or source text file changes, the action is automatically triggered to execute the reorder overwrite operation.
#
# Operation process:
# - Read the Text_KinkyDungeon.csv file and retain empty lines and order.
# - Read the Text_KinkyDungeon_[lang].txt file and store the content in a list.
# - Reorder the content of the translation file according to the order of the Text_KinkyDungeon.csv file
#     - If there is no corresponding translation, use `### Original` instead
#     - If there is duplicate translation, it will not be written

import os
import csv
import sys

# Read the csv file
def read_csv_with_empty_lines(file_path) -> list:
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        lines = []
        for row in reader:
            # Retain empty lines
            if not row:
                lines.append(None)
                continue
                
            if len(row) != 2:
                print(f'<ABNORMAL> {row}')
                continue
                
            lines.append(row)
        return lines
    

# Read the translation file
def read_translation_file(file_path) -> list:
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = [line.strip() for line in file.readlines()]
    return lines


def write_translated_file(csv_lines : list, translations : list, output_path : str):
    translated = set()
    with open(output_path, 'w', encoding='utf-8') as file:
        for line in csv_lines:
            if (line is None) or (not line[1]):
                file.write('\n')  
                continue
            
            key, original, *_ = line
            
            if original in translated:
                # Not sure if it is better to mark
                # file.write(f'<!REPEAT> {original}\n')
                continue
                
            translated.add(original)
            
            # The next line of the original text corresponding to the List is the translation. If the translation is not found, use "# Original" instead.
            original_index = translations.index(original) if original in translations else -1
            if original_index == -1:
                file.write(f'### {original}\n')
                continue
            translation = translations[original_index + 1]
            file.write(f'{original}\n{translation}\n')

original_csv_path = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv'

# Enable the translation files to be reordered
translation_files = [
    'Text_KinkyDungeon_CN.txt',
    'Text_KinkyDungeon_DE.txt',
    'Text_KinkyDungeon_KR.txt',
    'Text_KinkyDungeon_RU.txt',
    'Text_KinkyDungeon_JP.txt',
    'Text_KinkyDungeon_ES.txt',
    ]
translation_files = [f'Screens/MiniGame/KinkyDungeon/{file}' for file in translation_files]


modified_files = sys.argv[1:]
print(f'Modified Files: {modified_files}')

# if originnal file is modified, then all translation files need to be reformatted
if original_csv_path in modified_files:
    modified_files = translation_files

modified_files = [file for file in modified_files if file in translation_files]

csv_lines = read_csv_with_empty_lines(original_csv_path)

for file in modified_files:
    if not os.path.exists(file):
        print(f'File not found: {file}')
        continue
    
    print(f'Processing : {file}')
    translations = read_translation_file(file)
    write_translated_file(csv_lines, translations, file)
