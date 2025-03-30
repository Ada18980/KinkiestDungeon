## Describe

This is used to store game translation text. Select the corresponding `Text_KinkyDungeon_[lang].txt`, You can participate in the translation.

For more information, please refer to [CONTRIBUTING.md](/.github/CONTRIBUTING.md).


### Translation Format

- Lines starting with `-` indicate source text matching
- Lines starting with `::` indicate exact tag matching
- Lines in the format of `# - text` or `# :: key` are provided for convenient translation. You can simply remove the leading `# ` and write your translation on the next line.
- The **immediately following line** contains the translation (even if empty, though empty translations won't be used)

Non-matching lines are ignored.

**Example Format:**
```txt
- original_text1
Translated_text_1
:: key_1
Translated_key_1

- original_text2
value_2

:: key_3
Translated_3
```

### Debugging mode for text

In Debug mode, you can see the text “Key”.

You can enable debug mode by entering the following code in the console

```typescript
TextProvider.instance.setDebugMode(true);

// Example show Text > "KEY_SAVE::save"
```


## Other

### For Chinese(中国语翻译)

可前往 [paratranz](https://paratranz.cn/projects/12190) 便捷参与KD汉化
