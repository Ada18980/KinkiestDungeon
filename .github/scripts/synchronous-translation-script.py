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

def process_csv(input_file, output_file):
    # Read the CSV file and store data
    key_counts = {}
    processed_rows = []

    # Read the input file
    with open(input_file, 'r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        for row in reader:
            if not row:  
                continue
            
            original_key = row[0]
            
            # Update the counter and generate a new key name
            count = key_counts.get(original_key, 0) + 1
            key_counts[original_key] = count
            new_key = f"{original_key}_{count-1}" if count > 1 else original_key
            
            # Create a new row and add it to the results list
            processed_rows.append([new_key] + row[1:])

    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(processed_rows)
        
async def paratran_update():
    async with paratranz_client.ApiClient(configuration) as api_client:
        api_instance = paratranz_client.FilesApi(api_client)
        project_id = 12190
        file_id = 1638395
        file = output_csv

        try:
            # Update file
            api_response = await api_instance.update_file(project_id, file_id, file=file)
            print("The response of FilesApi->update_file:\n")
            pprint(api_response)
        except Exception as e:
            print("Exception when calling FilesApi->update_file: %s\n" % e)

async def paratran_download():
    async with paratranz_client.ApiClient(configuration) as api_client:
        api_instance = paratranz_client.FilesApi(api_client)
        project_id = 12190
        file_id = 1638395

        # File translation
        data_raw = await api_instance.get_file_translation_with_http_info(project_id, file_id)
        json_object = json.loads(data_raw.raw_data.decode())
        json_object.sort(key=lambda x: x['id'])
        output_content = []

        output_content.append('#Go to https://paratranz.cn/projects/12190 to participate in KD localization')
        output_content.append('#前往 https://paratranz.cn/projects/12190 参加KD汉化')
        output_content.append('')

        # Process each item in the JSON object
        for item in json_object:
            if item['original'] == item['translation']:  # Skip items where original equals translation
                continue
            if item['translation'].startswith(":: "):  #If have ::,force match key
                output_content.append(':: '+item['key'])
                output_content.append(item['translation'].removeprefix(":: "))
            elif item['translation']:  # If translation is not empty
                output_content.append('- '+item['original'])
                output_content.append(item['translation'])

        with open(output_txt, 'w', encoding='utf-8') as file:
            for line in output_content:
                file.write(line + '\n')

# Input file and output file paths
input_csv = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv'
output_csv = 'Text_KinkyDungeon_Temp.csv'
output_txt = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_CN_paratranz.txt'

process_csv(input_csv, output_csv)
print(f"save to {output_csv}")
asyncio.run(paratran_update())
asyncio.run(paratran_download())
print('OK')
