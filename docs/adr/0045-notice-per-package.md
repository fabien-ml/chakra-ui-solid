# Every published package ships a `NOTICE.md` from its first commit

There is one section per upstream we read, and an empty table is a statement, not an absence. Only the package's own `NOTICE.md` travels in the npm tarball, and it is the only one a consumer who never visits the repository will see, so a single root file is not enough. The package check requires `LICENSE` and `NOTICE.md` in `files` and on disk from the first commit, so the file cannot wait for the package's first derivative; its table starts empty by fact.

Dependencies installed from npm owe nothing beyond their own license, and a read-only reference from which no source is reproduced leaves its section tableless.
