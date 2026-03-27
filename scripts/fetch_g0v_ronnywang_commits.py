#!/usr/bin/env python3
"""
Fetch all commits by ronnywang in g0v org via GitHub search API.
Rate limit: 10 requests/minute without token.
Sleep 7 seconds between requests.
"""

import json
import time
import urllib.request
import urllib.error
from collections import defaultdict
from pathlib import Path

OUTPUT_FILE = "/Users/wangxiangrong/work/ronny-github/data/g0v-ronnywang-repos.json"
SLEEP_BETWEEN_REQUESTS = 1  # seconds (faster with token: 5000 req/hr)

# Read token from .env
def load_token():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("GITHUB_TOKEN="):
                return line.split("=", 1)[1].strip()
    return None

GITHUB_TOKEN = load_token()

def make_request(url):
    """Make a GitHub API request and return (data, rate_limit_remaining)."""
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github.cloak-preview+json")
    req.add_header("User-Agent", "ronnywang-g0v-research-script")
    if GITHUB_TOKEN:
        req.add_header("Authorization", f"token {GITHUB_TOKEN}")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            rate_remaining = int(resp.headers.get("X-RateLimit-Remaining", 99))
            data = json.loads(resp.read())
            return data, rate_remaining
    except urllib.error.HTTPError as e:
        body = e.read()
        print(f"  HTTP Error {e.code}: {body[:200]}")
        raise

def fetch_all_commits():
    """Fetch all commits by ronnywang in g0v org, paginating through results."""
    commits = []
    page = 1
    total_count = None

    while True:
        url = f"https://api.github.com/search/commits?q=author:ronnywang+org:g0v&per_page=100&page={page}"
        print(f"Fetching page {page}... URL: {url}")

        data, rate_remaining = make_request(url)

        if total_count is None:
            total_count = data.get("total_count", 0)
            print(f"  Total commits found by search API: {total_count}")

        items = data.get("items", [])
        print(f"  Got {len(items)} commits (rate remaining: {rate_remaining})")

        if not items:
            break

        commits.extend(items)

        # Check if we've gotten all available results (max 1000 = 10 pages)
        if len(items) < 100 or page >= 10:
            break

        # Rate limit check
        if rate_remaining <= 5:
            print(f"  Rate limit low ({rate_remaining} remaining). Sleeping 60 seconds...")
            time.sleep(60)
        else:
            time.sleep(SLEEP_BETWEEN_REQUESTS)

        page += 1

    print(f"\nTotal commits collected: {len(commits)} (API reported total: {total_count})")
    incomplete = total_count > len(commits) if total_count else False
    return commits, total_count, incomplete

def count_commits_by_repo(commits):
    """Count commits per repo."""
    repo_counts = defaultdict(int)
    for commit in commits:
        repo_full_name = commit.get("repository", {}).get("full_name", "unknown")
        repo_counts[repo_full_name] += 1
    return dict(sorted(repo_counts.items(), key=lambda x: x[1], reverse=True))

def fetch_repo_metadata(repo_full_name):
    """Fetch repo metadata: description, stars, language."""
    url = f"https://api.github.com/repos/{repo_full_name}"
    print(f"  Fetching metadata for {repo_full_name}...")
    try:
        data, rate_remaining = make_request(url)
        time.sleep(SLEEP_BETWEEN_REQUESTS)
        if rate_remaining <= 2:
            print(f"  Rate limit low ({rate_remaining} remaining). Sleeping 60 seconds...")
            time.sleep(60)
        return {
            "description": data.get("description", ""),
            "stars": data.get("stargazers_count", 0),
            "language": data.get("language", None),
        }, rate_remaining
    except Exception as e:
        print(f"  Error fetching metadata for {repo_full_name}: {e}")
        time.sleep(SLEEP_BETWEEN_REQUESTS)
        return {"description": "", "stars": 0, "language": None}, 99

