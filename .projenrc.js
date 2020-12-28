const { TaimosCdkConstructLibrary } = require('@taimos/projen');

const project = new TaimosCdkConstructLibrary({
  name: '@taimos/cdk-construct-github-notifier',
  authorAddress: 'info@taimos.de',
  authorName: 'Taimos GmbH',
  cdkVersion: '1.80.0',
  devDeps: [
    '@taimos/projen',
    'esbuild',
  ],
  bundledDeps: [
    'axios',
    'aws-sdk',
  ],
  repository: 'https://github.com/taimos/cdk-construct-github-notifier.git',
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-codepipeline',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
  ],
  cdkTestDependencies: [
    '@aws-cdk/aws-codepipeline-actions',
  ],
});

project.synth();
