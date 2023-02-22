const notify = require('./notify.js');

const flattenJSON = (obj = {}, res = {}, extraKey = '') => {
    for (key in obj) {
        if (typeof obj[key] !== 'object') {
            res[extraKey + key] = obj[key];
        } else {
            flattenJSON(obj[key], res, `${extraKey}${key}.`);
        }
    }
    return res;
};

class RomeLint {
    client = null;
    path = null;
    debug = false;
    dispose = [];
    constructor(path) {
        this.path = path;
        this.#initialize();
    }

    async setConfiguration() {
        /* Check for config file in root of workspace */
        const config_path = `${nova.workspace.path}/rome.json`;
        if (nova.fs.stat(config_path)?.isFile()) {
            try {
                const config = nova.fs.open(config_path, 'rt').read();
                const flattenedConfig = flattenJSON(JSON.parse(config));
                Object.keys(flattenedConfig).forEach((c) => {
                    nova.workspace.config.set(`rome.${c}`, flattenedConfig[c]);
                });
            } catch (err) {
                console.log(err);
            }
        }
    }

    async #initialize() {
        await this.setConfiguration();
        this.client = new LanguageClient(
            'lsp-rome',
            'Rome',
            {
                path: this.path,
                args: ['lsp-proxy'],
            },
            { syntaxes: ['javascript', 'typescript'], debug: this.debug },
        );
        this.dispose.push(
            this.client.onDidStop(() => {
                console.log('rome lsp server stopped?');
                notify('rome-server-stopped', 'Rome', 'Rome server stopped unexpectedly');
            }),
        );
        await this.client.start();
    }

    stop() {
        if (this.client?.running) {
            this.client.stop();
            this.dispose.forEach((d) => d.dispose());
            this.dispose = [];
        }
    }

    restart() {
        this.stop();
        this.#initialize();
    }

    pathChanged(path) {
        this.stop();
        this.client.dispose();
        this.path = path;
        this.#initialize();
    }
}

module.exports = RomeLint;

