// ==UserScript==
// @name         Webclass Script
// @version      0.1
// @author       PeaShooterR
// @match        https://yourschool.ac.jp/webclass/*
// @grant        GM_download
// ==/UserScript==
/*
機能:
    トップページ：
        お知らせを格納する（https://github.com/BearOffice/WebClass-Extension）
        時間割表の空欄を非表示にする
        年・学期を時間割の下に移動する

    教材ページ：
        取り込みファイル（右側に表示するPDFなど）をすべてダウンロードするボタンを追加する
        添付資料をすべてダウンロードするボタンを追加する
*/

(function () {
    'use strict';
    const webclassLink = 'https://yourshool.ac.jp/webclass';

    const currentURL = window.location.href;
    //Main page
    const regexMainPage = /webclass\/$|webclass\/\?acs_=.*$|index\.php.*/;
    const matchMainPage = currentURL.match(regexMainPage);
    if (matchMainPage) {
        // The following code is from
        // https://github.com/BearOffice/WebClass-Extension
        // Thanks to BearOffice

        // Hide info
        let infobox = $('#NewestInformations');
        let title = $('#UserTopInfo .page-header');
        title.text('管理者からのお知らせ　 < クリックして格納 >');

        // Collapse the notifications
        switchInfoboxVisibility();
        console.log('[Webclass Script]お知らせを格納しました。');

        // Append the notifications if there are any unread messages
        $(window).on('load', () => {
            // js-unread-message-count is updated by ajax, can't catch the updated timing
            setTimeout(() => {
                let value = $('#js-unread-message-count').text();
                if (value != '') {
                    switchInfoboxVisibility();
                }
            }, 200);
        });

        $('#UserTopInfo .page-header').on('click', () => {
            switchInfoboxVisibility();
        });

        function switchInfoboxVisibility() {
            if (infobox.is(':visible') == true) {
                infobox.hide();
                title.text('管理者からのお知らせ　 > クリックして展開 <');
            } else {
                infobox.show();
                title.text('管理者からのお知らせ　 < クリックして格納 >');
            }
        }

        // Arrange the row
        $('.row > div').each((_, elem) => {
            $(elem).removeAttr('class');
        });

        // Easter egg
        let egg = ['(。・・)_旦', 'Σ(ﾟдﾟlll)', '(±.±)', '(ヾ;￣ω￣)ヾﾔﾚﾔﾚ',
            '┐(￣～￣)┌', '(-Д-＼)=３', '！(。_。)アレレ'
        ];
        $('.course-webclass').html('WebClass&nbsp;&nbsp;' + egg[Math.floor(Math.random() * egg.length)]);

        // Move year selector down
        let courseTaking = $('div.col-sm-9 > h3');
        let timeTable = $('form > h4');
        let semesterDisplayed =$('form > h4:nth-child(4)');
        let yeasrAndSemester = $('form > div:nth-child(2)');
        let addCourse = $('form > div:nth-child(7)');


        courseTaking.remove();
        timeTable.remove();
        semesterDisplayed.remove();
        yeasrAndSemester.remove();
        yeasrAndSemester.insertAfter(addCourse)
        console.log('[Webclass Script]年・学期の位置を変更しました。');

        // Delete blank table
        let tables = document.getElementsByTagName('table');

        // Loop through all tables
        for (let i = 0; i < tables.length; i++) {
            let table = tables[i];

            // Loop through each row
            let rows = table.getElementsByTagName('tr');

            // Loop through each columns
            for (let j = rows.length - 1; j >= 0; j--) {
                let row = rows[j];

                // If all columns 2-7 are empty
                let isEmpty = true;
                for (let k = 1; k <= 6; k++) {
                    let cell = row.cells[k];
                    if (cell.textContent.trim() !== '') {
                        isEmpty = false;
                        break;
                    }
                }

                // remove the row
                if (isEmpty) {
                    table.deleteRow(j);
                }
            }
        }
        console.log('[Webclass Script]時間割表の空欄を非表示にしました。');

    };

    // Text page
    const regexTextPage = /(txtbk|qstn)_frame\.php/;
    const matchTextPage = currentURL.match(regexTextPage);
    if (matchTextPage) {
        // Wait for the page to load
        window.addEventListener('load', function () {
            // Add button to the top bar
            let topBar = document.querySelector('html > frameset > frame').contentDocument.querySelector('#ContentQuitMenu > li')
            let downloadAttacmentButton = $("<input type='button' name='download_attachment' value='全ての ↓ 添付資料ファイル ↓ をダウンロード' class='btn btn-default'>");
            let downloadTextButton = $("<input type='button' name='download_text' value='全ての↘︎取り込みファイル↘︎をダウンロード' class='btn btn-default'>");
            topBar.appendChild(downloadAttacmentButton[0]);
            topBar.appendChild(downloadTextButton[0]);
            downloadAttacmentButton = topBar.querySelector('input[name="download_attachment"]');
            downloadTextButton = topBar.querySelector('input[name="download_text"]');
            downloadAttacmentButton.addEventListener("click", downloadAttachment, false);
            downloadTextButton.addEventListener("click", downloadText, false);

            replaceAttachmentLink();

        }, false);

        // Link "添付資料" directly to the download page
        function replaceAttachmentLink() {
            const TOC = document.querySelector('html > frameset > frameset > frame:nth-child(1)').contentDocument.querySelectorAll('#TOCLayout tr');
            // Loop through each row and extract the download link
            TOC.forEach(row => {
                const link = row.querySelector('a[target="download"]');
                if (link) {
                    let downloadLink = link.href;
                    downloadLink = downloadLink.replace('file_down', 'download');
                    link.href = downloadLink;
                    console.log('[Webclass Script] 添付資料のリンクをダウンロードリンク"' + downloadLink + '" に置き換えしました。');
                }
            });
        };

        // Download all attachments with replaced directly link
        function downloadAttachment() {
            const TOC = document.querySelector('html > frameset > frameset > frame:nth-child(1)').contentDocument.querySelectorAll('#TOCLayout tr');
            // Loop through each row and extract the download link
            TOC.forEach(row => {
                const link = row.querySelector('a[target="download"]');
                if (link) {
                    let downloadLink = link.href;
                    // Replace file_down.php with download.php
                    // downloadLink = downloadLink.replace('file_down', 'download');
                    // Download the file
                    GM_download({
                        url: downloadLink,
                        name: decodeURI(downloadLink).match(/file_name=([^&]+)/)[1],
                        saveAs: false
                    });
                    console.log('[Webclass Script] リンク"' + downloadLink + '" から添付資料をダウンロードしました。');
                }
            });

        };

        // Download all text (PDF etc. shown on the right side)
        function downloadText() {

            // Get download links

            // Select the script tag that contains the JSON data
            let textJSON = document.querySelector('html > frameset > frameset > frame:nth-child(1)').contentDocument.querySelector('#json-data')
            // Extract the JSON data from the script tag
            let jsonData = JSON.parse(textJSON.textContent);
            // Get the values of text_urls from the JSON data
            let textURLs = Object.values(jsonData.text_urls);

            //Use regex to macth files
            let i = 0;
            let fileURLs = [];
            const regexFileURLs = /(?<=file=)[^&]+/;
            for (i = 0; i < textURLs.length; i++) {
                let matchedFileURL = textURLs[i].match(regexFileURLs);
                if (matchedFileURL) {
                    const regexContentsURL = /&contents_url=([^&]*)/;
                    const matchedContentsURL = textURLs[i].match(regexContentsURL);
                    const fullDownloadURL = webclassLink.slice(0, -9) + matchedContentsURL[1] + matchedFileURL;
                    fileURLs.push(decodeURIComponent(fullDownloadURL));
                }
                else {
                    fileURLs.push('');
                }
            };

            // Get the name of every file
            let chapterNames = [];
            let COT = document.querySelector('html > frameset > frameset > frame:nth-child(1)').contentDocument.querySelectorAll('.size2.darkslategray');
            // It will be like this:
            // 第1節, 注意, 第2節, レポート, 第3節, 実験
            for (i = 1; i < COT.length; i += 2) {
                let chapterName = COT[i].textContent;
                if (chapterName != '') {
                    // If chapter name is not empty, use it as file name
                    chapterNames.push(COT[i].textContent);
                } else {
                    if (fileURLs.length == 1) {
                        // If there is only one file, use page title as file name, not "第x節"
                        chapterNames[0] = document.querySelector('html > frameset > frameset > frame:nth-child(1)').contentDocument.querySelector('#WsTitle > h2').textContent;
                    } else {
                        // If there is not only one file, and chapter name is empty, use "第x節"
                        chapterNames.push(COT[i - 1].textContent);
                    }
                }

            };

            // const regexFileExtension = /\.(\w+)$/;
            // Download all files in fileURLs, with the name of chapterNames
            for (i = 0; i < fileURLs.length; i++) {
                if (fileURLs[i] != '') {
                    GM_download({
                        url: fileURLs[i],
                        name: chapterNames[i],
                        saveAs: false,
                    });
                    console.log('[Webclass Script] リンク"' + fileURLs[i] + '" から "' + chapterNames[i] + '" をダウンロードしました。');
                }
            }

        };

    };
})();