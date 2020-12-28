import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';
import * as testee from '../src';

test('snapshot of Github Notifier', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  const notifier = new testee.GithubNotifier(stack, 'GH', {
    githubToken: cdk.SecretValue.plainText('DUMMY'),
  });

  const pipeline = new codepipeline.Pipeline(stack, 'Pipeline');

  const sourceArtifact = new codepipeline.Artifact();

  pipeline.addStage({
    stageName: 'Source',
    actions: [
      new actions.GitHubSourceAction({
        actionName: 'Source',
        oauthToken: cdk.SecretValue.plainText('DUMMY'),
        output: sourceArtifact,
        owner: 'dummy',
        repo: 'repo',
      }),
    ],
  });

  pipeline.addStage({
    stageName: 'Deploy',
    actions: [
      new actions.CloudFormationCreateUpdateStackAction({
        actionName: 'Deploy',
        adminPermissions: true,
        stackName: 'testStack',
        templatePath: sourceArtifact.atPath('test.json'),
      }),
    ],
  });

  notifier.onPipelineStateChange(pipeline, 'TestMessage');

  expect(app.synth().getStackArtifact(stack.artifactId).template).toMatchSnapshot();
});