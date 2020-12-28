import * as fs from 'fs';
import * as path from 'path';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdajs from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';

export interface GithubNotifierProps {
  readonly githubToken: cdk.SecretValue;
}

export class GithubNotifier extends cdk.Construct {

  private readonly eventHandler: lambdajs.NodejsFunction;

  constructor(scope: cdk.Construct, id: string, props: GithubNotifierProps) {
    super(scope, id);

    const entry = fs.existsSync(path.join(__dirname, 'lambda', 'index.ts'))
      ? path.join(__dirname, 'lambda', 'index.ts') // local development
      : path.join(__dirname, 'lambda', 'index.js'); // when published in npm

    this.eventHandler = new lambdajs.NodejsFunction(this, 'Resource', {
      entry,
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(5),
      environment: {
        GITHUB_TOKEN: props.githubToken.toString(),
      },
      bundling: {
        minify: true,
      },
    });
    this.eventHandler.addToRolePolicy(new iam.PolicyStatement({
      actions: ['codepipeline:GetPipelineExecution'],
      resources: ['*'],
    }));
  }

  public onPipelineStateChange(pipeline: codepipeline.Pipeline, stateContext?: string) {
    pipeline.onStateChange('PipelineStateChange', {
      target: new targets.LambdaFunction(this.eventHandler, {
        event: events.RuleTargetInput.fromObject({
          event: events.EventField.fromPath('$'),
          context: {
            stateContext: stateContext ?? 'CodePipeline',
          },
        }),
      }),
    });
  }

  public onStageStateChange(stage: codepipeline.IStage, stateContext?: string) {
    stage.onStateChange('StageStateChange', new targets.LambdaFunction(this.eventHandler, {
      event: events.RuleTargetInput.fromObject({
        event: events.EventField.fromPath('$'),
        context: {
          stateContext: stateContext ?? `CodePipeline-${stage.stageName}`,
        },
      }),
    }));
  }

  public onActionStateChange(action: codepipeline.IAction, stateContext: string) {
    action.onStateChange('ActionStateChange', new targets.LambdaFunction(this.eventHandler, {
      event: events.RuleTargetInput.fromObject({
        event: events.EventField.fromPath('$'),
        context: {
          stateContext,
        },
      }),
    }));
  }

}