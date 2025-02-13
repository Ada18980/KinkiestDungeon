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

configuration = paratranz_client.Configuration(host = "https://paratranz.cn/api")
configuration.api_key['Token'] = os.environ.get('PARATRANZ_TOKEN')

def process_csv(input_file, output_file):
    # 读取CSV文件并存储数据
    key_counts = {}
    processed_rows = []

    # 读取输入文件
    with open(input_file, 'r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        for row in reader:
            if not row:  # 跳过空行
                continue
            
            original_key = row[0]
            
            # 更新计数器并生成新键名
            count = key_counts.get(original_key, 0) + 1
            key_counts[original_key] = count
            
            new_key = f"{original_key}_{count-1}" if count > 1 else original_key
            
            # 创建新行并添加到结果列表
            processed_rows.append([new_key] + row[1:])

    # 写入输出文件
    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(processed_rows)
        
async def paratran_update():
    async with paratranz_client.ApiClient(configuration) as api_client:
        api_instance = paratranz_client.FilesApi(api_client)
        project_id = 13239 # int | 项目ID 13239 12190
        file_id = 1834057 # int | 文件ID 1834057 1638395
        file = "Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_Temp.csv" # bytearray | 文件数据，格式需与创建时的文件保持一致，也可上传标准JSON格式（文件名需为原文件名加.json） (optional)

        try:
            # 更新文件
            api_response = await api_instance.update_file(project_id, file_id, file=file)
            print("The response of FilesApi->update_file:\n")
            pprint(api_response)
        except Exception as e:
            print("Exception when calling FilesApi->update_file: %s\n" % e)

async def paratran_download():
    async with paratranz_client.ApiClient(configuration) as api_client:
        api_instance = paratranz_client.FilesApi(api_client)
        project_id = 12190 # int | 项目ID
        file_id = 1638395 # int | 文件ID


            # 文件翻译
        data_raw = await api_instance.get_file_translation_with_http_info(project_id, file_id)
        json_object = json.loads(data_raw.raw_data.decode())
        json_object.sort(key=lambda x: x['id'])
        output_content = []

        for item in json_object:
            if item['translation']:  # 如果translation不为空
                output_content.append(item['original'])
                output_content.append(item['translation'])

        with open(output_txt, 'w', encoding='utf-8') as file:
            for line in output_content:
                file.write(line + '\n')

# 输入文件和输出文件的路径
input_csv = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv'
output_csv = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_Temp.csv'
output_txt = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_CN.txt'

# 处理CSV文件
#process_csv(input_csv, output_csv)

#print(f"处理后的CSV文件已保存为 {output_csv}")
#asyncio.run(paratran_update())
asyncio.run(paratran_download())
