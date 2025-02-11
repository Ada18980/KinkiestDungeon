import csv
from collections import defaultdict

def process_csv(input_file, output_file):
    # 读取CSV文件并存储数据
    with open(input_file, mode='r', newline='', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        rows = [row for row in reader]

    # 用于记录每个第一列值出现的次数
    count_dict = defaultdict(int)
    # 用于存储处理后的行
    processed_rows = []

    for row in rows:
        first_col = row[0]
        count_dict[first_col] += 1
        if count_dict[first_col] > 1:
            # 如果第一列的值重复，则添加序号
            row[0] = f"{first_col}_{count_dict[first_col] - 1}"
        processed_rows.append(row)

    # 将处理后的数据写入新的CSV文件
    with open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(processed_rows)

# 输入文件和输出文件的路径
input_csv = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon.csv'
output_csv = 'Screens/MiniGame/KinkyDungeon/Text_KinkyDungeon_Temp.csv'

# 处理CSV文件
process_csv(input_csv, output_csv)

print(f"处理后的CSV文件已保存为 {output_csv}")
