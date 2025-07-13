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
            try {
                // 先删除已存在的目录
                await execPromise(process.platform === 'win32' ? 'rmdir /s /q canyon 2>nul || echo "Directory not found"' : 'rm -rf canyon || echo "Directory not found"');
                
                // Clone repository
                await execPromise(`git clone ${repoUrl} ${targetDir}`);
                
                // Change to canyon directory and checkout branch
                await execPromise(`cd canyon && git checkout dev-package-update`);
                
                // Set remote URL
                await execPromise(`cd canyon && git remote set-url origin https://zhanglinfei257:${env}@github.com/canyon-project/canyon.git`);
                
                console.log('Git clone and setup completed');
            } catch (error) {
                console.error('Git clone error:', error);
                throw error;
            }
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
                
                // 分步执行git命令，避免长命令在Windows下出现问题
                await execPromise('cd canyon && git branch');
                await execPromise('cd canyon && git config user.name "Travis Zhang"');
                await execPromise('cd canyon && git config user.email "wr.zhang25@gmail.com"');
                await execPromise('cd canyon && git add .');
                await execPromise(`cd canyon && git commit -m "${commitMessage}"`);
                await execPromise('cd canyon && git push origin dev-package-update:dev-package-update');
                
                // 清理目录
                const cleanupCommand = process.platform === 'win32' ? 'rmdir /s /q canyon' : 'rm -rf canyon';
                await execPromise(cleanupCommand);
                
                console.log('Git commit and push completed');
            } catch (error) {
                console.error('Error:', error);
                throw error;  // Rethrow the error if you need to handle it upstream
            }
        }

        await gitCommitAndPush(updatedPackages);
    } catch (e) {
        try {
            const cleanupCommand = process.platform === 'win32' ? 'rmdir /s /q canyon 2>nul || echo "Cleanup completed"' : 'rm -rf canyon || echo "Cleanup completed"';
            const { stdout, stderr } = await execPromise(cleanupCommand);
            console.log('Cleanup stdout:', stdout);
            if (stderr) {
                console.error('Cleanup stderr:', stderr);
            }
        } catch (error) {
            console.error('Cleanup Error:', error);
        }
    }
    await sleep(30*60*1000)
    // await sleep(1*1000)
}



// return
