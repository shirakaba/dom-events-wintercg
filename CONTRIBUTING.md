# Contributing

## Setting up the repo

```sh
git clone git@github.com:shirakaba/dom-events-wintercg.git
cd dom-events-wintercg
npm install
```

## Running the tests

```sh
npm run test

# Or, in watch mode:
npm run test -- --watch
```

## Linting and formatting

Any PRs made to the repo should be properly formatted and raise no linting errors.

Upon opening this repo in VS Code, you should automatically be recommended to install the Eslint and Prettier IDE extensions: [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [esbenp.prettier-vscode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

I personally enable `editor.formatOnSave` so that my code is prettified upon save, and I have a keyboard shortcut set up for applying linting autofixes (`eslint.executeAutofix`). But you can alternatively run these upon:

```sh
npm run format
npm run lint

# Or, applying autofixes:
npm run lint -- --fix
```

## Versioning

We follow [semver](https://semver.org) in lockstep with Node.js.

- The major number will reflect which version of the Node.js internals the code is derived from (e.g. `21.x.x` if derived from Node.js `21.7.1`).
- The minor number will likely always be fixed to `0` (given that both the API and implementation should be pretty stable), but we'll see whether it ever makes sense to increment it.
- The patch number will freely increment.

## Coding philosophy

As this repo extracts code from Node.js core, we want to minimise the difference between the copied Node.js core code and our own to make it easier to adopt any future upstream changes. Hence, our linting and formatting configurations derive from theirs, and we avoid refactoring code unnecessarily.
