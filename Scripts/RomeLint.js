const notify = require('./notify.js');

class RomeLint {
    client = null;
    constructor(path) {
        this.#initialize(path);
    }

    #initialize(path) {
        this.client = new LanguageClient(
            'lsp-rome',
            'Rome',
            {
                path: path,
                args: ['lsp-proxy'],
            },
            { syntaxes: ['javascript', 'typescript'] },
        );
        this.client.onDidStop(() => {
            console.log('rome lsp server stopped?');
            notify('rome-server-stopped', 'Rome', 'Rome server stopped unexpectedly');
        });
        this.client.start();
    }

    stop() {
        if (this.client?.running) {
            this.client.stop();
        }
    }

    pathChanged(path) {
        this.stop();
        this.client.dispose();
        this.#initialize(path);
    }
}

module.exports = RomeLint;

