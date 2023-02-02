(function () {
    if (window.hasRunPF2CreaturesInRoll20) {
        return;
    }
    window.hasRunPF2CreaturesInRoll20 = true;
    addListeners();

    function addListeners() {
        addListener("importCreature", importCreature);
    }

    function addListener(command, callback) {
        try {
            browser.runtime.onMessage.addListener((message) => {
                if (message.command === command) {
                    try {
                        return callback(message.params);
                    } catch (err) {
                        console.error('Error processing command ' + command, err);
                    }
                }
            });
        } catch (err) {
            console.error('Error processing command ' + command, err);
        }
    }

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function importCreature(roll20Sheet) {
        const TokenGenerator = {
            size: 128,
            borderWidth: 4,
            borderColor: '#000000',
            backgroundColor: '#333333',
            textColor: '#ffffff',
            lineSpacing: 2,
            fontSize: 24,
            font: 'Verdana',

            canvas: null,
            ctx: null, //Canvas context
            init: function () {
                this.canvas = document.createElement('canvas');
                this.canvas.setAttribute('width', '' + this.size);
                this.canvas.setAttribute('height', '' + this.size);
                this.ctx = this.canvas.getContext("2d");
            },
            fillCircle: function (centerX, centerY, radius, fillStyle) {
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
                this.ctx.fillStyle = fillStyle;
                this.ctx.fill();
            },
            writeCenter: function (text, y) {
                this.ctx.textBaseline = "middle";
                this.ctx.font = this.fontSize + "px " + this.font;
                const textMeasure = this.ctx.measureText(text);
                const x = (this.size / 2) - (textMeasure.width / 2);
                this.ctx.fillStyle = this.textColor;
                this.ctx.fillText(text, x, y);
            },
            drawToken: function (name) {
                this.fillCircle(this.size / 2, this.size / 2, this.size / 2, this.borderColor);
                this.fillCircle(this.size / 2, this.size / 2, (this.size / 2) - this.borderWidth, this.backgroundColor);

                const lines = name.trim().split(' ').map(str => str.length > 6 ? str.substring(0, 6) + '.' : str);

                const totalHeight = (lines.length * (this.fontSize + this.lineSpacing)) - this.lineSpacing;
                let textY = ((this.size / 2) - (totalHeight / 2)) + (this.fontSize / 2);

                for (let line of lines) {
                    this.writeCenter(line, textY);
                    textY += this.fontSize + this.lineSpacing;
                }
            },
            dataURLtoFile(dataurl, filename) {

                var arr = dataurl.split(','),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n);

                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }

                return new File([u8arr], filename, { type: mime });
            },
            generateTokenDataUrl: function (name) {
                this.init();
                this.drawToken(name);
                return this.canvas.toDataURL('image/png');
            },
            generateTokenFile(creatureName) {
                const tokenDataUrl = this.generateTokenDataUrl(creatureName);
                return this.dataURLtoFile(tokenDataUrl, creatureName + ".json");
            }
        }

        const Roll20Page = {
            intervalBetweenAttemps: 200,
            maxAttemps: 50,
            click: async function (selector, insideIFrame) {
                const event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                const element = await this.getElement(selector, insideIFrame);
                element.dispatchEvent(event);
            },
            changeInputValue: async function (selector, insideIFrame, value) {
                if (value === null || value === undefined) {
                    value = '';
                } else if (value && Array.isArray(value)) {
                    value = value.join(', ');
                }

                const element = await this.getElement(selector, insideIFrame);
                element.value = value;
                element.dispatchEvent(new FocusEvent('blur'));
            },
            getElement: async function (selector, insideIFrame) {
                return new Promise((resolve, reject) => this._getElement(selector, insideIFrame, 0, resolve, reject));
            },
            _getElement: function (selector, insideIFrame, numberOfAttemps, resolve, reject) {
                if (numberOfAttemps > this.maxAttemps) {
                    console.error('Timeout waiting for ' + selector);
                    reject('Timeout waiting for ' + selector);
                    return;
                }

                const result = $(selector, insideIFrame ? $('div.characterdialog iframe').contents() : undefined);

                if (result.length == 0) {
                    setTimeout(() => this._getElement(selector, insideIFrame, numberOfAttemps + 1, resolve, reject), this.intervalBetweenAttemps);
                } else {
                    if (result.length > 1) {
                        console.warn('Found more than one element for selector ' + selector + '. Returning the first one');
                    }
                    resolve(result[0]);
                }
            },
            waitForElementVisible: async function (selector, insideIFrame) {
                return new Promise((resolve, reject) => this._waitForElementVisible(selector, insideIFrame, 0, resolve, reject));
            },
            _waitForElementVisible: function (selector, insideIFrame, numberOfAttemps, resolve, reject) {
                if (numberOfAttemps > this.maxAttemps) {
                    console.error('Timeout waiting for ' + selector);
                    reject('Timeout waiting for ' + selector);
                    return;
                }

                const result = $(selector, insideIFrame ? $('div.characterdialog iframe').contents() : undefined);

                if (result.length > 1) {
                    console.warn('Found more than one element for selector ' + selector + '. Returning the first one');
                }

                if (result.length == 0 || !result.is(':visible') || !result.height()) {
                    setTimeout(() => this._waitForElementVisible(selector, insideIFrame, numberOfAttemps + 1, resolve, reject), this.intervalBetweenAttemps);
                } else {
                    resolve();
                }
            },
            openJournal: async function () {
                await this.click('a[href="#journal"]');
            },
            clickAddButton: async function () {
                await this.click('button[href="#superjournaladd"]');
            },
            clickAddNewCharacter: async function () {
                await this.click('#addnewcharacter');
            },
            changeCharacterName: async function (name) {
                this.changeInputValue('div.ui-dialog-content input.name', false, name);
            },
            uploadToken: async function (file) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                const inputFile = await this.getElement('div.ui-dialog-content div.avatar input[type=file]');
                inputFile.files = dataTransfer.files;
                inputFile.dispatchEvent(new Event('change'));
            },
            clickSaveChanges: async function () {
                await this.click('div.ui-dialog button.save-button');
            },
            clickOptions: async function () {
                return this.click('div.characterviewer label[title=options]', true);
            },
            clickSheetLayoutNpc: async function () {
                return this.click('div.options-panel h3[data-i18n=change-sheet-type] + div.options-row > button[name=act_toggle_npc]', true);
            },
            waitForOptionsVisible: async function () {
                return this.waitForElementVisible('div.options', true);

            },
            waitForNpcSheetVisible: async function () {
                return this.waitForElementVisible('div.npc', true);
            },
            waitForNpcSettingsVisible: async function () {
                return this.waitForElementVisible('div.npc-settings', true);
            },
            clickNpcSettingsButton: async function () {
                return this.click('div.npc button.pictos[name=act_toggle_npcsettings]', true);
            },
            deletePlaceholderStrike: async function() {
                await sleep(100);
                await this.click('div.npc-melee-strikes .repcontrol_edit', true);
                await sleep(100);
                await this.click('div.npc-melee-strikes .repcontainer .repitem:nth-child(1) .repcontrol_del', true);
                await sleep(100);
                await this.click('div.npc-melee-strikes .repcontrol_edit', true); 0
            },
            fillField: async function (container, attr, value) {
                if (value === null || value === undefined) {
                    return;
                } else if (value.trim) {
                    value = value.trim();
                }

                const matcher = /checkbox_(?<value>.*)_(?<attr>attr_.*)/.exec(attr);
                if (matcher) {
                    const selector = container + ' input[name=' + matcher.groups.attr + ']:not([type=hidden])';
                    const element = await this.getElement(selector, true);
                    if (element.value == value) {
                        //already has the value, it's probably a checkbox
                        await this.click(selector, true);
                    }
                } else {
                    let selector;
                    if (attr.indexOf('textarea_') == 0) {
                        selector = container + ' textarea[name=' + attr.substring('textarea_)'.length - 1) + ']';
                    } else {
                        selector = container + ' input[name=' + attr + ']:not([type=hidden])';
                    }
                    const element = await this.getElement(selector, true);
                    await this.changeInputValue(selector, true, value);
                }
            },
            copyRepeatingItems: async function (repeatingSection) {
                console.log('copyRepeatingItems', repeatingSection);
                if (!repeatingSection || !repeatingSection.items) {
                    return;
                };

                for (let i = 0; i < repeatingSection.items.length; i++) {
                    await sleep(100);
                    await this.click(repeatingSection.containerSelector + ' .repcontrol_add', true);

                    const item = repeatingSection.items[i];
                    const repitemContainer = repeatingSection.containerSelector + ' .repcontainer .repitem:nth-child(' + (i + 1) + ')';
                    for (let attr in item) {
                        let value = item[attr];
                        await this.fillField(repitemContainer, attr, item[attr]);
                    }
                }

                for (let i = 0; i < repeatingSection.items.length; i++) {
                    const repitemSelector = repeatingSection.containerSelector + ' .repcontainer .repitem:nth-child(' + (i + 1) + ')';
                    await this.click(repitemSelector + ' .settings-button', true);
                }
            },
            importCreature: async function (roll20Sheet) {
                await this.openJournal();
                await this.clickAddButton();
                await this.clickAddNewCharacter();
                await this.changeCharacterName(roll20Sheet.attr_character_name);

                const tokenFile = TokenGenerator.generateTokenFile(roll20Sheet.attr_character_name);

                await this.uploadToken(tokenFile);
                await this.clickSaveChanges();
                await this.clickOptions();
                await this.waitForOptionsVisible();
                await this.clickSheetLayoutNpc();
                await this.waitForNpcSheetVisible();
                await this.changeInputValue('div.npc input[name=attr_hit_points]', true, roll20Sheet.attr_hit_points);
                await this.clickNpcSettingsButton();
                await this.waitForNpcSettingsVisible();

                await sleep(3000);

                await this.deletePlaceholderStrike();

                for (let attr in roll20Sheet) {
                    if (attr == 'attr_hit_points') {
                        continue;
                    } else if (attr.startsWith('repeating')) {
                        await this.copyRepeatingItems(roll20Sheet[attr]);
                    } else {
                        await this.fillField('div.npc-settings', attr, roll20Sheet[attr]);
                    }
                }
                await this.clickNpcSettingsButton();
            }
        }

        try {
            await Roll20Page.importCreature(roll20Sheet);
            alert(roll20Sheet.attr_character_name + ' imported successfully!');
        } catch (err) {
            console.log('err', err);
            alert('Error importing creature!');
        }
    }
})();
