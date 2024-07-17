# Bookmrkx Extension

Browser Extension to manage...

# Features

* todo

# Quick Installation (to run the chrome extension locally)

## Prerequisities

### node (20), 

see https://nodejs.org/en/download/package-manager

### yarn: 

npm install --global yarn

## Initial installation

Open a terminal, navigate to your projects root folder and run 

```bash
git clone --recurse-submodules https://github.com/evandor/bibbly-extension.git
cd bibbly-extension
./updateAndBuild.sh
```

Open chrome://extensions/ in chrome, and activate "developer mode".
Then, on the left, click "Load unpacked extension", navigate to the bibbly-extensions folder and pick the "dist/bex" subfolder.

# To be done

## Install the dependencies

make sure you added the submodules: in the root folder, run

```
git submodule add -b main https://github.com/evandor/submodule-content.git src/content
git submodule add -b main https://github.com/evandor/submodule-core.git src/core
git submodule add -b main https://github.com/evandor/submodule-features.git src/features
```

This has to be done once only.

Hint: running into something like "fatal: 'src/core' already exists in the index" can be fixed with

git rm --cached src/core

```bash
yarn install
```
or
```bash
npm install
```

