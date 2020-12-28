import * as AWS from 'aws-sdk';

const codepipeline = new AWS.CodePipeline();

export interface CommitInfo {
  owner: string;
  repository: string;
  commitHash: string;
}

export function buildCodePipelineUrl(pipelineName: string, region: string) {
  return `https://${region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${pipelineName}/view?region=${region}`;
}

export async function getCommitInfo(pipelineName: string, executionId: string): Promise<CommitInfo> {
  const params = {
    pipelineName: pipelineName,
    pipelineExecutionId: executionId,
  };

  const result = await codepipeline.getPipelineExecution(params).promise();

  if (!result.pipelineExecution || !result.pipelineExecution.artifactRevisions || result.pipelineExecution.artifactRevisions.length !== 1) {
    throw new Error('Cannot determine commit hash');
  }
  const artifactRevision = result.pipelineExecution.artifactRevisions[0];

  if (!artifactRevision.revisionUrl || !artifactRevision.revisionId) {
    throw new Error('Cannot determine commit hash');
  }
  const revisionURL = artifactRevision.revisionUrl;
  const sha = artifactRevision.revisionId;

  const pattern = /github.com\/(.+)\/(.+)\/commit\//;
  const matches = pattern.exec(revisionURL);

  if (!matches || matches?.length < 3) {
    throw new Error('RevisionURL has an invalid format');
  }

  return {
    owner: matches[1],
    repository: matches[2],
    commitHash: sha,
  };
};
