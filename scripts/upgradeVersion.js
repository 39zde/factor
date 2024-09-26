import { readFileSync, writeFileSync } from 'fs';
const args = process.argv;
// relative to root
const packageJsonPath = './package.json';
const cargoTomlPath = './src-tauri/Cargo.toml';
const tauriDevConfPath = './src-tauri/conf/tauri.dev.conf.json';
const tauriProdConfPath = './src-tauri/conf/tauri.prod.conf.json';

const version = {
	major: 0,
	minor: 0,
	patch: 0,
};

const displayHelp = ()=> console.log(
	`

upgradeVersion.js
A help script to increase the the version numbers across all files
Scheme: a.b.c
--major overwrites --minor overwrites --patch
====================================
-h --help		Shows this message
--usage

-M --major     Increase the version to [a+1].0.0
-m --minor     Increase the version to a.[b+1].0
-p --patch     Increase the version to a.b.[c+1]

`)

const versionJsonMatcher = /(?<=\"version\"\:[\s]{0,}\")[\d]{1,}\.[\d]{1,}\.[\d]{1,}(?=\"\,)/gm;
const versionTomlMatcher = /(?<=version\s\=\s\")[\d]{1,}\.[\d]{1,}\.[\d]{1,}(?=\")/gm;

function main() {
	if(args.includes("-h") || args.includes("--help") || args.includes("--usage")){
		displayHelp()
	}else{
		if(args.includes("-M")||args.includes("-m")|| args.includes("-p")|| args.includes("--major")|| args.includes("--minor")|| args.includes("--patch")){
			const packageJsonFile = readFileSync(packageJsonPath, 'utf8');
			const currentVersion = packageJsonFile.match(versionJsonMatcher);
			if (currentVersion !== null) {
				const versions = currentVersion[0].split('.');
				version.major = parseInt(versions[0]);
				version.minor = parseInt(versions[1]);
				version.patch = parseInt(versions[2]);
				if (args.includes('--patch') || args.includes("-p")) {
					version.patch += 1;
				}
				if (args.includes('--minor') || args.includes("-m")) {
					version.minor += 1;
					version.patch = 0;
				}
				if (args.includes('--major') || args.includes("-M")) {
					version.major += 1;
					version.minor = 0;
					version.patch = 0;
				}
				const newVersion = `${version.major}.${version.minor}.${version.patch}`;
				const newPackageJsonFile = packageJsonFile.replace(versionJsonMatcher, newVersion);
				writeFileSync(packageJsonPath, newPackageJsonFile, 'utf8');
				const cargoTomlFile = readFileSync(cargoTomlPath, 'utf8');
				const newTauriDevConfigFile = cargoTomlFile.replace(versionTomlMatcher, newVersion);
				writeFileSync(cargoTomlPath, newTauriDevConfigFile, 'utf8');
				const tauriDevConfFile = readFileSync(tauriDevConfPath, 'utf8');
				const newTauriDevConfFile = tauriDevConfFile.replace(versionJsonMatcher, newVersion);
				writeFileSync(tauriDevConfPath, newTauriDevConfFile, 'utf8');
				const tauriProdConfFile = readFileSync(tauriProdConfPath, 'utf8');
				const newTauriProdConfFile = tauriProdConfFile.replace(versionJsonMatcher, newVersion);
				writeFileSync(tauriDevConfPath, newTauriProdConfFile, 'utf8');
			}
		}else{
			displayHelp()
		}
	}
}
main();
