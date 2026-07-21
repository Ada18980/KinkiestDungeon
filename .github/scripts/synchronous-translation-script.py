import csv
from collections import defaultdict
import time
import os
import json
import paratranz_client
from paratranz_client.models.file import File
from paratranz_client.rest import ApiException
from pprint import pprint
import asyncio

# Configuration for ParaTranz API
configuration = paratranz_client.Configuration(host = "https://paratranz.cn/api")
configuration.api_key['Token'] = os.environ.get('PARATRANZ_TOKEN')

def is_ml_key(key):
    """Whether a key belongs to the split m_/l_ CSV (starts with 'm_' or 'l_')."""
    return key.startswith('m_') or key.startswith('l_')

def process_csv(input_file, output_file, output_file_ml):
    # Read the CSV file and store data, splitting rows into the main CSV and
    # the m_/l_ CSV. Duplicate keys get a '_{count-1}' suffix (counted across
    # the full input, before splitting, so dedup results stay stable per bucket).
    key_counts = {}
    pre_processed_rows = []
    original_keys = []

    # Read the input file
    try:
        with open(input_file, 'r', newline='', encoding='utf-8') as infile:
            reader = csv.reader(infile)
            for row in reader:
                if not row:
                    continue

                original_key = row[0]

                count = key_counts.get(original_key, 0) + 1
                key_counts[original_key] = count
                new_key = f"{original_key}_{count-1}" if count > 1 else original_key

                pre_processed_rows.append([new_key] + row[1:])
                original_keys.append(original_key)

        main_rows = []
        ml_rows = []
        for row, original_key in zip(pre_processed_rows, original_keys):
            if len(row) != 2:
                continue
            bucket = ml_rows if is_ml_key(original_key) else main_rows
            bucket.append(row)

        with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(main_rows)
        with open(output_file_ml, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.writer(outfile)
            writer.writerows(ml_rows)
        print("Processed CSV successfully")
    except Exception as e:
        print(f"Error processing CSV: {e}")

async def paratran_update(file_id, file):
    async with paratranz_client.ApiClient(configuration) as api_client:
        api_instance = paratranz_client.FilesApi(api_client)
        project_id = 12190

        try:
            api_response = await api_instance.update_file(project_id, file_id, file=file)
            print(f"Uploaded file {file_id} successfully.")
        except Exception as e:
            print(f"Error uploading file {file_id}: {e}")

async def paratran_download_lines(file_id):
    """Download translations for one ParaTranz file and return the parsed text lines."""
    async with paratranz_client.ApiClient(configuration) as api_client:
        api_instance = paratranz_client.FilesApi(api_client)
        project_id = 12190

        try:
            data_raw = await api_instance.get_file_translation_with_http_info(project_id, file_id)
            json_object = json.loads(data_raw.raw_data.decode())
            json_object.sort(key=lambda x: x['id'])
            lines = []

            # Process each item in the JSON object
            for item in json_object:
                if item['original'] == item['translation']:  # Skip items where original equals translation
                    continue
                if item['translation'].startswith(":: "):  #If have ::,force match key
                    lines.append(':: '+item['key'])
                    lines.append(item['translation'].removeprefix(":: "))
                elif item['translation']:  # If translation is not empty
                    lines.append('- '+item['original'])
                    lines.append(item['translation'])
            print(f"Downloaded and processed translations for file {file_id} successfully")
            return lines
        except Exception as e:
            print(f"Error downloading file {file_id}: {e}")
            return []

async def paratran_download():
    output_content = [
        '#Go to https://paratranz.cn/projects/12190 to participate in KD localization',
        '#前往 https://paratranz.cn/projects/12190 参加KD汉化',
        '',
    ]
    # Merge translations from the main CSV and the m_/l_ CSV into one txt,
    # so downstream reorder (which uses the full source CSV) keeps m_/l_ translations.
    output_content += await paratran_download_lines(file_id_main)
    output_content += await paratran_download_lines(file_id_ml)

    with open(output_txt, 'w', encoding='utf-8') as file:
        for line in output_content:
            file.write(line + '\n')
    print("Downloaded and processed translations successfully")

# Input file and output file paths
input_csv = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv'
output_csv = 'Text_KinkyDungeon_Temp.csv'
output_csv_ml = 'Text_KinkyDungeon_Temp_ml.csv'
output_txt = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_CN_paratranz.txt'

project_id = 12190
file_id_main = 1638395   # Main file (non m_/l_ keys)
file_id_ml   = 3210791   # Split file for keys starting with m_ or l_

process_csv(input_csv, output_csv, output_csv_ml)
asyncio.run(paratran_update(file_id_main, output_csv))
asyncio.run(paratran_update(file_id_ml, output_csv_ml))
asyncio.run(paratran_download())
print('All operations completed.')