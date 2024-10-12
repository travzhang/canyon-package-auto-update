import {findPackageJsonFiles,getLatestVersion} from "./helpers.mjs";
import fs from 'fs';
import {exec} from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);
// 0.读取配置
const env = fs.readFileSync('./env.txt').toString().trim();

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    })
}


while (true) {
    try {
        // 1.git clone 仓库

        async function gitClone(repoUrl, targetDir) {
            return new Promise((resolve, reject) => {
                const command = `git clone ${repoUrl} ${targetDir} && cd canyon && git checkout test && git remote set-url origin https://zhanglinfei257:${env}@github.com/canyon-project/canyon.git && cd ..`;
                exec(command, (error, stdout, stderr) => {
                    resolve();
                });
            })
        }

        const repoUrl = 'https://github.com/canyon-project/canyon.git'; // Replace with your repository URL
        const targetDir = ''; // Replace with your target directory

        await gitClone(repoUrl, targetDir);

// 2.查找所有package.json文件
        const paaa = await findPackageJsonFiles('./canyon/packages')
            .then(packageJsonFiles => {
                return packageJsonFiles;
            })

// 3.升级每个package.json里的包版本到最新


        async function updateDependencies(packageJsonFiles) {
            for (const packageJson of packageJsonFiles) {
                console.log(packageJson,'packageJson')
                const data = fs.readFileSync(packageJson, 'utf8');
                const json = JSON.parse(data);
                const dependencies = json.dependencies || {};
                const devDependencies = json.devDependencies || {};
                const allDependencies = {...dependencies, ...devDependencies};

                for (const [packageName, version] of Object.entries(allDependencies)) {
                    const latestVersion = await getLatestVersion(packageName);
                    const whitelist = ['prisma','@prisma/client']
                    if (latestVersion && version.replaceAll('^','') !== latestVersion.replaceAll('^','') && !whitelist.includes(packageName)) {
                        console.log(`Updating ${packageName} from ${version} to ${latestVersion}`);
                        if (dependencies[packageName]) {
                            json.dependencies[packageName] = `^${latestVersion}`;
                        }
                        if (devDependencies[packageName]) {
                            json.devDependencies[packageName] = `^${latestVersion}`;
                        }
                    }
                }

                fs.writeFileSync(packageJson, JSON.stringify(json, null, 2));
            }
        }

        await updateDependencies(paaa)

// 4.提交代码

        async function gitCommitAndPush() {
            try {
                const command = `cd canyon && git branch && git config user.name "Allen Zhang" && git config user.email "wr_zhang25@163.com" && git add . && git commit -m "Update dependencies" && git push origin test:test && cd .. && rm -rf canyon`;
                const { stdout, stderr } = await execPromise(command);
                console.log('stdout:', stdout);
                if (stderr) {
                    console.error('stderr:', stderr);
                }
            } catch (error) {
                console.error('Error:', error);
                throw error;  // Rethrow the error if you need to handle it upstream
            }
        }

        await gitCommitAndPush();
    } catch (e) {
        try {
            const command = `rm -rf canyon`;
            const { stdout, stderr } = await execPromise(command);
            console.log('stdout:', stdout);
            if (stderr) {
                console.error('stderr:', stderr);
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;  // Rethrow the error if you need to handle it upstream
        }
    }
    await sleep(60*60*1000)
    // await sleep(1*1000)
}



// return
