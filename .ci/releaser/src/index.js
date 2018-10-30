const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const cmd = require("node-cmd");
const axios = require("axios");
const consola = require("consola");

const runScript = script => {
  return new Promise((resolve, reject) => {
    cmd.get(script, (err, stdout, stderr) => {
      if (err) {
        return reject(Error(stderr));
      }

      resolve({ stdout, stderr });
    });
  });
};

const COMMIT = process.env.TRAVIS_COMMIT;
const REPO_SLUG = process.env.TRAVIS_REPO_SLUG;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!COMMIT || !REPO_SLUG || !GITHUB_USERNAME || !GITHUB_TOKEN) {
  consola.fatal("Missing environment variable");
  process.exit(1);
}

const BUMP_TYPE = {
  MAJOR: 3,
  MINOR: 2,
  PATCH: 1,
  NONE: 0
};

const BUMP_TYPE_PER_PREFIX = {
  breaking: BUMP_TYPE.MAJOR,
  feature: BUMP_TYPE.MINOR,
  fix: BUMP_TYPE.PATCH
};

const DRY_RUN_FLAG = "--dry-run";

const RELEASE_MARKER = "[release]";
const DEPLOYMENT_BRANCH = "test-releaser";
const SOURCE_BRANCH = "develop";

const VERSION_REGEX = /<!--VERSION-->(.+)<!--VERSION-->/;
const SOURCE_COMMIT_REGEX = /<!--GENERATED FROM COMMIT ([0-9a-f]{40})-->/;
const generateSourceCommitComment = commit =>
  `<!--GENERATED FROM COMMIT ${commit}-->`;

const OUTPUT_DIR = path.resolve(os.tmpdir(), `homie-${new Date().getTime()}`);
const ROOT_DIR = path.join(__dirname, "../../../");

async function getLatestVersion(repoSlug) {
  const res = await axios.get(
    `https://api.github.com/repos/${repoSlug}/releases/latest`
  );

  return res.data.tag_name.slice(1);
}

async function getLatestConvention(repoSlug) {
  const res = await axios.get(
    `https://raw.githubusercontent.com/${repoSlug}/${DEPLOYMENT_BRANCH}/README.md`
  );

  return res.data;
}

function getSourceCommitFromConvention(convention) {
  const result = SOURCE_COMMIT_REGEX.exec(convention);

  if (!result) {
    throw new Error("Cannot find source commit");
  }

  return result[1];
}

async function getCommits(repoSlug, fromCommitish, toCommitish) {
  const res = await axios.get(
    `https://api.github.com/repos/${repoSlug}/compare/${fromCommitish}...${toCommitish}`
  );

  const commits = res.data.commits.map(el => {
    const splitted = el.commit.message.split("\n\n");
    const subject = splitted.shift();
    const body = splitted.join("\n\n");

    return {
      sha: el.sha,
      subject,
      body
    };
  });

  return commits;
}

function analyzeCommits(commits) {
  return commits.map(commit => {
    const prefix = commit.subject.split(":", 1)[0].toLowerCase();
    let bumpType = BUMP_TYPE_PER_PREFIX[prefix];

    if (!bumpType) {
      bumpType = BUMP_TYPE.NONE;
    }

    const release = commit.body.includes(RELEASE_MARKER);

    return {
      commit,
      bumpType,
      release
    };
  });
}

function getBumpType(analyzedCommits) {
  return Math.max(...analyzedCommits.map(el => el.bumpType));
}

function bumpVersion(version, bumpType) {
  const parts = version.split(".");

  if (bumpType === BUMP_TYPE.MAJOR) {
    parts[0]++;
  } else if (bumpType === BUMP_TYPE.MAJOR) {
    parts[1]++;
  } else if (bumpType === BUMP_TYPE.PATCH) {
    parts[2]++;
  }

  return parts.join(".");
}

