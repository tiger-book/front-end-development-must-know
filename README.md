# 书籍在线

## github action 部署问题

- github action`Action failed with "The process '/usr/bin/git' failed with exit code 128"`
  
  - 搜索得到如下解释
    
    - 默认情况下，新存储库没有适当的工作流权限。
    
    解决办法
    
    - 转到存储库**Setting**
    - 选择**Actions**>>>**General**
    - 在"工作流权限(Workflow permissions)"中，选择`Read and write permissions`
    
    > 但是不是我这个部署失败的原因，点开发现里面是权限问题 403 了，不知道为啥 secrets.GITHUB_TOKEN 不能用来部署组织的仓库，明明提交代码都没得问题
    ```
    remote: Permission to tiger-book/front-end-development-must-know.git denied to github-actions[bot].
    fatal: unable to access 'https://github.com/tiger-book/front-end-development-must-know.git/': The requested URL returned error: 403
    ```
    
  - 查询发现组织下的仓库默认的`GITHUB_TOKEN`权限是只读的，没有写入权限，可见[为组织设置 `GITHUB_TOKEN` 的权限](https://docs.github.com/zh/enterprise-cloud@latest/organizations/managing-organization-settings/disabling-or-limiting-github-actions-for-your-organization#restrictions-and-behaviors-for-the-source-repository)
  
    解决办法有2种
  
    1. 通过在 GitHub.com 的右上角，单击你的个人资料照片，然后单击“你的组织”，在“工作流权限”下，选择是要让 `GITHUB_TOKEN` 对所有范围具有读写访问权限
    2. 通过编辑工作流文件中的 `permissions` 键来修改授予 `GITHUB_TOKEN` 的权限

## vercel 部署

> 部署组织下的仓库需要收费，可以免费体验 14 天
> Your trial expires in 14 days. To maintain access to premium features, upgrade to Pro.
