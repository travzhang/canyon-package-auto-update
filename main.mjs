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
                const command = `git clone ${repoUrl} ${targetDir} && cd canyon && git checkout dev-package-update && git remote set-url origin https://zhanglinfei257:${env}@github.com/canyon-project/canyon.git && cd ..`;
                exec(command, (error, stdout, stderr) => {
                    resolve();
                });
            })
        }

        const repoUrl = 'https://github.com/canyon-project/canyon.git'; // Replace with your repository URL
        const targetDir = ''; // Replace with your target directory

        await gitClone(repoUrl, targetDir);

// 2.查找所有package.json文件
        const paaa = await findPackageJsonFiles('./canyon')
            .then(packageJsonFiles => {
                return packageJsonFiles;
            })

// 3.升级每个package.json里的包版本到最新


        async function updateDependencies(packageJsonFiles) {
            const updatedPackages = [];
            for (const packageJson of packageJsonFiles) {
                console.log(packageJson,'packageJson')
                const data = fs.readFileSync(packageJson, 'utf8');
                const json = JSON.parse(data);
                const dependencies = json.dependencies || {};
                const devDependencies = json.devDependencies || {};
                const allDependencies = {...dependencies, ...devDependencies};

                for (const [packageName, version] of Object.entries(allDependencies)) {
                    const latestVersion = await getLatestVersion(packageName);
                    const whitelist = []
                    if (version.includes('^') && latestVersion && version.replaceAll('^','') !== latestVersion.replaceAll('^','') && !whitelist.includes(packageName)) {
                        console.log(`Updating ${packageName} from ${version} to ${latestVersion}`);
                        updatedPackages.push(`${packageName}: ${version} → ^${latestVersion}`);
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
            return updatedPackages;
        }

        const updatedPackages = await updateDependencies(paaa)

// 4.提交代码

        async function gitCommitAndPush(updatedPackages) {
            try {
                let commitMessage = "chore: update dependencies";
                if (updatedPackages.length > 0) {
                    if (updatedPackages.length <= 5) {
                        // 如果更新的包不超过5个，列出所有包
                        const packageList = updatedPackages.join(', ');
                        commitMessage = `chore: update dependencies (${packageList})`;
                    } else {
                        // 如果更新的包超过5个，只显示总数
                        commitMessage = `chore: update ${updatedPackages.length} dependencies to latest versions`;
                    }
                }
                
                const command = `cd canyon && git branch && git config user.name "Travis Zhang" && git config user.email "wr.zhang25@gmail.com" && git add . && git commit -m "${commitMessage}" && git push origin dev-package-update:dev-package-update && cd .. && rm -rf canyon`;
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

        await gitCommitAndPush(updatedPackages);
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
    await sleep(30*60*1000)
    // await sleep(1*1000)
}



// return
