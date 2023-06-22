# spark
SP Retrieval Checker Module

- [Roadmap](https://pl-strflt.notion.site/SPARK-Roadmap-ac729c11c49b409fbec54751d1bc6c8a)
- [API](https://github.com/filecoin-station/spark-api)

## Development

Install [Zinnia CLI](https://github.com/filecoin-station/zinnia).

```bash
$ # Lint
$ npx standard
$ # Run module
$ zinnia run main.js
$ # Test module
$ zinnia run test.js
```

## Release

On a clean working tree, first bump semver `SPARK_VERSION` in `lib/constants.js`.
Then, replacing `$SPARK_VERSION` with the new `SPARK_VERSION`:

```bash
$ git add .
$ git commit -m v$SPARK_VERSION
$ git tag -s v$SPARK_VERSION -m v$SPARK_VERSION
$ git push
$ git push origin v$SPARK_VERSION 
```

Go to GitHub releases and create a new release for the tag you just created.
Use GitHub's changelog feature to fill out the release message.
