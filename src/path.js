async function getArch() {
    return new Promise((res) => {
        var process = new Process('/usr/bin/uname', { args: ['-m'] });
        process.onStdout((line) => {
            cpu = line.trim();
            res(cpu);
        });
        process.start();
    });
}

async function checkLocalPath() {
    const arch = await getArch();
    return new Promise((res) => {
        /* Try to find local rome path in repo */
        const localPath = `${nova.workspace.path}/node_modules/@rometools/cli-darwin-${arch}/rome`;
        try {
            const process = new Process('/usr/bin/env', {
                args: ['stat', localPath],
            });
            process.onDidExit((value) => {
                if (value) {
                    res(null);
                } else {
                    res(localPath);
                }
            });
            process.start();
        } catch (err) {
            res(null);
        }
    });
}

function checkGlobalPath() {
    return new Promise((res) => {
        /* Try to find global path */
        try {
            const process = new Process('/usr/bin/env', {
                args: ['type', '-a', 'rome'],
            });
            let result = null;
            process.onStdout((value) => {
                const m = value.match(/rome is (\S+)/);
                if (m?.length === 2) {
                    result = m[1];
                }
            });
            process.onDidExit((value) => {
                if (result !== null) {
                    res(result);
                } else {
                    res(null);
                }
            });
            process.start();
        } catch (err) {
            res(null);
        }
    });
}

module.exports = async function getRomePath() {
    let path = await checkLocalPath();
    if (path !== null) {
        return path;
    }
    path = await checkGlobalPath();
    return path;
};

