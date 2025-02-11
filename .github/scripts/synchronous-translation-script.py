import csv
from collections import defaultdict

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

# 输入文件和输出文件的路径
input_csv = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv'
output_csv = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_Temp.csv'

# 处理CSV文件
process_csv(input_csv, output_csv)

print(f"处理后的CSV文件已保存为 {output_csv}")
