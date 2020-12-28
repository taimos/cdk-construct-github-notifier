# API Reference

**Classes**

Name|Description
----|-----------
[GithubNotifier](#taimos-cdk-construct-github-notifier-githubnotifier)|*No description*


**Structs**

Name|Description
----|-----------
[GithubNotifierProps](#taimos-cdk-construct-github-notifier-githubnotifierprops)|*No description*



## class GithubNotifier 🔹 <a id="taimos-cdk-construct-github-notifier-githubnotifier"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new GithubNotifier(scope: Construct, id: string, props: GithubNotifierProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[GithubNotifierProps](#taimos-cdk-construct-github-notifier-githubnotifierprops)</code>)  *No description*
  * **githubToken** (<code>[SecretValue](#aws-cdk-core-secretvalue)</code>)  *No description* 


### Methods


#### onPipelineStateChange(pipeline, stateContext)🔹 <a id="taimos-cdk-construct-github-notifier-githubnotifier-onpipelinestatechange"></a>



```ts
onPipelineStateChange(pipeline: Pipeline, stateContext: string): void
```

* **pipeline** (<code>[Pipeline](#aws-cdk-aws-codepipeline-pipeline)</code>)  *No description*
* **stateContext** (<code>string</code>)  *No description*






## struct GithubNotifierProps 🔹 <a id="taimos-cdk-construct-github-notifier-githubnotifierprops"></a>






Name | Type | Description 
-----|------|-------------
**githubToken**🔹 | <code>[SecretValue](#aws-cdk-core-secretvalue)</code> | <span></span>



