import { App, Plugin, Notice } from 'obsidian';
import * as yaml from 'js-yaml';

export default class DatasheetPlugin extends Plugin {
    async onload() {
        console.log('Loading Datasheet Plugin');

        this.registerMarkdownPostProcessor((element, context) => {
            const codeBlocks = element.querySelectorAll('pre > code');
            codeBlocks.forEach((codeBlock) => {
                if (codeBlock.classList.contains('language-datasheet')) {
                    const rawYaml = codeBlock.textContent;

                    try {
                        const parsedData = yaml.load(rawYaml);
                        if (parsedData) {
                            const renderDiv = document.createElement('div');
                            renderDiv.className = 'datasheet-container';
                            renderDiv.appendChild(this.createTreeTable(parsedData));

                            codeBlock.parentElement?.replaceWith(renderDiv);
                        }
                    } catch (err) {
                        console.error('Error parsing YAML:', err);
                    }
                }
            });
        });
    }

    onunload() {
        console.log('Unloading Datasheet Plugin');
    }

    private createTreeTable(data: any): HTMLElement {
        const table = document.createElement('table');
        table.className = 'datasheet-table';

        this.addRows(table, data, 0);
        return table;
    }

    private addRows(table: HTMLTableElement, data: any, level: number) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                const row = table.insertRow();
                row.className = 'datasheet-row';

                const cell = row.insertCell();
                cell.className = 'datasheet-key';
                cell.textContent = key;
                if (level > 0) {
                	cell.setAttribute('style', `padding-left: ${level*2}em !important;`);
                }

                if (typeof value === 'object' && value !== null) {
                	cell.setAttribute('colspan', '2');
                    this.addRows(table, value, level + 1);
                } else {
                    const valueCell = row.insertCell();
                    valueCell.className = 'datasheet-value';
                    const valueString = String(value);
                    const htmlContent = valueString.replace(/\n/g, '<br>');
                    valueCell.innerHTML = htmlContent;

                    // Add event listener to copy value on click
                    valueCell.addEventListener('click', () => {
                        navigator.clipboard.writeText(valueString)
                            .then(() => {
                                // Show Obsidian notification
                                new Notice('Copied value!');
                            })
                            .catch((err) => {
                                console.error('Failed to copy text:', err);
                                // Show an error notification
                                new Notice('Failed to copy text', 3000); // The second argument sets the duration (in ms)
                            });
                    });
                }
            }
        }
    }
}
