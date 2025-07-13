import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function findPackageJsonFiles(dir, fileList = []) {
    const files = await readdir(dir);

    for (const file of files) {
        const filePath = join(dir, file);
        const fileStat = await stat(filePath);

        if (fileStat.isDirectory() && file !== 'node_modules') {
            await findPackageJsonFiles(filePath, fileList);
        } else if (file === 'package.json') {
            fileList.push(filePath);
        }
    }

    return fileList;
}


export async function getLatestVersion(packageName) {
    const url = `https://registry.npmjs.org/${packageName}?t=${Math.random()}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch package data: ${response.statusText},${packageName}`);
        }
        const data = await response.json();
        const latestVersion = data['dist-tags'].latest;
        console.log(latestVersion,'latestVersion')
        return latestVersion;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
