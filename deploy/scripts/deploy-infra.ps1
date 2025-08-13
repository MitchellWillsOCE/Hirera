param(
  [string]$StackName = "hirera-dev",
  [string]$Region = "ap-southeast-2",
  [string]$EnvName = "dev",
  [string]$JobsTableName = "hirera-jobs",
  [string]$UsernameTableName = "hirera-usernames"
)

$Template = "$PSScriptRoot/../cloudformation/hirera-infra.yaml"

aws cloudformation deploy `
  --region $Region `
  --stack-name $StackName `
  --template-file $Template `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides `
    EnvironmentName=$EnvName `
    JobsTableName=$JobsTableName `
    UsernameTableName=$UsernameTableName

aws cloudformation describe-stacks --region $Region --stack-name $StackName `
  --query "Stacks[0].Outputs"