def fetch_contributor_rank(repo_full_name, username="ronnywang"):
    """Fetch contributor ranking for ronnywang in a repo."""
    url = f"https://api.github.com/repos/{repo_full_name}/contributors?per_page=100"
    print(f"  Fetching contributors for {repo_full_name}...")
    try:
        data, rate_remaining = make_request(url)
        time.sleep(SLEEP_BETWEEN_REQUESTS)
        if rate_remaining <= 2:
            print(f"  Rate limit low ({rate_remaining} remaining). Sleeping 60 seconds...")
            time.sleep(60)

        for i, contributor in enumerate(data, 1):
            if contributor.get("login", "").lower() == username.lower():
                return i, contributor.get("contributions", 0), rate_remaining
        return None, 0, rate_remaining
    except Exception as e:
        print(f"  Error fetching contributors for {repo_full_name}: {e}")
        time.sleep(SLEEP_BETWEEN_REQUESTS)
        return None, 0, 99

def main():
    print("=" * 60)
    print("Fetching ronnywang commits in g0v org")
    print("=" * 60)

    # Step 1: Fetch all commits
    commits, total_count, incomplete = fetch_all_commits()

    # Step 2: Count commits per repo
    print("\n" + "=" * 60)
    print("Counting commits per repo...")
    repo_counts = count_commits_by_repo(commits)

    print(f"\nFound {len(repo_counts)} repos")
    print("\nTop 15 repos by commit count:")
    for i, (repo, count) in enumerate(list(repo_counts.items())[:15], 1):
        print(f"  {i:2d}. {repo}: {count} commits")

    # Step 3: Fetch metadata for all repos
    print("\n" + "=" * 60)
    print("Fetching repo metadata...")

    results = []
    repos_list = list(repo_counts.items())

    for i, (repo_full_name, commit_count) in enumerate(repos_list):
        print(f"\n[{i+1}/{len(repos_list)}] {repo_full_name} ({commit_count} commits)")

        metadata, _ = fetch_repo_metadata(repo_full_name)

        result = {
            "repo": repo_full_name,
            "commits_by_ronnywang": commit_count,
            "description": metadata["description"],
            "stars": metadata["stars"],
            "language": metadata["language"],
        }
        results.append(result)

    # Step 4: Check contributor rankings for top 5 repos
    print("\n" + "=" * 60)
    print("Checking contributor rankings for top 5 repos...")

    top5_repos = results[:5]
    for result in top5_repos:
        repo = result["repo"]
        rank, total_contrib_commits, _ = fetch_contributor_rank(repo)
        if rank:
            print(f"  {repo}: ronnywang is rank #{rank} contributor (API: {total_contrib_commits} commits)")
            result["contributor_rank"] = rank
            result["total_commits_in_repo"] = total_contrib_commits
        else:
            print(f"  {repo}: ronnywang not found in top contributors list")
            result["contributor_rank"] = None

    # Step 5: Save results
    print("\n" + "=" * 60)
    print(f"Saving results to {OUTPUT_FILE}...")

    Path(OUTPUT_FILE).parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(results)} repos to {OUTPUT_FILE}")

    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total repos found: {len(results)}")
    print(f"Total commits collected: {len(commits)}")
    print(f"Total commits reported by API: {total_count}")
    if incomplete:
        print(f"NOTE: Search API returned only {len(commits)} of {total_count} commits.")
        print("      Some repos may have more commits than shown (search API max is 1000).")

    print("\nTop 10 repos by commits from ronnywang:")
    for i, result in enumerate(results[:10], 1):
        rank_info = f" [rank #{result.get('contributor_rank', '?')}]" if 'contributor_rank' in result else ""
        print(f"  {i:2d}. {result['repo']}: {result['commits_by_ronnywang']} commits{rank_info}")
        if result.get('description'):
            desc = result['description']
            if len(desc) > 60:
                desc = desc[:57] + "..."
            print(f"      {desc}")

    print("\nDone!")

if __name__ == "__main__":
    main()
