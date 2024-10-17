
# How to contribute

### Translation work

Thank you for your interest in contributing to the translation work! If you want to translate this project, please follow the steps below:

For some nouns, you can refer to the [Noun Explanation](#Noun-Explanation) section.

> For users who are not familiar with Git, to quickly translate.

#### Get started

1. First. You need to enter the folder where the text resources of this project's `newartwork` branch are located. You can [click here to enter](/Screens/MiniGame/KinkyDungeon/)

2. Find the corresponding language file you want to translate in the directory and click to enter.

> The naming format of the language resource file is `Text_KinkyDungeon_<language abbreviation>.txt`
> Such as `Text_KinkyDungeon_EN.txt` is the English translation file (of course, this does not exist)

3. Click the edit button in the upper right corner of the editing box. You may be prompted to Fork the project, follow the prompts to operate.

> If you are not the first time to participate in the translation and have Forked the project, you can directly edit in your Fork project. Note: Before editing, please switch to the `newartwork` branch and **synchronize**.

![img](https://docs.github.com/assets/cb-47646/mw-1440/images/help/repository/edit-file-edit-button.webp)

4. Use `Ctrl + F` or other search functions to find the text you want to translate. You can start the translation work.


##### Writing rules

One line of original text, then the next line is the translated text。

*(Ensure original text on odd lines, translation on even lines)*

Such as:
`````
Original text 1
Translated text 1
Original text 2
Translated text 2
`````

##### Untranslated content

If you do not have specific text to translate, you can find the original text that starts with `###`, which is the format of the text that starts with `### Original text` and has not been translated.

The method is: remove the `### ` in it (note, do not delete the original text), and then write the translated text on the next line.

> You don't need to worry about the position and the spaces at the beginning and end. You only need to keep the original text and the translated text in the correct order.

##### Other

- If you have accumulated some translation content and don't want to find and modify them one by one, you can write *original text-translation* according to the rules at any place, and the first pair of translation pairs that meet the requirements will be retained after submission. (It is best to write at the beginning, because the first submission will cover the later ones)

- **If you think that submitting and editing is too cumbersome, you can create an `issue`, write the accumulated translation content in it, and indicate the language file.** [Reference document](https://docs.github.com/en/issues/tracking-your-work-with-issues/quickstart)

> Note: When pasting translation content, please wrap it in **a pair** of ` ``` ` (backticks) .

Such as:
`````
Text_KinkyDungeon_EN.txt
```
Original text 1
Translated text 1
Original text 2
Translated text 2
```
`````

#### Finish and submit

After completing the translation, you can click the `Commit changes...` button in the upper right corner of the editing box, keep the default or fill in the commit information and submit.

In the `base` item at the top, you should choose `newartwork` Branches.

> *So far, follow the prompts all the way, the following content may be confusing, it is not recommended to continue reading if you have no questions.*

After submitting, you will enter the `Comparing changes` page. You can view your submission content on this page. After confirming that there is no error, click `Create pull request` and wait for approval.

![img](https://camo.githubusercontent.com/34a2cf737ba2f5943e3e469aa231e95a0ee4d0888c10dcaa169c1f8413d43333/68747470733a2f2f6669727374636f6e747269627574696f6e732e6769746875622e696f2f6173736574732f526561646d652f7375626d69742d70756c6c2d726571756573742e706e67)

If you did not enter or accidentally leave the page, you can return to the `newartwork` branch of this project. You should see a yellow prompt box at the top of the project. Click `Compare & pull request` to enter the Pull Request page. For details, please refer to the [GitHub official document](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

![img](https://camo.githubusercontent.com/e10bdcf31fb3f8ce863dc1dbf9269a23bce9263afcbe9a62d892e9b6e78df1c6/68747470733a2f2f6669727374636f6e747269627574696f6e732e6769746875622e696f2f6173736574732f526561646d652f636f6d706172652d616e642d70756c6c2e706e67)

#### Noun Explanation

Note that these contents are mainly for users who are not familiar with Git, and are mainly for easy understanding. They may be different from the actual functions. If you are interested in learning more, please refer to the [GitHub official document](https://docs.github.com/)

##### Branches

> Note that this refers to `Branches` rather than `Fork`.

On GitHub, the code has various versions, and branches are these different versions of the code. In this project, we mainly work in the `newartwork` branch, so you need to pay attention to switching to the `newartwork` branch.

![img](https://docs.github.com/assets/cb-2058/mw-1440/images/help/branches/pr-retargeting-diagram1.webp)


![img](https://docs.github.com/assets/cb-36152/mw-1440/images/help/repository/file-tree-view-branch-dropdown-expanded.webp)

##### Pull Request

Since you are not a project member, you cannot submit translation content directly. So you need to `Fork` this project, which means copying it to your account, and then editing it in your account.

How do you merge the project you copied into this project? This requires a `Pull Request`, which is a request to merge your changes into this project.


##### Synchronize

After you Fork the project, this project may be updated, and you need to synchronize the updates of this project to your Fork project to avoid conflicts caused by the project being updated and your Fork project not being updated.

The synchronization function is by default for the current branch, so you need to switch to the corresponding branch before synchronizing.
