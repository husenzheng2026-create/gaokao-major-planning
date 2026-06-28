import type { NextConfig } from 'next';

const githubPagesRepoName = 'gaokao-major-planning';
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  output: isGitHubPagesBuild ? 'export' : undefined,
  trailingSlash: isGitHubPagesBuild,
  basePath: isGitHubPagesBuild ? `/${githubPagesRepoName}` : undefined,
  assetPrefix: isGitHubPagesBuild ? `/${githubPagesRepoName}/` : undefined
};

export default nextConfig;
