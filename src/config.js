class Config extends Disposable {
    static listeners = [];

    static getConfig(key) {
        /* Check workspace config (overrides global config) */
        let value = nova.workspace.config.get(key);
        // console.log(`Config workspace value for ${key} is ${value}`);
        if (value !== null) {
            return value;
        }
        /* Check global config */
        value = nova.config.get(key);
        // console.log(`Config global value for ${key} is ${value}`);
        if (value !== null) {
            return value;
        }
        return null;
    }

    static notify(key, cb) {
        let currentValue = this.getConfig(key);
        return (value) => {
            // console.log(`CONFIG: ${key} changed => ${currentValue}`);
            let updatedValue = this.getConfig(key);
            if (currentValue !== updatedValue) {
                currentValue = updatedValue;
                cb(updatedValue);
            }
        };
    }

    static async registerOnChanged(key, cb) {
        this.listeners.push(nova.workspace.config.onDidChange(key, this.notify(key, cb)));
        this.listeners.push(nova.config.onDidChange(key, this.notify(key, cb)));
        await cb(this.getConfig(key));
    }

    static dispose() {
        this.listeners.forEach((l) => {
            l.dispose();
        });
    }
}

module.exports = Config;