function generateChangelog(analyzedCommits) {
  const breakingChanges = [];
  const featureChanges = [];
  const fixChanges = [];

  for (const commit of analyzedCommits) {
    let changes;
    if (commit.bumpType === BUMP_TYPE.MAJOR) {
      changes = breakingChanges;
    } else if (commit.bumpType === BUMP_TYPE.MINOR) {
      changes = featureChanges;
    } else if (commit.bumpType === BUMP_TYPE.PATCH) {
      changes = fixChanges;
    }

    changes.push(commit.commit);
  }

  const changeTypes = [
    ["BREAKING CHANGES", breakingChanges],
    ["Features", featureChanges],
    ["Fixes", fixChanges]
  ];

  const changelog = [];
  for (const type of changeTypes) {
    const title = type[0];
    const changes = type[1];

    if (changes.length === 0) {
      continue;
    }

    changelog.push("## " + title);

    const innerChangelog = [];
    for (const change of changes) {
      innerChangelog.push(`* ${change.subject} (${change.sha})`);
    }
    changelog.push(innerChangelog.join("\n"));
  }

  return changelog.join("\n\n");
}

async function build(version, sourceCommitSha) {
  const sourceConvention = await fs.readFile(
    path.join(ROOT_DIR, "README.md"),
    "utf8"
  );
  let builtConvention = `
${generateSourceCommitComment(sourceCommitSha)}
${sourceConvention.replace(VERSION_REGEX, version)}
`.trim();

  await fs.outputFile(path.join(OUTPUT_DIR, "README.md"), builtConvention);
  await fs.copy(
    path.join(ROOT_DIR, "LICENSE"),
    path.join(OUTPUT_DIR, "LICENSE")
  );
}

async function deployToGit(
  version,
  targetBranch,
  repoSlug,
  username,
  password
) {
  const { stdout } = await runScript(`
    pushd ${OUTPUT_DIR}
    git init
    git config --global user.name "travis@travis-ci.org"
    git config --global user.email "Travis CI"
    git remote add origin https://{${username}:${password}@github.com/${repoSlug}
    git add .
    git commit -m "Release v${version}"
    git push -f origin master:${targetBranch}
    popd
  `);
  console.log(stdout);
}

async function createGithubRelease(version, commitish, changelog) {
  const res = await axios.post(
    `https://api.github.com/repos/${repoSlug}/releases`,
    {
      tag_name: "v" + version,
      target_commitish: commitish,
      name: "v" + version,
      body: changelog,
      draft: false,
      prerelease: false
    },
    {
      headers: {
        Authorization: "token " + GITHUB_TOKEN
      }
    }
  );
}

async function main() {
  const args = process.argv.slice(2);

  consola.start("Starting");
  const latestVersion = await getLatestVersion(REPO_SLUG);
  consola.info(`Latest version: ${latestVersion}`);
  const latestConvention = await getLatestConvention(REPO_SLUG);
  const latestConventionSourceCommit = getSourceCommitFromConvention(
    latestConvention
  );
  consola.info(`Latest source commit SHA: ${latestConventionSourceCommit}`);

  const commits = await getCommits(
    REPO_SLUG,
    latestConventionSourceCommit,
    SOURCE_BRANCH
  );
  consola.info("Commits since latest version", JSON.stringify(commits));
  const analyzedCommits = analyzeCommits(commits);
  const shouldRelease =
    analyzedCommits.find(commit => commit.release) !== undefined;

  if (!shouldRelease) {
    consola.success("No release marker found");
    return;
  }

  const bumpType = await getBumpType(analyzedCommits);

  if (bumpType === BUMP_TYPE.NONE) {
    consola.warn("No bump needed, will not release");
    return;
  }

  const targetVersion = bumpVersion(latestVersion, bumpType);
  consola.info(`Target version: ${targetVersion}`);

  const changelog = generateChangelog(analyzedCommits);
  await build(targetVersion, COMMIT);

  if (args.includes(DRY_RUN_FLAG)) {
    consola.info("Dry run, the generated CHANGELOG.md would be:");
    console.log(changelog);
  } else {
    consola.info(`Deploying to git`);
    await deployToGit(
      targetVersion,
      DEPLOYMENT_BRANCH,
      REPO_SLUG,
      GITHUB_USERNAME,
      GITHUB_TOKEN
    );
    consola.info(`Creating GitHub release`);
    await createGithubRelease(targetVersion, DEPLOYMENT_BRANCH, changelog);
    consola.success("Success");
  }
}

const cleanup = () => fs.remove(OUTPUT_DIR);

main()
  .then(cleanup)
  .catch(async err => {
    consola.fatal(err);
    await cleanup();
  });
